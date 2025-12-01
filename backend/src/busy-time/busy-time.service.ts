import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateBusyTimeDto } from './dto/create-busy-time.dto';
import { UpdateBusyTimeDto } from './dto/update-busy-time.dto';
import { PrismaService } from 'src/common/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ResponseBusyTimeDockDto } from './dto/response-busy-time.dto';
import { Days, Recurring } from '@prisma/client';

@Injectable()
export class BusyTimeService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBusyTimeDto: CreateBusyTimeDto) {
    const { recurringCustom, ...rest } = createBusyTimeDto;
    const conflictRecurring = await this.prismaService.dockBusyTime.findFirst({
      where: {
        dockId: createBusyTimeDto.dockId,
        recurring: createBusyTimeDto.recurring,

        OR: [
          // DAILY
          {
            recurring: Recurring.DAILY,
            recurringStep: createBusyTimeDto.recurringStep,
          },

          // WEEKLY
          {
            recurring: Recurring.WEEKLY,
            recurringCustom: {
              equals: createBusyTimeDto.recurringCustom.map((rc) => {
                return Days[rc];
              }),
            },
          },

          // MONTHLY
          {
            recurring: Recurring.MONTHLY,
            recurringStep: createBusyTimeDto.recurringStep, // tanggal
          },
        ],
      },
    });

    if (conflictRecurring) {
      throw new Error(
        `Waktu terkait overlap dengan ${conflictRecurring.reason}`,
      );
    }

    const recurringCustomEnum = recurringCustom.map((rc) => {
      return Recurring[rc];
    });

    await this.prismaService.dockBusyTime.create({
      data: {
        recurringCustom: recurringCustomEnum,
        ...rest,
      },
    });
    return HttpStatus.CREATED;
  }

  async findAll(warehouseId: string) {
    const busyTimes = await this.prismaService.dockBusyTime.findMany({
      where: {
        dock: {
          warehouseId,
        },
      },
      include: {
        dock: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return busyTimes.map((bt) => plainToInstance(ResponseBusyTimeDockDto, bt));
  }

  async update(id: string, updateBusyTimeDto: UpdateBusyTimeDto) {
    const { recurringCustom, ...rest } = updateBusyTimeDto;
    const overlap = await this.prismaService.dockBusyTime.findFirst({
      where: {
        dockId: updateBusyTimeDto.dockId,
        AND: [
          {
            from: { lt: updateBusyTimeDto.to },
          },
          {
            to: { gt: updateBusyTimeDto.from },
          },
        ],
      },
    });

    if (overlap) {
      throw new Error(
        `Waktu terkait overlap ${overlap.reason}, antara waktu ${overlap.from} sampai ${overlap.to}`,
      );
    }
    await this.prismaService.dockBusyTime.update({
      where: {
        id,
      },
      data: {
        ...rest,
        recurringCustom: recurringCustom.map((rc) => {
          return Days[rc];
        }),
      },
    });
    return HttpStatus.ACCEPTED;
  }

  async remove(id: string) {
    await this.prismaService.dockBusyTime.delete({
      where: {
        id,
      },
    });
    return HttpStatus.ACCEPTED;
  }
}
