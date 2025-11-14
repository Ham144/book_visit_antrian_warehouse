import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ResponseVehicleDto } from './dto/response-vehicle.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class VehicleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<ResponseVehicleDto> {
    try {
      const vehicle = await this.prismaService.vehicle.create({
        data: {
          brand: createVehicleDto.brand,
          jenisKendaraan: createVehicleDto.jenisKendaraan,
          durasiBongkar: createVehicleDto.durasiBongkar,
          description: createVehicleDto.description,
          maxCapacity: createVehicleDto.maxCapacity,
          Dimension: createVehicleDto.dimension,
          isActive: createVehicleDto.isActive ?? true,
        },
      });

      return plainToInstance(ResponseVehicleDto, {
        id: vehicle.id,
        brand: vehicle.brand,
        jenisKendaraan: vehicle.jenisKendaraan,
        durasiBongkar: vehicle.durasiBongkar,
        description: vehicle.description,
        maxCapacity: vehicle.maxCapacity,
        dimension: vehicle.Dimension,
        isActive: vehicle.isActive,
      });
    } catch (error) {
      throw new InternalServerErrorException('Gagal membuat vehicle');
    }
  }

  async findAll(): Promise<ResponseVehicleDto[]> {
    try {
      const vehicles = await this.prismaService.vehicle.findMany({
        orderBy: {
          jenisKendaraan: 'asc',
        },
      });

      return vehicles.map((vehicle) =>
        plainToInstance(ResponseVehicleDto, {
          id: vehicle.id,
          brand: vehicle.brand,
          jenisKendaraan: vehicle.jenisKendaraan,
          durasiBongkar: vehicle.durasiBongkar,
          description: vehicle.description,
          maxCapacity: vehicle.maxCapacity,
          dimension: vehicle.Dimension,
          isActive: vehicle.isActive,
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

      return plainToInstance(ResponseVehicleDto, {
        id: vehicle.id,
        brand: vehicle.brand,
        jenisKendaraan: vehicle.jenisKendaraan,
        durasiBongkar: vehicle.durasiBongkar,
        description: vehicle.description,
        maxCapacity: vehicle.maxCapacity,
        dimension: vehicle.Dimension,
        isActive: vehicle.isActive,
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
  ): Promise<ResponseVehicleDto> {
    try {
      const existingVehicle = await this.prismaService.vehicle.findUnique({
        where: { id },
      });

      if (!existingVehicle) {
        throw new NotFoundException(`Vehicle dengan id ${id} tidak ditemukan`);
      }

      const vehicle = await this.prismaService.vehicle.update({
        where: { id },
        data: {
          brand: updateVehicleDto.brand,
          jenisKendaraan: updateVehicleDto.jenisKendaraan,
          durasiBongkar: updateVehicleDto.durasiBongkar,
          description: updateVehicleDto.description,
          maxCapacity: updateVehicleDto.maxCapacity,
          Dimension: updateVehicleDto.dimension,
          isActive: updateVehicleDto.isActive,
        },
      });

      return plainToInstance(ResponseVehicleDto, {
        id: vehicle.id,
        brand: vehicle.brand,
        jenisKendaraan: vehicle.jenisKendaraan,
        durasiBongkar: vehicle.durasiBongkar,
        description: vehicle.description,
        maxCapacity: vehicle.maxCapacity,
        dimension: vehicle.Dimension,
        isActive: vehicle.isActive,
      });
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
