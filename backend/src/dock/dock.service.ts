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

@Injectable()
export class DockService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDockDto: CreateDockDto, userInfo: LoginResponseDto) {
    const {
      availableFrom,
      availableUntil,
      photos = [],
      ...rest
    } = createDockDto;

    // Set default times if not provided (00:00 to 23:59:59)
    const defaultFrom =
      availableFrom ||
      (() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
      })();
    const defaultUntil =
      availableUntil ||
      (() => {
        const date = new Date();
        date.setHours(23, 59, 59, 999);
        return date;
      })();

    try {
      const dock = await this.prismaService.dock.create({
        data: {
          ...rest,
          photos: photos || [],
          availableFrom: defaultFrom,
          availableUntil: defaultUntil,
          organizationName: userInfo.organizationName,
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

      return plainToInstance(ResponseDockDto, dock, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(filter: DockFilter, userInfo: LoginResponseDto) {
    const { page, warehouseId } = filter;

    const where: any = {
      organizationName: userInfo.organizationName,
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
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

  async findByWarehouseId(id: string) {
    const dock = await this.prismaService.dock.findFirst({
      where: {
        warehouseId: id,
      },
      include: {
        warehouse: {
          select: {
            name: true,
          },
        },
        organization: { select: { name: true } },
        busyTimes: {
          orderBy: {
            from: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plainToInstance(ResponseDockDto, dock, {
      excludeExtraneousValues: true,
      groups: ['detail'],
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

    const {
      id: _id,
      warehouseId,
      photos,
      availableFrom,
      availableUntil,
      ...rest
    } = updateDockDto;

    const updateData: any = { ...rest };

    if (warehouseId !== undefined) {
      updateData.warehouseId = warehouseId;
    }

    if (photos !== undefined) {
      updateData.photos = photos;
    }

    if (availableFrom !== undefined) {
      updateData.availableFrom = availableFrom;
    }

    if (availableUntil !== undefined) {
      updateData.availableUntil = availableUntil;
    }

    try {
      const updatedDock = await this.prismaService.dock.update({
        where: {
          id: id,
        },
        data: updateData,
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
      const result = await this.prismaService.dock.deleteMany({
        where: { id },
      });

      if (result.count === 0) {
        throw new NotFoundException('Dock tidak ditemukan');
      }

      return {
        message: 'Dock berhasil dihapus',
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus dock');
    }
  }
}
