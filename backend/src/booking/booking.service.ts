import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ResponseBookingDto } from './dto/response-booking.dto';
import { Days, DragAndDropPayload } from 'src/common/shared-enum';
import { DockBusyTime, Prisma } from '@prisma/client';
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { BookingFilter } from 'src/common/shared-interface';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingWarehouseService {
  constructor(private readonly prismaService: PrismaService) {}

  private isBookingConflict(bookingDate: Date, busy: DockBusyTime): boolean {
    const b = bookingDate;

    // MONTHLY → cek tanggal
    if (busy.recurring === 'MONTHLY') {
      return b.getDate() === busy.recurringStep;
    }

    // WEEKLY → cek hari
    if (busy.recurring === 'WEEKLY') {
      const bookingDay = b.getDay(); // 0=Sun ... 6=Sat
      const bookingDayStr = Days[bookingDay];
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
        `Waktu terkait overlap dengan booking ${overlapDockedHour.code || overlapDockedHour.id}, antara ${overlapDockedHour.arrivalTime} sampai ${overlapDockedHour.estimatedFinishTime}`,
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
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
      include: { Vehicle: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    const { toStatus, dockId, relativePositionTarget } = payload;
    const targetDockId = dockId ?? booking.dockId;

    /* ===============================
     * 1. Ambil queue tujuan
     * =============================== */
    const queue = await this.prismaService.booking.findMany({
      where: {
        dockId: targetDockId,
        status: toStatus === 'UNLOADING' ? 'UNLOADING' : 'IN_PROGRESS',
        id: { not: booking.id },
      },
      include: {
        Vehicle: true,
      },
      orderBy: { arrivalTime: 'asc' },
    });

    /* ===============================
     * 2. Tentukan insert index
     * =============================== */
    let insertIndex = queue.length;

    if (relativePositionTarget && relativePositionTarget.bookingId !== 'LAST') {
      const targetIndex = queue.findIndex(
        (b) => b.id === relativePositionTarget.bookingId,
      );

      if (targetIndex === -1) {
        throw new BadRequestException('Target booking tidak valid');
      }

      insertIndex =
        relativePositionTarget.type === 'BEFORE'
          ? targetIndex
          : targetIndex + 1;
    }

    queue.splice(insertIndex, 0, booking);

    /* ===============================
     * 3. Recalculate arrivalTime
     * =============================== */
    let cursorTime = new Date();

    for (const item of queue) {
      const updated = await this.prismaService.booking.update({
        where: { id: item.id },
        data: {
          dockId: targetDockId,
          status: toStatus,
          arrivalTime: cursorTime,
          estimatedFinishTime: new Date(
            cursorTime.getTime() + item.Vehicle.durasiBongkar * 60_000,
          ),
        },
      });

      cursorTime = updated.estimatedFinishTime!;
    }

    return { success: true };
  }

  async findAll(filter: BookingFilter, userInfo: TokenPayload) {
    const { page, searchKey, date } = filter;

    const where: Prisma.BookingWhereInput = {
      organizationName: userInfo.organizationName,
    };

    if (date) {
      const day = new Date(date);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      where.arrivalTime = {
        gte: day,
        lte: nextDay,
      };
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
}
