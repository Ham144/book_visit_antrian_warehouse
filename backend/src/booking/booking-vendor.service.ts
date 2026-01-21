import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from 'src/common/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ResponseBookingDto } from './dto/response-booking.dto';
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { BookingStatus, Days } from 'src/common/shared-enum';

@Injectable()
export class BookingforVendorService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, userInfo: TokenPayload) {
    const {
      vehicleId,
      warehouseId,
      dockId,
      arrivalTime,
      estimatedFinishTime,
      driverUsername,
      ...rest
    } = createBookingDto;

    function HHMM_to_minutes(hhmm: string): number {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    }
    const vehicle = await this.prismaService.vehicle.findFirst({
      where: {
        id: vehicleId,
      },
    });

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
        throw new BadRequestException(
          `Waktu terkait overlap busy time ${busyTimes[overLapIdx].reason}, antara ${busyTimes[overLapIdx].from} sampai ${busyTimes[overLapIdx].to}`,
        );
      } else if (
        busyTimes[overLapIdx].recurring === 'WEEKLY' &&
        busyTimes[overLapIdx].recurringCustom.includes(
          Days[arrivalTime.getDay()],
        )
      ) {
        throw new BadRequestException(
          `Waktu terkait overlap busy time ${busyTimes[overLapIdx].reason}, antara ${busyTimes[overLapIdx].from} sampai ${busyTimes[overLapIdx].to}`,
        );
      } else
        throw new BadRequestException(
          `Waktu terkait overlap busy time ${busyTimes[overLapIdx].reason}, antara ${busyTimes[overLapIdx].from} sampai ${busyTimes[overLapIdx].to}`,
        );
    }

    //cek apakah boleh allowedTypes
    const allowedTypesSuccess = await this.prismaService.dock.findFirst({
      where: {
        id: dockId,
        allowedTypes: {
          has: vehicle.vehicleType,
        },
      },
    });
    if (!allowedTypesSuccess) {
      throw new BadRequestException(
        'tipe kendaraan tidak didukung di gate ini',
      );
    }

    const arrival = new Date(arrivalTime);

    const durationMinutes = vehicle.durasiBongkar;
    const end = new Date(arrival);
    end.setMinutes(end.getMinutes() + durationMinutes);

    //cek overlap to another booking
    const overlapDockedHour = await this.prismaService.booking.findFirst({
      where: {
        dockId: dockId,
        // id: { not: createBookingDto.id },//untuk update
        status: { notIn: [BookingStatus.CANCELED, BookingStatus.FINISHED, BookingStatus.UNLOADING] },
        AND: [
          {
            arrivalTime: {
              lt: end, // booking lain mulai sebelum booking ini selesai
            },
          },
          {
            arrivalTime: {
              gt: new Date(arrival.getTime()),
            },
          },
        ],
      },
    });

    if (overlapDockedHour) {
      throw new BadRequestException(
        `Waktu terkait overlap booking ${overlapDockedHour.code}, antara ${overlapDockedHour.arrivalTime} sampai ${estimatedFinishTime}`,
      );
    }
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(arrivalTime));
    
    const randomAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const identifyer = randomAlphabet[Math.floor(Math.random() * randomAlphabet.length)];
    console.log(identifyer)
    const code = `${driverUsername.slice(0, 7)}-${vehicle.brand.slice(0, 7)}-${identifyer[0]}`;
    
    
    await this.prismaService.booking.create({
      data: {
        status: 'IN_PROGRESS',
        arrivalTime: arrivalTime,
        estimatedFinishTime: estimatedFinishTime,
        code: code,
        actualFinishTime: null,
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
        ...rest,
      },
    });

    return HttpStatus.ACCEPTED;
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

  async cancelBook(id: string, userinfo: TokenPayload, body: { canceledReason: string }) {
    const { canceledReason } = body;
    const isMine = await this.prismaService.booking.findFirst({
      where: {
        id,
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
        canceledReason: canceledReason + "by " + userinfo.username,
      },
    });
    return HttpStatus.ACCEPTED;
  }

  async getStatsForDriver() {
    const bookings = await this.prismaService.booking.findMany({
      where: {},
    });
  }

  async getStatsForAdminVendor() {}
}
