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
      warehouseId,
      photos = [],
      name,
      dockType,
      supportedVehicleTypes = [],
      maxLength,
      maxWidth,
      maxHeight,
      availableFrom,
      availableUntil,
      isActive = true,
      priority,
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
          name,
          warehouseId,
          photos: photos || [],
          dockType,
          supportedVehicleTypes: supportedVehicleTypes || [],
          maxLength,
          maxWidth,
          maxHeight,
          availableFrom: defaultFrom,
          availableUntil: defaultUntil,
          isActive: isActive ?? true,
          priority,
          organizationName: userInfo.organizationName,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plainToInstance(ResponseDockDto, docks, {
      excludeExtraneousValues: true,
    });
  }

  findByWarehouseId(id: string) {
    return `This action returns all dock`;
  }

  findOne(id: string) {
    return `This action returns a #${id} dock`;
  }

  async update(id: string, updateDockDto: UpdateDockDto) {
    const { warehouseId, ...rest } = updateDockDto;

    const updateData: any = { ...rest };
    if (warehouseId) {
      updateData.warehouseId = warehouseId;
    }

    await this.prismaService.dock.update({
      where: {
        id: id,
      },
      data: updateData,
    });
    return HttpStatus.ACCEPTED;
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
