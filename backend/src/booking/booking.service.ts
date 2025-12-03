import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/common/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ResponseBookingDto } from './dto/response-booking.dto';
import { BookingStatus, Days, DockBusyTime } from '@prisma/client';
import { TokenPayload } from 'src/user/dto/token-payload.dto';

@Injectable()
export class BookingService {
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

  async create(createBookingDto: CreateBookingDto, userInfo: TokenPayload) {
    const { estimatedFinishTime, vehicleId, warehouseId, dockId, arrivalTime } =
      createBookingDto;

    //cek busy time
    const overlapBusyTimeHour = await this.prismaService.dockBusyTime.findFirst(
      {
        where: {
          dockId: dockId,
          AND: [
            {
              from: { lt: arrivalTime },
            },
            {
              to: { gt: estimatedFinishTime },
            },
          ],
        },
      },
    );

    if (overlapBusyTimeHour) {
      if (overlapBusyTimeHour) {
        const conflict = this.isBookingConflict(
          createBookingDto.arrivalTime,
          overlapBusyTimeHour,
        );

        if (conflict) {
          throw new Error(
            `Waktu terkait overlap busy time ${overlapBusyTimeHour.reason}, antara ${overlapBusyTimeHour.from} sampai ${overlapBusyTimeHour.to}`,
          );
        }
      }
    }

    //cek overlap to another booking
    const overlapDockedHour = await this.prismaService.booking.findFirst({
      where: {
        dockId: dockId,
        AND: [
          {
            arrivalTime: { lt: estimatedFinishTime },
          },
          {
            estimatedFinishTime: { gt: arrivalTime },
          },
        ],
      },
    });
    if (overlapDockedHour) {
      throw new Error(
        `Waktu terkait overlap booking ${overlapDockedHour.id}, antara ${overlapDockedHour.arrivalTime} sampai ${overlapDockedHour.estimatedFinishTime}`,
      );
    }

    await this.prismaService.booking.create({
      data: {
        status: 'IN_PROGRESS',
        arrivalTime: arrivalTime,
        actualFinishTime: null,
        estimatedFinishTime: estimatedFinishTime,
        Vehicle: { connect: { id: vehicleId } },
        Warehouse: { connect: { id: warehouseId } },
        Dock: { connect: { id: dockId } },
        driver: { connect: { username: userInfo.username } },
        organization: {
          connect: {
            name: userInfo.organizationName,
          },
        },
      },
    });

    return HttpStatus.ACCEPTED;
  }

  async findAll(filter, userInfo) {
    const bookings = await this.prismaService.booking.findMany({});
    return bookings.map((booking) =>
      plainToInstance(ResponseBookingDto, booking),
    );
  }

  async findOne(id: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: {
        id,
      },
    });
    return plainToInstance(ResponseBookingDto, booking, {
      excludeExtraneousValues: true,
      groups: ['detail'],
    });
  }

  async unLoad(id: string, arrivalTime: Date) {
    await this.prismaService.booking.update({
      where: {
        id,
      },
      data: {
        arrivalTime: arrivalTime,
        status: 'UNLOADING',
      },
    });
    return HttpStatus.ACCEPTED;
  }

  async finish(id: string, actualFinishTime: Date) {
    await this.prismaService.booking.update({
      where: {
        id,
      },
      data: {
        actualFinishTime: actualFinishTime,
        status: 'FINISHED',
      },
    });
    return HttpStatus.ACCEPTED;
  }
  async cancelBook(id: string) {
    const isMine = await this.prismaService.booking.findUnique({
      where: {
        id,
      },
    });
  }
}
