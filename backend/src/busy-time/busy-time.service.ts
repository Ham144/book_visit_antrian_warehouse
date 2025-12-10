import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBusyTimeDto } from './dto/create-busy-time.dto';
import { UpdateBusyTimeDto } from './dto/update-busy-time.dto';
import { PrismaService } from 'src/common/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ResponseBusyTimeDockDto } from './dto/response-busy-time.dto';
import { Days } from '@prisma/client';

@Injectable()
export class BusyTimeService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBusyTimeDto: CreateBusyTimeDto) {
    const { recurringCustom, ...rest } = createBusyTimeDto;

    if (rest.recurring == 'WEEKLY' && !recurringCustom?.length) {
      throw new BadRequestException(
        'WEEKLY recurring memerlukan recurring custom',
      );
    } else if (rest.recurring == 'MONTHLY' && !rest.recurringStep) {
      throw new BadRequestException(
        'MONTHLY recurring memerlukan tanggal spesifik',
      );
    }

    const isDuplicateHour = await this.prismaService.dockBusyTime.findFirst({
      where: {
        dockId: rest.dockId,
        from: rest.from,
        to: rest.to,
        recurring: rest.recurring,
      },
    });
    console.log(isDuplicateHour);
    if (isDuplicateHour) {
      throw new BadRequestException(
        'Busy time kelihatannya duplikat dengan ' + isDuplicateHour.reason,
      );
    }

    await this.prismaService.dockBusyTime.create({
      data: {
        ...rest,
        recurringCustom: recurringCustom?.map((day) => Days[day]) || undefined,
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

    return busyTimes.map((bt) =>
      plainToInstance(ResponseBusyTimeDockDto, bt, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async update(id: string, updateBusyTimeDto: UpdateBusyTimeDto) {
    const { recurringCustom, ...rest } = updateBusyTimeDto;

    if (rest.recurring == 'WEEKLY' && !recurringCustom?.length) {
      throw new BadRequestException(
        'WEEKLY recurring memerlukan recurring custom',
      );
    } else if (!rest.recurringStep && rest.recurring != 'WEEKLY') {
      throw new BadRequestException(
        'WEEKLY recurring memerlukan recurring step',
      );
    }

    const isDuplicateHour = await this.prismaService.dockBusyTime.findFirst({
      where: {
        id: { not: id },
        dockId: rest.dockId,
        from: rest.from,
        to: rest.to,
        recurring: rest.recurring,
      },
    });
    if (isDuplicateHour) {
      throw new BadRequestException(
        'Busy time kelihatannya duplikat dengan ' + isDuplicateHour.reason,
      );
    }

    await this.prismaService.dockBusyTime.update({
      where: {
        id: id,
      },
      data: {
        ...rest,
        recurringCustom: recurringCustom?.map((day) => Days[day]) || undefined,
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
