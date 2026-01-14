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
        },
      });
      return { success: true };
    }

    /* ======================================
     * 3. HANDLE STATUS UNLOADING (SIMPLE)
     * ====================================== */
    if (toStatus === 'UNLOADING') {
      const existingQueueUnloading = await this.prismaService.booking.findFirst(
        {
          where: {
            dockId: targetDockId,
            status: 'UNLOADING',
          },
        },
      );
      if (existingQueueUnloading) {
        return { success: false, message: 'Queue Unloading sedang ada' };
      }
      await this.prismaService.booking.update({
        where: { id },
        data: {
          status: 'UNLOADING',
          actualFinishTime: new Date(),
        },
      });
      return { success: true };
    }

    /* ======================================
     * 4. DEFINE HELPER FUNCTIONS
     * ====================================== */
    // Helper functions untuk waktu lokal
    const getLocalHours = (date: Date): number => {
      // Convert UTC ke WIB (UTC+7)
      return (date.getUTCHours() + 7) % 24;
    };

    const getLocalMinutes = (date: Date): number => {
      return date.getUTCMinutes();
    };

    const toLocalMinutes = (date: Date): number => {
      return getLocalHours(date) * 60 + getLocalMinutes(date);
    };

    const formatMinutes = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    const formatLocalTime = (date: Date): string => {
      const hours = getLocalHours(date);
      const minutes = getLocalMinutes(date);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    /* ======================================
     * 5. TENTUKAN TANGGAL & AMBIL SCHEDULE
     * ====================================== */
    // DRAG & DROP HANYA UNTUK HARI INI!
    const TODAY = new Date();
    const startOfToday = new Date(TODAY);
    startOfToday.setUTCHours(0, 0, 0, 0); // Gunakan UTC
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    // Ambil schedule untuk hari ini
    const scheduleQueryDate = new Date(TODAY);
    scheduleQueryDate.setUTCHours(0, 0, 0, 0); // Gunakan UTC untuk query

    const schedule = await this.getScheduleForDockDay(
      targetDockId,
      scheduleQueryDate,
    );

    if (!schedule) {
      throw new BadRequestException(
        'Tidak ada jadwal untuk gate pada hari ini',
      );
    }

    const scheduleStartHour = schedule.startHour;
    const scheduleEndHour = schedule.endHour;
    const scheduleStartMinutes = Math.round(scheduleStartHour * 60);
    const scheduleEndMinutes = Math.round(scheduleEndHour * 60);

    console.log('DEBUG - Schedule hari ini:');
    console.log(
      '  scheduleStartHour:',
      scheduleStartHour,
      '=',
      formatMinutes(scheduleStartMinutes),
    );
    console.log(
      '  scheduleEndHour:',
      scheduleEndHour,
      '=',
      formatMinutes(scheduleEndMinutes),
    );

    /* ======================================
     * 6. AMBIL ANTRIAN YANG ADA (HANYA UNTUK HARI INI!)
     * ====================================== */
    const existingQueue = await this.prismaService.booking.findMany({
      where: {
        dockId: targetDockId,
        status: toStatus,
        id: { not: booking.id },
        arrivalTime: {
          gte: startOfToday, // SELALU HARI INI (UTC)
          lt: endOfToday, // SELALU HARI INI (UTC)
        },
      },
      include: { Vehicle: true },
      orderBy: { arrivalTime: 'asc' },
    });

    console.log('DEBUG - Antrian hari ini:');
    console.log('  existingQueue count:', existingQueue.length);
    existingQueue.forEach((b, i) => {
      console.log(
        `  ${i + 1}. ${b.code}: ${new Date(b.arrivalTime).toLocaleTimeString('id-ID')} - ${new Date(b.estimatedFinishTime).toLocaleTimeString('id-ID')}`,
      );
    });

    /* ======================================
     * 7. TENTUKAN effectiveArrivalTime BERDASARKAN POSISI
     * ====================================== */
    const durationMinutes = booking.Vehicle.durasiBongkar;
    const intervalMinutes = booking.Warehouse?.isAutoEfficientActive
      ? booking.Warehouse.intervalMinimalQueueu
      : 0;

    let effectiveArrivalTime: Date;
    let insertIndex = existingQueue.length;

    // Helper untuk validasi waktu
    const validateTimeFitsInSchedule = (startTime: Date): boolean => {
      const startMins = toLocalMinutes(startTime);
      const finishMins = startMins + durationMinutes;

      console.log('DEBUG validateTimeFitsInSchedule:');
      console.log('  startTime (local):', formatLocalTime(startTime));
      console.log('  startMins:', startMins, '=', formatMinutes(startMins));
      console.log('  finishMins:', finishMins, '=', formatMinutes(finishMins));
      console.log(
        '  scheduleEndMinutes:',
        scheduleEndMinutes,
        '=',
        formatMinutes(scheduleEndMinutes),
      );
      console.log('  Result:', finishMins <= scheduleEndMinutes);

      return finishMins <= scheduleEndMinutes;
    };

    // Helper untuk membuat Date dengan waktu lokal
    const createDateWithLocalTime = (
      baseDate: Date,
      localMinutes: number,
    ): Date => {
      // Convert local minutes back to UTC
      const localHours = Math.floor(localMinutes / 60);
      const localMins = localMinutes % 60;

      // Local to UTC: UTC = Local - 7
      let utcHours = localHours - 7;
      if (utcHours < 0) utcHours += 24;

      const date = new Date(baseDate);
      date.setUTCHours(utcHours, localMins, 0, 0);
      return date;
    };

    // CASE A: LAST - Ambil booking terakhir atau mulai dari schedule start
    if (relativePositionTarget.bookingId === 'LAST') {
      if (existingQueue.length === 0) {
        const now = new Date();
        const currentLocalMinutes = toLocalMinutes(now);
        let candidateStartMinutes = currentLocalMinutes + intervalMinutes;
        // Jangan mulai sebelum schedule start
        candidateStartMinutes = Math.max(
          candidateStartMinutes,
          scheduleStartMinutes,
        );
        let candidateEndMinutes = currentLocalMinutes + durationMinutes;

        // Cek apakah bertabrakan dengan busy times candidateEndMinutes-nya jika ya majuin candidateStartMinutes
        const applicableBusyTimes = await this.getApplicableBusyTimesForDate(
          targetDockId,
          startOfToday,
        );

        for (const busyTime of applicableBusyTimes) {
          const busyStart = this.parseTimeToHours(busyTime.from);
          const busyEnd = this.parseTimeToHours(busyTime.to);

          if (busyStart !== null && busyEnd !== null) {
            const busyStartMinutes = busyStart * 60;
            const busyEndMinutes = busyEnd * 60;

            const overlaps =
              (candidateStartMinutes >= busyStartMinutes &&
                candidateStartMinutes < busyEndMinutes) ||
              (candidateEndMinutes > busyStartMinutes &&
                candidateEndMinutes <= busyEndMinutes) ||
              (candidateStartMinutes <= busyStartMinutes &&
                candidateEndMinutes >= busyEndMinutes);

            if (overlaps) {
              candidateStartMinutes += busyEndMinutes + intervalMinutes;
              candidateEndMinutes = candidateStartMinutes + durationMinutes;
              console.log(
                `try candidateStartMinutes: ${candidateStartMinutes} ${candidateEndMinutes}`,
              );
            }
          }
        }
        // Cek apakah arrivalTime dibawah jam pulang
        if (candidateStartMinutes + durationMinutes <= scheduleEndMinutes) {
          // MASIH MUAT - buat waktu dengan UTC yang benar
          effectiveArrivalTime = createDateWithLocalTime(
            now,
            candidateStartMinutes,
          );
        } else {
          throw new BadRequestException(
            `Tidak ada slot tersisa hari ini untuk booking ${durationMinutes} menit. ` +
              `Jam operasional berakhir ${formatMinutes(scheduleEndMinutes)}, ` +
              `slot terakhir harus mulai sebelum ${formatMinutes(scheduleEndMinutes - durationMinutes)}`,
          );
        }
      } else {
        // Ada antrian
        const lastBooking = existingQueue[existingQueue.length - 1];
        const lastFinishTime = new Date(lastBooking.estimatedFinishTime);
        const lastFinishLocalMinutes = toLocalMinutes(lastFinishTime);

        console.log('  Ada antrian, lastBooking:', lastBooking.code);
        console.log(
          '  lastFinishTime (local):',
          formatLocalTime(lastFinishTime),
          '=',
          lastFinishLocalMinutes,
          'menit',
        );

        // Hitung waktu mulai setelah booking terakhir
        const candidateStartMinutes = lastFinishLocalMinutes + intervalMinutes;

        console.log(
          '  candidateStartMinutes:',
          candidateStartMinutes,
          '=',
          formatMinutes(candidateStartMinutes),
        );
        console.log(
          '  Perkiraan selesai:',
          formatMinutes(candidateStartMinutes + durationMinutes),
        );

        // Validasi
        if (candidateStartMinutes + durationMinutes <= scheduleEndMinutes) {
          effectiveArrivalTime = createDateWithLocalTime(
            lastFinishTime,
            candidateStartMinutes,
          );
          console.log(
            '  ✅ MUAT - effectiveArrivalTime (Local):',
            formatLocalTime(effectiveArrivalTime),
          );
        } else {
          console.log('  ❌ TIDAK MUAT - akan melewati jam operasional');
          throw new BadRequestException(
            `Tidak dapat menambah booking setelah ${lastBooking.code}. ` +
              `Booking akan selesai ${formatMinutes(candidateStartMinutes + durationMinutes)} ` +
              `melewati jam operasional (${formatMinutes(scheduleEndMinutes)})`,
          );
        }
      }
    }

    // CASE B: BEFORE/AFTER booking tertentu
    else {
      console.log('=== CASE B: BEFORE|AFTER|SWAP ===');

      const targetBooking = await this.prismaService.booking.findUnique({
        where: { id: relativePositionTarget.bookingId },
        include: { Vehicle: true },
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
        throw new BadRequestException(
          'Target booking tidak ada dalam antrian hari ini',
        );
      }

      // SWAP LOGIC
      if (relativePositionTarget.type === 'SWAP') {
        const targetDuration = targetBooking.Vehicle?.durasiBongkar || 0;
        if (durationMinutes !== targetDuration) {
          throw new BadRequestException(
            'Tidak bisa swap karena durasi bongkar berbeda',
          );
        }

        // Tukar waktu
        const tempArrivalTime = targetBooking.arrivalTime;
        const tempFinishTime = targetBooking.estimatedFinishTime;

        await this.prismaService.booking.update({
          where: { id: targetBooking.id },
          data: {
            arrivalTime: booking.arrivalTime,
            estimatedFinishTime: booking.estimatedFinishTime,
          },
        });

        await this.prismaService.booking.update({
          where: { id },
          data: {
            dockId: targetDockId,
            status: toStatus,
            arrivalTime: tempArrivalTime,
            estimatedFinishTime: tempFinishTime,
            actualStartTime: toStatus === 'IN_PROGRESS' ? new Date() : null,
          },
        });

        return { success: true };
      }

      // BEFORE/AFTER LOGIC
      if (relativePositionTarget.type === 'BEFORE') {
        insertIndex = targetIndex;

        if (targetIndex === 0) {
          // Sebelum booking pertama
          const firstArrivalTime = new Date(existingQueue[0].arrivalTime);
          const firstArrivalLocalMinutes = toLocalMinutes(firstArrivalTime);

          // Hitung waktu sebelum booking pertama
          const candidateStartMinutes =
            firstArrivalLocalMinutes - durationMinutes - intervalMinutes;

          if (candidateStartMinutes >= scheduleStartMinutes) {
            const candidateTime = createDateWithLocalTime(
              firstArrivalTime,
              candidateStartMinutes,
            );

            if (validateTimeFitsInSchedule(candidateTime)) {
              effectiveArrivalTime = candidateTime;
            } else {
              throw new BadRequestException(
                'Tidak dapat menempatkan sebelum booking pertama',
              );
            }
          } else {
            throw new BadRequestException(
              'Tidak ada ruang sebelum booking pertama',
            );
          }
        } else {
          // Di antara dua booking
          const prevFinishTime = new Date(
            existingQueue[targetIndex - 1].estimatedFinishTime,
          );
          const nextArrivalTime = new Date(
            existingQueue[targetIndex].arrivalTime,
          );

          const prevFinishLocal = toLocalMinutes(prevFinishTime);
          const nextArrivalLocal = toLocalMinutes(nextArrivalTime);

          const gapMinutes = nextArrivalLocal - prevFinishLocal;
          const requiredMinutes = durationMinutes + intervalMinutes;

          if (gapMinutes >= requiredMinutes) {
            const candidateStartMinutes = prevFinishLocal + intervalMinutes;
            const candidateTime = createDateWithLocalTime(
              prevFinishTime,
              candidateStartMinutes,
            );

            if (validateTimeFitsInSchedule(candidateTime)) {
              effectiveArrivalTime = candidateTime;
            } else {
              throw new BadRequestException(`Tidak cukup waktu antara booking`);
            }
          } else {
            throw new BadRequestException(
              `Tidak ada cukup waktu antara booking`,
            );
          }
        }
      } else if (relativePositionTarget.type === 'AFTER') {
        insertIndex = targetIndex + 1;
        const targetFinishTime = new Date(targetBooking.estimatedFinishTime);
        const targetFinishLocal = toLocalMinutes(targetFinishTime);

        if (targetIndex === existingQueue.length - 1) {
          // Setelah booking terakhir
          const candidateStartMinutes = targetFinishLocal + intervalMinutes;
          const candidateTime = createDateWithLocalTime(
            targetFinishTime,
            candidateStartMinutes,
          );

          if (validateTimeFitsInSchedule(candidateTime)) {
            effectiveArrivalTime = candidateTime;
          } else {
            throw new BadRequestException(
              `Tidak dapat menempatkan setelah booking terakhir`,
            );
          }
        } else {
          // Di antara booking
          const nextArrivalTime = new Date(
            existingQueue[targetIndex + 1].arrivalTime,
          );
          const nextArrivalLocal = toLocalMinutes(nextArrivalTime);

          const gapMinutes = nextArrivalLocal - targetFinishLocal;
          const requiredMinutes = durationMinutes + intervalMinutes;

          if (gapMinutes >= requiredMinutes) {
            const candidateStartMinutes = targetFinishLocal + intervalMinutes;
            const candidateTime = createDateWithLocalTime(
              targetFinishTime,
              candidateStartMinutes,
            );

            if (validateTimeFitsInSchedule(candidateTime)) {
              effectiveArrivalTime = candidateTime;
            } else {
              throw new BadRequestException(
                `Tidak cukup waktu setelah booking`,
              );
            }
          } else {
            throw new BadRequestException(
              `Tidak ada cukup waktu setelah booking`,
            );
          }
        }
      }
    }

    /* ======================================
     * 8. VALIDASI WAKTU DENGAN SCHEDULE
     * ====================================== */
    const estimatedFinishTimeMs =
      effectiveArrivalTime.getTime() + durationMinutes * 60_000;
    const estimatedFinishTime = new Date(estimatedFinishTimeMs);

    const arrivalLocalMinutes = toLocalMinutes(effectiveArrivalTime);
    const finishLocalMinutes = toLocalMinutes(estimatedFinishTime);

    console.log('=== FINAL VALIDASI ===');
    console.log(
      'effectiveArrivalTime (Local):',
      formatLocalTime(effectiveArrivalTime),
    );
    console.log(
      'estimatedFinishTime (Local):',
      formatLocalTime(estimatedFinishTime),
    );
    console.log(
      'arrivalLocalMinutes:',
      arrivalLocalMinutes,
      '=',
      formatMinutes(arrivalLocalMinutes),
    );
    console.log(
      'finishLocalMinutes:',
      finishLocalMinutes,
      '=',
      formatMinutes(finishLocalMinutes),
    );
    console.log(
      'scheduleEndMinutes:',
      scheduleEndMinutes,
      '=',
      formatMinutes(scheduleEndMinutes),
    );
    console.log(
      'finishLocalMinutes > scheduleEndMinutes?',
      finishLocalMinutes > scheduleEndMinutes,
    );

    // Validasi schedule start
    if (arrivalLocalMinutes < scheduleStartMinutes) {
      throw new BadRequestException(
        `Waktu mulai (${formatMinutes(arrivalLocalMinutes)}) sebelum jam operasional mulai (${formatMinutes(scheduleStartMinutes)})`,
      );
    }

    // Validasi schedule end
    if (finishLocalMinutes > scheduleEndMinutes) {
      throw new BadRequestException(
        `Waktu selesai (${formatMinutes(finishLocalMinutes)}) melewati jam operasional berakhir (${formatMinutes(scheduleEndMinutes)})`,
      );
    }

    // Validasi overnight schedule
    if (scheduleEndMinutes < scheduleStartMinutes) {
      const isOvernightFinish = finishLocalMinutes < arrivalLocalMinutes;
      if (isOvernightFinish && finishLocalMinutes > scheduleEndMinutes) {
        throw new BadRequestException(
          'Waktu selesai melewati jam operasional untuk schedule overnight',
        );
      }
    }

    /* ======================================
     * 9. VALIDASI DENGAN BUSY TIMES
     * ====================================== */
    const applicableBusyTimes = await this.getApplicableBusyTimesForDate(
      targetDockId,
      startOfToday,
    );

    for (const busyTime of applicableBusyTimes) {
      const busyStart = this.parseTimeToHours(busyTime.from);
      const busyEnd = this.parseTimeToHours(busyTime.to);

      if (busyStart !== null && busyEnd !== null) {
        const busyStartMinutes = busyStart * 60;
        const busyEndMinutes = busyEnd * 60;

        const overlaps =
          (arrivalLocalMinutes >= busyStartMinutes &&
            arrivalLocalMinutes < busyEndMinutes) ||
          (finishLocalMinutes > busyStartMinutes &&
            finishLocalMinutes <= busyEndMinutes) ||
          (arrivalLocalMinutes <= busyStartMinutes &&
            finishLocalMinutes >= busyEndMinutes);

        if (overlaps) {
          throw new BadRequestException(
            `Waktu bertabrakan dengan busy time: ${busyTime.reason} (${busyTime.from} - ${busyTime.to})`,
          );
        }
      }
    }

    /* ======================================
     * 10. VALIDASI TABRAKAN DENGAN BOOKING LAIN
     * ====================================== */
    const validationQueue = [...existingQueue];
    const newBookingSlot = {
      id: booking.id,
      arrivalTime: effectiveArrivalTime,
      estimatedFinishTime: estimatedFinishTime,
    };

    validationQueue.splice(insertIndex, 0, newBookingSlot as any);

    // Urutkan dan validasi overlap
    validationQueue.sort(
      (a, b) =>
        new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime(),
    );

    for (let i = 0; i < validationQueue.length - 1; i++) {
      const currentFinish = new Date(validationQueue[i].estimatedFinishTime);
      const nextArrival = new Date(validationQueue[i + 1].arrivalTime);

      if (currentFinish.getTime() > nextArrival.getTime()) {
        throw new BadRequestException(
          'Terjadi tabrakan waktu dengan booking lain',
        );
      }
    }

    /* ======================================
     * 11. UPDATE BOOKING
     * ====================================== */
    await this.prismaService.booking.update({
      where: { id },
      data: {
        dockId: targetDockId,
        status: toStatus,
        arrivalTime: effectiveArrivalTime,
        estimatedFinishTime: estimatedFinishTime,
        actualStartTime: toStatus === 'IN_PROGRESS' ? new Date() : null,
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
