import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ResponseVehicleDto } from './dto/response-vehicle.dto';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from 'src/user/dto/login.dto';
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { VehicleType } from 'src/common/shared-enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehicleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto, userInfo: LoginResponseDto) {
    const { vehicleType, isGlobalWarehouse, ...rest } = createVehicleDto;
    try {
      await this.prismaService.vehicle.create({
        data: {
          ...rest,
          vehicleType: VehicleType[vehicleType],
          organizationName: userInfo?.organizationName,
          isGlobalWarehouse: Boolean(isGlobalWarehouse),
          warehouseId: userInfo.homeWarehouseId,
        },
      });
      return HttpStatus.CREATED;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(
    page: number,
    searchKey: string,
    userInfo: TokenPayload,
    selectedWarehouseId?: string,
  ) {
    try {
      const warehouseScope = selectedWarehouseId
        ? {
            OR: [
              { warehouseId: selectedWarehouseId },
              { isGlobalWarehouse: true },
            ],
          }
        : {
            OR: [
              { warehouseId: userInfo.homeWarehouseId },
              { isGlobalWarehouse: true },
            ],
          };

      let where: Prisma.VehicleWhereInput = {
        AND: [warehouseScope],
      };

      if (searchKey) {
        (where.AND as Prisma.VehicleWhereInput[]).push({
          OR: [
            {
              brand: {
                contains: searchKey,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: searchKey,
                mode: 'insensitive',
              },
            },
          ],
        });
      }

      const vehicles = await this.prismaService.vehicle.findMany({
        where,
        orderBy: {
          bookings: {
            _count: 'asc',
          },
        },
        skip: (page - 1) * 10,
      });

      return vehicles.map((vehicle) =>
        plainToInstance(ResponseVehicleDto, vehicle, {
          excludeExtraneousValues: true,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string): Promise<ResponseVehicleDto> {
    try {
      const vehicle = await this.prismaService.vehicle.findUnique({
        where: { id },
      });

      if (!vehicle) {
        throw new NotFoundException(`Vehicle dengan id ${id} tidak ditemukan`);
      }

      return plainToInstance(ResponseVehicleDto, vehicle, {
        excludeExtraneousValues: false,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil vehicle');
    }
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
    userInfo: TokenPayload,
  ) {
    try {
      const existingVehicle = await this.prismaService.vehicle.findUnique({
        where: { id },
      });

      if (!existingVehicle) {
        throw new NotFoundException(`Vehicle dengan id ${id} tidak ditemukan`);
      }
      if (!userInfo.homeWarehouseId) {
        throw new BadRequestException(
          'pencegahan vehicle menghilang: user tidak punya home warehouse',
        );
      }
      if (userInfo.homeWarehouseId)
        await this.prismaService.vehicle.update({
          where: { id },
          data: {
            brand: updateVehicleDto.brand,
            vehicleType: updateVehicleDto.vehicleType,
            productionYear: updateVehicleDto.productionYear,
            durasiBongkar: updateVehicleDto.durasiBongkar,
            description: updateVehicleDto.description,
            isActive: updateVehicleDto.isActive,
            isGlobalWarehouse: updateVehicleDto.isGlobalWarehouse,
            warehouseId: userInfo.homeWarehouseId,
          },
        });

      return HttpStatus.ACCEPTED;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal memperbarui vehicle');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.prismaService.vehicle.deleteMany({
        where: { id },
      });

      if (result.count === 0) {
        throw new NotFoundException(`Vehicle dengan id ${id} tidak ditemukan`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus vehicle');
    }
  }
}
