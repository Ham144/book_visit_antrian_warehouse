import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDockDto } from './dto/create-dock.dto';
import { UpdateDockDto } from './dto/update-dock.dto';
import { PrismaService } from 'src/common/prisma.service';
import { LoginResponseDto } from 'src/user/dto/login.dto';
import { DockFilter, ResponseDockDto } from './dto/response-dock.dto';
import { plainToInstance } from 'class-transformer';
import { Days } from '@prisma/client';
import { TokenPayload } from 'src/user/dto/token-payload.dto';

@Injectable()
export class DockService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDockDto: CreateDockDto, userInfo: TokenPayload) {
    const { vacants, warehouseId, photos = [], ...rest } = createDockDto;

    try {
      await this.prismaService.dock.create({
        data: {
          ...rest,
          photos: photos || [],
          warehouse: {
            connect: {
              id: warehouseId,
            },
          },
          vacants: {
            createMany: {
              data: vacants.map((vacant) => ({
                availableFrom: vacant.availableFrom,
                availableUntil: vacant.availableUntil,
                day: vacant.day as Days,
              })),
            },
          },
          dockType: rest.dockType,
          organization: {
            connect: {
              name: userInfo.organizationName,
            },
          },
        },
      });

      return HttpStatus.CREATED;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  //vendor
  async findAll(filter: DockFilter, userInfo: LoginResponseDto) {
    const { page, searchKey } = filter;

    const where: any = {
      organizationName: userInfo.organizationName,
    };

    if (searchKey) {
      where.name = {
        contains: searchKey,
        mode: 'insensitive', // case-insensitive
      };
    }

    const safePage = Number(page) || 1;

    const docks = await this.prismaService.dock.findMany({
      where,
      take: 20,
      skip: (safePage - 1) * 20,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plainToInstance(ResponseDockDto, docks, {
      excludeExtraneousValues: true,
    });
  }

  //admin/docks
  async getDocksByWarehouseId(id: string) {
    const docks = await this.prismaService.dock.findMany({
      where: {
        warehouseId: id,
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        vacants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plainToInstance(ResponseDockDto, docks, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string) {
    const dock = await this.prismaService.dock.findUnique({
      where: {
        id: id,
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        bookings: {
          include: {
            Vehicle: {
              select: {
                brand: true,
                jenisKendaraan: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        busyTimes: {
          orderBy: {
            from: 'asc',
          },
        },
      },
    });

    if (!dock) {
      throw new NotFoundException(`Dock dengan id ${id} tidak ditemukan`);
    }

    return plainToInstance(ResponseDockDto, dock, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, updateDockDto: UpdateDockDto) {
    const existingDock = await this.prismaService.dock.findUnique({
      where: { id },
    });

    if (!existingDock) {
      throw new NotFoundException(`Dock dengan id ${id} tidak ditemukan`);
    }

    const { id: _id, warehouseId, photos, vacants, ...rest } = updateDockDto;

    const updateData: any = { ...rest };

    if (warehouseId !== undefined) {
      updateData.warehouseId = warehouseId;
    }

    if (photos !== undefined) {
      updateData.photos = photos;
    }

    try {
      const updatedDock = await this.prismaService.dock.update({
        where: {
          id: id,
        },
        data: {
          ...updateData,
          vacants: {
            deleteMany: {
              dockId: id,
            },
            createMany: {
              data: vacants.map((vacant) => ({
                availableFrom: vacant.availableFrom
                  ? new Date(vacant.availableFrom)
                  : null,
                availableUntil: vacant.availableUntil
                  ? new Date(vacant.availableUntil)
                  : null,
                day: vacant.day,
                dockId: id,
              })),
            },
          },
        },
        include: {
          warehouse: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
      });

      return plainToInstance(ResponseDockDto, updatedDock, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string) {
    try {
      await this.prismaService.dock.delete({
        where: {
          id,
        },
      });

      return HttpStatus.ACCEPTED;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Gagal menghapus dock');
    }
  }
}
