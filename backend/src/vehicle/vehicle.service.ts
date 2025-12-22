import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ResponseVehicleDto } from './dto/response-vehicle.dto';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from 'src/user/dto/login.dto';
import { VehicleType } from '@prisma/client';
import { TokenPayload } from 'src/user/dto/token-payload.dto';

@Injectable()
export class VehicleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto, userInfo: LoginResponseDto) {
    const { vehicleType, requiresDock, ...rest } = createVehicleDto;
    try {
      await this.prismaService.vehicle.create({
        data: {
          ...rest,
          vehicleType: VehicleType[vehicleType],
          requiresDock: requiresDock[requiresDock],
          organizationName: userInfo?.organizationName,
        },
      });
      return HttpStatus.CREATED;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    try {
      const vehicles = await this.prismaService.vehicle.findMany({
        orderBy: {
          createdAt: 'asc',
        },
      });

      return vehicles.map((vehicle) =>
        plainToInstance(ResponseVehicleDto, vehicle, {
          excludeExtraneousValues: true,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil daftar vehicle');
    }
  }

  //note: saat ini find all & getVendorVehicles masih sama hasilnya
  async getVendorVehicles(userInfo: TokenPayload) {
    try {
      const vehicles = await this.prismaService.vehicle.findMany({
        orderBy: {
          createdAt: 'asc',
        },
      });

      return vehicles.map((vehicle) =>
        plainToInstance(ResponseVehicleDto, vehicle, {
          excludeExtraneousValues: true,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil daftar vehicle');
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

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    try {
      const existingVehicle = await this.prismaService.vehicle.findUnique({
        where: { id },
      });

      if (!existingVehicle) {
        throw new NotFoundException(`Vehicle dengan id ${id} tidak ditemukan`);
      }

      await this.prismaService.vehicle.update({
        where: { id },
        data: {
          brand: updateVehicleDto.brand,
          vehicleType: updateVehicleDto.vehicleType,
          productionYear: updateVehicleDto.productionYear,
          maxCapacity: updateVehicleDto.maxCapacity,
          durasiBongkar: updateVehicleDto.durasiBongkar,
          requiresDock: updateVehicleDto.requiresDock,
          description: updateVehicleDto.description,
          isActive: updateVehicleDto.isActive,
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
