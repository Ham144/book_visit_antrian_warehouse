import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ResponseBookingDto } from './dto/response-booking.dto';
import {
  BookingStatus,
  Days,
  DragAndDropPayload,
  ROLE,
} from 'src/common/shared-enum';
import { DockBusyTime, Prisma } from '@prisma/client';
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { BookingFilter } from 'src/common/shared-interface';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingWarehouseService {
  constructor(private readonly prismaService: PrismaService) {}

  private mapDayIndexToEnum(dayIndex: number): string {
    const dayMapping = [
      Days.SENIN, // 1 = Monday
      Days.SELASA, // 2 = Tuesday
      Days.RABU, // 3 = Wednesday
      Days.KAMIS, // 4 = Thursday
      Days.JUMAT, // 5 = Friday
      Days.SABTU, // 6 = Saturday
      Days.MINGGU, // 0 = Sunday
    ];
    return dayMapping[dayIndex];
  }

  private isBookingConflict(bookingDate: Date, busy: DockBusyTime): boolean {
    const b = bookingDate;

    // MONTHLY → cek tanggal
    if (busy.recurring === 'MONTHLY') {
      return b.getDate() === busy.recurringStep;
    }

    // WEEKLY → cek hari
    if (busy.recurring === 'WEEKLY') {
      const bookingDay = b.getDay(); // 0=Sun ... 6=Sat
      const bookingDayStr = this.mapDayIndexToEnum(bookingDay);
      return busy.recurringCustom.includes(bookingDayStr);
    }

    // DAILY → cek step
    if (busy.recurring === 'DAILY') {
      const start = new Date(busy.from);
      // beda hari dari start → hitung kelipatan
      const diffDays = Math.floor(
        (b.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );

      return diffDays >= 0 && diffDays % busy.recurringStep === 0;
    }

    return false;
  }

  private checkTimeCollisions(
    startTime: number,
    durationHours: number,
    events: Array<{ start: number; end: number }>,
  ): boolean {
    const endTime = startTime + durationHours;
    for (const event of events) {
      if (startTime < event.end && endTime > event.start) {
        return true;
      }
    }
    return false;
  }

  private async getApplicableBusyTimesForDate(
    dockId: string,
    date: Date,
  ): Promise<DockBusyTime[]> {
    const allBusyTimes = await this.prismaService.dockBusyTime.findMany({
      where: { dockId },
    });

    const dayEnum = this.mapDayIndexToEnum(date.getDay());

    return allBusyTimes.filter((bt) => {
      if (bt.recurring === 'DAILY') return true;
      if (bt.recurring === 'WEEKLY') {
        return bt.recurringCustom.includes(dayEnum);
      }
      if (bt.recurring === 'MONTHLY') {
        return date.getDate() === bt.recurringStep;
      }
      return false;
    });
  }

  private async getScheduleForDockDay(
    dockId: string,
    date: Date,
  ): Promise<{ startHour: number; endHour: number }> {
    const dayEnum = this.mapDayIndexToEnum(date.getDay());

    const vacant = await this.prismaService.vacant.findUnique({
      where: {
        dockId_day: {
          dockId,
          day: dayEnum,
        },
      },
    });

    if (vacant && vacant.availableFrom && vacant.availableUntil) {
      const startHour = this.parseTimeToHours(vacant.availableFrom);
      const endHour = this.parseTimeToHours(vacant.availableUntil);

      if (startHour !== null && endHour !== null) {
        return { startHour, endHour };
      }
    }

    // Fallback to default 06:00-18:00
    return { startHour: 6, endHour: 18 };
  }

  //user|admin organization
  async justifyBooking(id: string, updateDto: UpdateBookingDto) {
    const { arrivalTime, dockId } = updateDto;

    // Get existing booking
    const existingBooking = await this.prismaService.booking.findUnique({
      where: { id },
      include: {
        Vehicle: true,
      },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking dengan id ${id} tidak ditemukan`);
    }

    // Use provided values or fallback to existing values

    // Helper function to convert HH:MM to minutes
    function HHMM_to_minutes(hhmm: string): number {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    }
    const newDockId = dockId || existingBooking.dockId;
    const newArrivalTime = new Date(arrivalTime);
    const newEstimatedFinishTime = new Date(
      newArrivalTime.getTime() + existingBooking.Vehicle.durasiBongkar * 60000,
    );

    const bookingFrom =
      newArrivalTime.getHours() * 60 + newArrivalTime.getMinutes();
    const bookingTo =
      newEstimatedFinishTime.getHours() * 60 +
      newEstimatedFinishTime.getMinutes();

    // Check busy times overlap
    const busyTimes = await this.prismaService.dockBusyTime.findMany({
      where: { dockId: newDockId },
    });

    const overLapIdx = busyTimes.findIndex((busy) => {
      const busyFrom = HHMM_to_minutes(busy.from);
      const busyTo = HHMM_to_minutes(busy.to);
      const isTimeOverlap = busyFrom < bookingTo && busyTo > bookingFrom;

      if (!isTimeOverlap) return false;

      // Check recurring pattern
      return this.isBookingConflict(newArrivalTime, busy);
    });

    if (overLapIdx !== -1) {
      throw new BadRequestException(
        `Waktu terkait overlap busy time ${busyTimes[overLapIdx].reason}, antara ${busyTimes[overLapIdx].from} sampai ${busyTimes[overLapIdx].to}`,
      );
    }

    // Check vehicle type compatibility with dock
    const allowedTypesSuccess = await this.prismaService.dock.findFirst({
      where: {
        id: newDockId,
        allowedTypes: {
          has: existingBooking.Vehicle.vehicleType,
        },
      },
    });

    if (!allowedTypesSuccess) {
      throw new BadRequestException(
        'tipe kendaraan tidak didukung di gate ini',
      );
    }

    // Check overlap with other bookings (excluding current booking)
    const overlapDockedHour = await this.prismaService.booking.findFirst({
      where: {
        dockId: newDockId,
        id: { not: id },
        status: { not: 'CANCELED' },
        AND: [
          {
            arrivalTime: {
              lt: newEstimatedFinishTime, // booking lain mulai sebelum booking ini selesai
            },
          },
          {
            arrivalTime: {
              gt: new Date(
                newArrivalTime.getTime() -
                  existingBooking.Vehicle.durasiBongkar * 60_000,
              ),
            },
          },
        ],
      },
    });

    if (overlapDockedHour) {
      throw new BadRequestException(
        `Waktu terkait overlap dengan booking ${overlapDockedHour.code}, antara ${overlapDockedHour.arrivalTime} sampai ${overlapDockedHour.estimatedFinishTime}`,
      );
    }

    // Update booking
    const updatedBooking = await this.prismaService.booking.update({
      where: { id },
      data: {
        arrivalTime: newArrivalTime,
        estimatedFinishTime: newEstimatedFinishTime,
        dockId: newDockId,
      },
      include: {
        Vehicle: true,
        Warehouse: true,
        Dock: true,
        driver: true,
      },
    });

    return plainToInstance(ResponseBookingDto, updatedBooking, {
      excludeExtraneousValues: true,
      groups: ['detail'],
    });
  }

  //user|admin organization
  async dragAndDrop(id: string, payload: DragAndDropPayload) {
    /* ======================================
     * 1. VALIDASI DASAR & AMBIL DATA
     * ====================================== */
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
      include: {
        Vehicle: true,
        Warehouse: true,
        Dock: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (!booking.dockId && !payload.dockId) {
      throw new BadRequestException('Dock ID diperlukan untuk drag and drop');
    }
    console.log('payload: ', payload);

    const { action, toStatus, dockId, relativePositionTarget } = payload;
    const targetDockId = dockId ?? booking.dockId;

    /* ======================================
     * 2. VALIDASI TIPE KENDARAAN DENGAN DOCK
     * ====================================== */
    if (targetDockId !== booking.dockId) {
      const dock = await this.prismaService.dock.findUnique({
        where: { id: targetDockId },
      });

      if (!dock) {
        throw new BadRequestException('Dock tidak ditemukan');
      }

      if (!dock.allowedTypes.includes(booking.Vehicle.vehicleType)) {
        throw new BadRequestException(
          `Tipe kendaraan ${booking.Vehicle.vehicleType} tidak didukung di gate ${dock.name}`,
        );
      }
    }

    /* ======================================
     * 3. HANDLE STATUS CANCELED (SIMPLE)
     * ====================================== */
    if (toStatus === 'CANCELED') {
      await this.prismaService.booking.update({
        where: { id },
        data: {
          status: 'CANCELED',
          actualFinishTime: new Date(),
        },
      });
      return { success: true };
    }

    /* ======================================
     * 5. AMBIL ANTRIAN YANG ADA (HANYA IN_PROGRESS)
     * ====================================== */

    // Gunakan scheduleQueryDate untuk existingQueue juga
    let scheduleQueryDate: Date;
    const effectiveDate = scheduleQueryDate;
    const existingQueue = await this.prismaService.booking.findMany({
      where: {
        dockId: targetDockId,
        status: toStatus,
        id: { not: booking.id },
        arrivalTime: {
          gte: new Date(effectiveDate.setHours(0, 0, 0, 0)),
          lt: new Date(effectiveDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: { Vehicle: true },
      orderBy: { arrivalTime: 'asc' },
    });

    /* ======================================
     * 4. TENTUKAN TANGGAL EFEKTIF & AMBIL SCHEDULE
     * ====================================== */
    // Tentukan tanggal untuk query schedule

    // Untuk kasus LAST dengan antrian kosong, gunakan hari ini
    if (payload.relativePositionTarget?.bookingId === 'LAST') {
      if (existingQueue.length > 0) {
        scheduleQueryDate = new Date(
          existingQueue[existingQueue.length - 1].arrivalTime,
        );
      } else if (booking.arrivalTime) {
        scheduleQueryDate = new Date(booking.arrivalTime);
      } else {
        scheduleQueryDate = new Date();
      }
    }

    // Reset jam ke 00:00:00 untuk query
    const queryDateForSchedule = new Date(scheduleQueryDate);
    queryDateForSchedule.setHours(0, 0, 0, 0);

    const schedule = await this.getScheduleForDockDay(
      targetDockId,
      queryDateForSchedule,
    );

    if (!schedule) {
      throw new BadRequestException(
        'Tidak ada jadwal untuk gate pada tanggal ini',
      );
    }

    const scheduleStartHour = schedule.startHour;
    const scheduleEndHour = schedule.endHour;
    const scheduleStartMinutes = Math.round(scheduleStartHour * 60);
    const scheduleEndMinutes = Math.round(scheduleEndHour * 60);

    /* ======================================
     * 6. TENTUKAN effectiveArrivalTime BERDASARKAN POSISI
     * ====================================== */
    const durationMinutes = booking.Vehicle.durasiBongkar;
    const intervalMinutes = booking.Warehouse?.intervalMinimalQueueu ?? 15;

    let effectiveArrivalTime: Date;
    let insertIndex = existingQueue.length;

    // CASE A: LAST - Ambil booking terakhir atau mulai dari schedule start
    if (relativePositionTarget.bookingId === 'LAST') {
      if (existingQueue.length === 0) {
        // Tidak ada antrian
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        console.log('DEBUG - LAST dengan antrian kosong:');
        console.log(
          '  currentMinutes:',
          currentMinutes,
          '=',
          Math.floor(currentMinutes / 60) + ':' + (currentMinutes % 60),
        );
        console.log('  scheduleEndMinutes:', scheduleEndMinutes);
        console.log('  durationMinutes:', durationMinutes);
        console.log('  intervalMinutes:', intervalMinutes);

        // Hitung waktu mulai minimal (sekarang + interval)
        const minStartMinutes = currentMinutes + intervalMinutes;

        // Hitung waktu selesai jika mulai di minStartMinutes
        const finishIfStartAtMin = minStartMinutes + durationMinutes;

        console.log(
          '  finishIfStartAtMin:',
          finishIfStartAtMin,
          '=',
          Math.floor(finishIfStartAtMin / 60) + ':' + (finishIfStartAtMin % 60),
        );

        // Cek apakah masih bisa muat hari ini
        if (finishIfStartAtMin <= scheduleEndMinutes) {
          // MASIH MUAT hari ini
          effectiveArrivalTime = new Date(now);
          effectiveArrivalTime.setHours(
            Math.floor(minStartMinutes / 60),
            minStartMinutes % 60,
            0,
            0,
          );
          console.log('  MUAT - effectiveArrivalTime:', effectiveArrivalTime);
        } else {
          // TIDAK MUAT hari ini, gunakan besok
          console.log('  TIDAK MUAT hari ini, geser ke besok');
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          effectiveArrivalTime = new Date(tomorrow);

          // Set ke schedule start besok
          const scheduleHour = Math.floor(scheduleStartHour);
          const scheduleMinute = Math.round(
            (scheduleStartHour - scheduleHour) * 60,
          );
          effectiveArrivalTime.setHours(scheduleHour, scheduleMinute, 0, 0);
          console.log('  effectiveArrivalTime besok:', effectiveArrivalTime);
        }
      } else {
        // Ada antrian - ambil booking terakhir
        const lastBooking = existingQueue[existingQueue.length - 1];
        const lastFinishTime = new Date(lastBooking.estimatedFinishTime);
        const lastFinishMinutes =
          lastFinishTime.getHours() * 60 + lastFinishTime.getMinutes();

        console.log('DEBUG - LAST dengan antrian:');
        console.log(
          '  lastFinishMinutes:',
          lastFinishMinutes,
          '=',
          Math.floor(lastFinishMinutes / 60) + ':' + (lastFinishMinutes % 60),
        );
        console.log('  durationMinutes:', durationMinutes);
        console.log('  intervalMinutes:', intervalMinutes);

        // Hitung waktu mulai kandidat
        const candidateStartMinutes = lastFinishMinutes + intervalMinutes;
        const candidateFinishMinutes = candidateStartMinutes + durationMinutes;

        console.log(
          '  candidateFinishMinutes:',
          candidateFinishMinutes,
          '=',
          Math.floor(candidateFinishMinutes / 60) +
            ':' +
            (candidateFinishMinutes % 60),
        );

        // Cek apakah muat
        if (candidateFinishMinutes <= scheduleEndMinutes) {
          effectiveArrivalTime = new Date(
            lastFinishTime.getTime() + intervalMinutes * 60 * 1000,
          );
          console.log('  MUAT - effectiveArrivalTime:', effectiveArrivalTime);
        } else {
          // Tidak muat di hari ini
          throw new BadRequestException(
            `Tidak dapat menambah booking ke LAST karena akan melewati jam operasional berakhir (${Math.floor(scheduleEndHour)}:${String(Math.round((scheduleEndHour - Math.floor(scheduleEndHour)) * 60)).padStart(2, '0')}). Booking terakhir selesai ${lastFinishTime.toLocaleTimeString('id-ID')}, durasi booking ${durationMinutes} menit.`,
          );
        }
      }
    }

    // CASE B: BEFORE/AFTER booking tertentu
    else {
      const targetBooking = await this.prismaService.booking.findUnique({
        where: { id: relativePositionTarget.bookingId },
        include: {
          Vehicle: true,
        },
      });

      if (!targetBooking) {
        throw new BadRequestException('Target booking tidak ditemukan');
      }

      if (targetBooking.dockId !== targetDockId) {
        throw new BadRequestException(
          'Target booking berada di dock yang berbeda',
        );
      }

      const targetIndex = existingQueue.findIndex(
        (b) => b.id === targetBooking.id,
      );

      if (targetIndex === -1) {
        throw new BadRequestException('Target booking tidak ada dalam antrian');
      }

      // SWAP LOGIC - Tukar posisi tanpa geser yang lain
      if (relativePositionTarget.type === 'SWAP') {
        // Cek apakah durasi sama? Jika beda, FAIL
        const targetDuration = targetBooking.Vehicle?.durasiBongkar || 0;
        if (durationMinutes !== targetDuration) {
          throw new BadRequestException(
            'Tidak bisa swap karena durasi bongkar berbeda',
          );
        }

        // Tukar arrivalTime dan estimatedFinishTime
        const tempArrivalTime = targetBooking.arrivalTime;
        const tempFinishTime = targetBooking.estimatedFinishTime;

        // Update target booking dengan waktu booking yang didrag
        await this.prismaService.booking.update({
          where: { id: targetBooking.id },
          data: {
            arrivalTime: booking.arrivalTime,
            estimatedFinishTime: booking.estimatedFinishTime,
          },
        });

        // Update booking yang didrag dengan waktu target
        await this.prismaService.booking.update({
          where: { id },
          data: {
            dockId: targetDockId,
            status: toStatus,
            arrivalTime: tempArrivalTime,
            estimatedFinishTime: tempFinishTime,
            actualStartTime: toStatus === 'UNLOADING' ? new Date() : null,
          },
        });

        return { success: true };
      }

      // BEFORE/AFTER LOGIC
      if (relativePositionTarget.type === 'BEFORE') {
        insertIndex = targetIndex;

        if (targetIndex === 0) {
          // Coba taruh sebelum booking pertama
          const firstArrivalTime = new Date(existingQueue[0].arrivalTime);
          const candidateTime = new Date(
            firstArrivalTime.getTime() -
              durationMinutes * 60 * 1000 -
              intervalMinutes * 60 * 1000,
          );

          // Validasi tidak sebelum schedule start
          const candidateHour =
            candidateTime.getHours() + candidateTime.getMinutes() / 60;
          if (candidateHour >= scheduleStartHour) {
            effectiveArrivalTime = candidateTime;
          } else {
            throw new BadRequestException(
              'Tidak ada ruang sebelum booking pertama',
            );
          }
        } else {
          // Cari slot di antara dua booking
          const prevFinishTime = new Date(
            existingQueue[targetIndex - 1].estimatedFinishTime,
          );
          const nextArrivalTime = new Date(
            existingQueue[targetIndex].arrivalTime,
          );

          const gapMinutes =
            (nextArrivalTime.getTime() - prevFinishTime.getTime()) /
            (1000 * 60);
          const requiredMinutes = durationMinutes + intervalMinutes;

          if (gapMinutes >= requiredMinutes) {
            effectiveArrivalTime = new Date(
              prevFinishTime.getTime() + intervalMinutes * 60 * 1000,
            );
          } else {
            throw new BadRequestException(
              `Tidak ada cukup waktu antara booking ${existingQueue[targetIndex - 1].code} dan ${existingQueue[targetIndex].code}`,
            );
          }
        }
      } else if (relativePositionTarget.type === 'AFTER') {
        insertIndex = targetIndex + 1;

        const targetFinishTime = new Date(targetBooking.estimatedFinishTime);

        if (targetIndex === existingQueue.length - 1) {
          // Setelah booking terakhir
          effectiveArrivalTime = new Date(
            targetFinishTime.getTime() + intervalMinutes * 60 * 1000,
          );
        } else {
          // Cari slot di antara booking
          const nextArrivalTime = new Date(
            existingQueue[targetIndex + 1].arrivalTime,
          );

          const gapMinutes =
            (nextArrivalTime.getTime() - targetFinishTime.getTime()) /
            (1000 * 60);
          const requiredMinutes = durationMinutes + intervalMinutes;

          if (gapMinutes >= requiredMinutes) {
            effectiveArrivalTime = new Date(
              targetFinishTime.getTime() + intervalMinutes * 60 * 1000,
            );
          } else {
            throw new BadRequestException(
              `Tidak ada cukup waktu setelah booking ${targetBooking.code}`,
            );
          }
        }
      }
    }

    /* ======================================
     * 7. VALIDASI WAKTU DENGAN SCHEDULE
     * ====================================== */
    const estimatedFinishTimeMs =
      effectiveArrivalTime.getTime() + booking.Vehicle.durasiBongkar * 60_000;
    const estimatedFinishTime = new Date(estimatedFinishTimeMs);

    // Ambil menit dalam sehari dari waktu
    const arrivalMinutes =
      effectiveArrivalTime.getHours() * 60 + effectiveArrivalTime.getMinutes();
    const finishMinutes = estimatedFinishTime.getHours() * 60;

    // Validasi 1: Tidak sebelum schedule start
    if (arrivalMinutes < scheduleStartMinutes) {
      throw new BadRequestException(
        `Waktu mulai (${effectiveArrivalTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}) sebelum jam operasional mulai (${Math.floor(scheduleStartHour)}:${String(Math.round((scheduleStartHour - Math.floor(scheduleStartHour)) * 60)).padStart(2, '0')})`,
      );
    }

    // Validasi 2: Tidak melewati schedule end
    console.log(finishMinutes, scheduleEndMinutes);
    if (finishMinutes > scheduleEndMinutes) {
      const endHour = Math.floor(scheduleEndHour);
      const endMinute = Math.round((scheduleEndHour - endHour) * 60);
      throw new BadRequestException(
        `Waktu selesai (${estimatedFinishTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}) melewati jam operasional berakhir (${endHour}:${String(endMinute).padStart(2, '0')})`,
      );
    }

    // Validasi 3: Tidak melewati tengah malam (jika schedule end < schedule start)
    if (scheduleEndMinutes < scheduleStartMinutes) {
      // Schedule melewati tengah malam (contoh: 22:00 - 06:00)
      // Untuk schedule overnight, finishMinutes mungkin kurang dari arrivalMinutes
      const isOvernightFinish = finishMinutes < arrivalMinutes;

      if (isOvernightFinish) {
        // Finish di hari berikutnya, validasi terhadap scheduleEnd di hari berikutnya
        if (finishMinutes > scheduleEndMinutes) {
          throw new BadRequestException(
            `Waktu selesai melewati jam operasional berakhir untuk schedule overnight`,
          );
        }
      }
    }

    /* ======================================
     * 8. VALIDASI DENGAN BUSY TIMES
     * ====================================== */
    const applicableBusyTimes = await this.getApplicableBusyTimesForDate(
      targetDockId,
      effectiveDate,
    );

    for (const busyTime of applicableBusyTimes) {
      const busyStart = this.parseTimeToHours(busyTime.from);
      const busyEnd = this.parseTimeToHours(busyTime.to);

      if (busyStart !== null && busyEnd !== null) {
        const busyStartMinutes = busyStart * 60;
        const busyEndMinutes = busyEnd * 60;

        const overlaps =
          (arrivalMinutes >= busyStartMinutes &&
            arrivalMinutes < busyEndMinutes) ||
          (finishMinutes > busyStartMinutes &&
            finishMinutes <= busyEndMinutes) ||
          (arrivalMinutes <= busyStartMinutes &&
            finishMinutes >= busyEndMinutes);

        if (overlaps) {
          throw new BadRequestException(
            `Waktu bertabrakan dengan busy time: ${busyTime.reason} (${busyTime.from} - ${busyTime.to})`,
          );
        }
      }
    }

    /* ======================================
     * 9. VALIDASI TABRAKAN DENGAN BOOKING LAIN
     * ====================================== */
    // Buat array untuk validasi overlap
    const validationQueue = [...existingQueue];
    const newBookingSlot = {
      id: booking.id,
      arrivalTime: effectiveArrivalTime,
      estimatedFinishTime: estimatedFinishTime,
    };

    validationQueue.splice(insertIndex, 0, newBookingSlot as any);

    //filter yang sudah > booking.vehicle.intervalMinimalQueueu
    const now = new Date();
    validationQueue.filter((bookingItem) => {
      const arrivalTime = new Date(bookingItem.arrivalTime);
      // Jika arrivalTime sudah lewat dari waktu sekarang(DELAYED) dan status finish
      return (
        arrivalTime < now &&
        bookingItem.status !== BookingStatus.IN_PROGRESS &&
        bookingItem.status !== BookingStatus.UNLOADING
      );
    });

    // Urutkan berdasarkan arrivalTime untuk validasi
    validationQueue.sort(
      (a, b) =>
        new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime(),
    );

    // Validasi tidak ada overlap
    for (let i = 0; i < validationQueue.length - 1; i++) {
      const currentFinish = new Date(validationQueue[i].estimatedFinishTime);
      const nextArrival = new Date(validationQueue[i + 1].arrivalTime);

      if (currentFinish.getTime() > nextArrival.getTime()) {
        throw new BadRequestException(
          `Terjadi tabrakan waktu dengan booking lain`,
        );
      }
    }

    /* ======================================
     * 10. UPDATE BOOKING (TANPA RESCHEDULE LAIN)
     * ====================================== */
    await this.prismaService.booking.update({
      where: { id },
      data: {
        dockId: targetDockId,
        status: toStatus,
        arrivalTime: effectiveArrivalTime,
        estimatedFinishTime: estimatedFinishTime,
        actualStartTime: toStatus === 'UNLOADING' ? new Date() : null,
      },
    });

    return { success: true };
  }

  /* ======================================
   * HELPER: Parse waktu ke jam desimal
   * ====================================== */
  private parseTimeToHours(timeString: string): number | null {
    if (!timeString) return null;

    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    return hours + minutes / 60;
  }

  async findAll(filter: BookingFilter, userInfo: TokenPayload) {
    const { page, searchKey, weekStart, weekEnd } = filter;

    const where: Prisma.BookingWhereInput = {
      organizationName: userInfo.organizationName,
    };

    if (weekStart && weekEnd) {
      console.log(
        'implementasi funsi untuk oreview flow untuk menunjukkan semua book hari dalam 1 minggu ',
      );
    }

    if (searchKey) {
      where.OR = [
        {
          code: {
            contains: searchKey,
          },
        },
        {
          driverUsername: {
            contains: searchKey,
          },
        },
      ];
    }

    const bookings = await this.prismaService.booking.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      skip: (page - 1) * 10,
      include: {
        Vehicle: {
          select: {
            durasiBongkar: true,
            brand: true,
            vehicleType: true,
            description: true,
          },
        },
        driver: {
          select: {
            username: true,
            displayName: true,
          },
        },
        Dock: {
          select: {
            name: true,
          },
        },
      },
    });

    return plainToInstance(ResponseBookingDto, bookings, {
      excludeExtraneousValues: true,
      groups: ['detail'],
    });
  }

  //unutk queue
  async semiDetailList(filter: BookingFilter, userInfo: TokenPayload) {
    const { date } = filter;

    const where: Prisma.BookingWhereInput = {
      organizationName: userInfo.organizationName,
    };

    if (date) {
      const parsed = new Date(date);
      const base = isNaN(parsed.getTime()) ? new Date() : parsed;

      const from = new Date(base);
      const to = new Date(base);

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      where.AND = [
        {
          arrivalTime: {
            gte: from,
            lte: to,
          },
        },
      ];
    }

    const bookings = await this.prismaService.booking.findMany({
      where,
      orderBy: {
        arrivalTime: 'asc',
      },
      include: {
        Vehicle: {
          select: {
            durasiBongkar: true,
            brand: true,
            vehicleType: true,
            description: true,
          },
        },
        driver: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    });
    return plainToInstance(ResponseBookingDto, bookings, {
      excludeExtraneousValues: true,
    });
  }

  async updateBookingStatus(
    id: string,
    status: string,
    actualFinishTime?: Date,
  ) {
    const existingBooking = await this.prismaService.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking dengan id ${id} tidak ditemukan`);
    }

    const updateData: any = {
      status,
    };

    if (status === 'FINISHED' && actualFinishTime) {
      updateData.actualFinishTime = actualFinishTime;
    }

    const updatedBooking = await this.prismaService.booking.update({
      where: { id },
      data: updateData,
      include: {
        Vehicle: true,
        Warehouse: true,
        Dock: true,
        driver: true,
      },
    });

    return plainToInstance(ResponseBookingDto, updatedBooking, {
      excludeExtraneousValues: true,
      groups: ['detail'],
    });
  }

  async getStatsForUserOrganizations() {}
}
