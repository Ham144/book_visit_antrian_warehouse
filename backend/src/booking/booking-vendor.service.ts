import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from 'src/common/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ResponseBookingDto } from './dto/response-booking.dto';
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { Days } from '@prisma/client';

@Injectable()
export class BookingforVendorService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, userInfo: TokenPayload) {
    const {
      estimatedFinishTime,
      vehicleId,
      warehouseId,
      dockId,
      arrivalTime,
      driverUsername,
    } = createBookingDto;

    function HHMM_to_minutes(hhmm: string): number {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    }

    const bookingFrom = arrivalTime.getHours() * 60 + arrivalTime.getMinutes();
    const bookingTo =
      estimatedFinishTime.getHours() * 60 + estimatedFinishTime.getMinutes();

    const busyTimes = await this.prismaService.dockBusyTime.findMany({
      where: { dockId },
    });

    const overLapIdx = busyTimes.findIndex((busy) => {
      const busyFrom = HHMM_to_minutes(busy.from);
      const busyTo = HHMM_to_minutes(busy.to);
      return busyFrom < bookingTo && busyTo > bookingFrom;
    });

    if (overLapIdx != -1) {
      if (
        busyTimes[overLapIdx].recurring === 'MONTHLY' &&
        busyTimes[overLapIdx].recurringStep === arrivalTime.getDate()
      ) {
        throw new Error(
          `Waktu terkait overlap busy time ${busyTimes[overLapIdx].reason}, antara ${busyTimes[overLapIdx].from} sampai ${busyTimes[overLapIdx].to}`,
        );
      } else if (
        busyTimes[overLapIdx].recurring === 'WEEKLY' &&
        busyTimes[overLapIdx].recurringCustom.includes(
          Days[arrivalTime.getDay()],
        )
      ) {
        throw new Error(
          `Waktu terkait overlap busy time ${busyTimes[overLapIdx].reason}, antara ${busyTimes[overLapIdx].from} sampai ${busyTimes[overLapIdx].to}`,
        );
      } else
        throw new Error(
          `Waktu terkait overlap busy time ${busyTimes[overLapIdx].reason}, antara ${busyTimes[overLapIdx].from} sampai ${busyTimes[overLapIdx].to}`,
        );
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

    const organization = await this.prismaService.organization.findFirst({
      where: {
        name: userInfo.organizationName,
      },
    });
    const abbr = organization.name
      .toUpperCase()
      .split(' ')
      .map((word) => word[0])
      .join('');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randStr = Array(6)
      .fill(0)
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
    const code = `${abbr}-${randStr}`;

    await this.prismaService.booking.create({
      data: {
        status: 'IN_PROGRESS',
        arrivalTime: arrivalTime,
        code: code,
        actualFinishTime: null,
        estimatedFinishTime: estimatedFinishTime,
        Vehicle: { connect: { id: vehicleId } },
        Warehouse: { connect: { id: warehouseId } },
        Dock: { connect: { id: dockId } },
        createdBy: {
          connect: {
            username: userInfo.username,
          },
        },
        driver: {
          connect: {
            username: driverUsername,
          },
        },
        organization: {
          connect: {
            name: userInfo.organizationName,
          },
        },
      },
    });

    return HttpStatus.ACCEPTED;
  }

  async findAllForVendor(userInfo: TokenPayload) {
    const bookings = await this.prismaService.booking.findMany({
      where: {
        organization: {
          name: userInfo.organizationName,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return plainToInstance(ResponseBookingDto, bookings, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: {
        id,
      },
      include: {
        Vehicle: true,
        Warehouse: true,
        Dock: true,
        driver: true,
        organization: true,
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

  async cancelBook(
    id: string,
    body: { canceledReason: string },
    userInfo: TokenPayload,
  ) {
    const { canceledReason } = body;

    const isMine = await this.prismaService.booking.findFirst({
      where: {
        id,
        // createByUsername: userInfo.username,
      },
    });

    if (!isMine) {
      throw new BadRequestException(
        'tidak bisa menghapus booking yang bukan buatan anda',
      );
    }

    await this.prismaService.booking.update({
      where: {
        id,
      },
      data: {
        status: 'CANCELED',
        canceledReason,
      },
    });
    return HttpStatus.ACCEPTED;
  }
}
