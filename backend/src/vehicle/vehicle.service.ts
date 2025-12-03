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

@Injectable()
export class VehicleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto, userInfo: LoginResponseDto) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { username: createVehicleDto.driverName },
      });

      if (!existingUser) {
        throw new NotFoundException(
          `Driver ${createVehicleDto.driverName} tidak ditemukan`,
        );
      }

      await this.prismaService.vehicle.create({
        data: {
          organizationName: userInfo.organizationName,
          brand: createVehicleDto.brand,
          jenisKendaraan: createVehicleDto.jenisKendaraan,
          plateNumber: createVehicleDto.plateNumber,
          durasiBongkar: createVehicleDto.durasiBongkar,
          dimensionHeight: createVehicleDto.dimensionHeight,
          dimensionLength: createVehicleDto.dimensionLength,
          dimensionWidth: createVehicleDto.dimensionWidth,
          driverName: createVehicleDto.driverName,
          isActive: createVehicleDto.isActive,
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
          jenisKendaraan: 'asc',
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
          jenisKendaraan: updateVehicleDto.jenisKendaraan,
          plateNumber: updateVehicleDto.plateNumber,
          productionYear: updateVehicleDto.productionYear,
          maxCapacity: updateVehicleDto.maxCapacity,
          dimensionLength: updateVehicleDto.dimensionLength,
          dimensionWidth: updateVehicleDto.dimensionWidth,
          dimensionHeight: updateVehicleDto.dimensionHeight,
          durasiBongkar: updateVehicleDto.durasiBongkar,
          isReefer: updateVehicleDto.isReefer,
          requiresDock: updateVehicleDto.requiresDock,
          driverName: updateVehicleDto.driverName,
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
