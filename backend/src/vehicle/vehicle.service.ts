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
import { TokenPayload } from 'src/user/dto/token-payload.dto';

@Injectable()
export class VehicleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto, userInfo: LoginResponseDto) {
    try {
      for (let i = 0; i < createVehicleDto.driverNames.length; i++) {
        const userHaseVehicle = await this.prismaService.user.findUnique({
          where: {
            username: createVehicleDto.driverNames[i],
            vehicleId: {
              not: null,
            },
          },
          include: { vehicle: true },
        });

        if (!userHaseVehicle) {
          throw new NotFoundException(
            `Driver ${createVehicleDto.driverNames[i]} sudah terhubung ke ${userHaseVehicle.vehicle.brand}-${userHaseVehicle.vehicle.jenisKendaraan}`,
          );
        }
      }

      await this.prismaService.vehicle.create({
        data: {
          organizationName: userInfo.organizationName,
          brand: createVehicleDto.brand,
          jenisKendaraan: createVehicleDto.jenisKendaraan,
          durasiBongkar: createVehicleDto.durasiBongkar,
          dimensionHeight: createVehicleDto.dimensionHeight,
          dimensionLength: createVehicleDto.dimensionLength,
          dimensionWidth: createVehicleDto.dimensionWidth,
          drivers: {
            connect: createVehicleDto.driverNames.map((d) => ({ username: d })),
          },
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
          productionYear: updateVehicleDto.productionYear,
          maxCapacity: updateVehicleDto.maxCapacity,
          dimensionLength: updateVehicleDto.dimensionLength,
          dimensionWidth: updateVehicleDto.dimensionWidth,
          dimensionHeight: updateVehicleDto.dimensionHeight,
          durasiBongkar: updateVehicleDto.durasiBongkar,
          isReefer: updateVehicleDto.isReefer,
          requiresDock: updateVehicleDto.requiresDock,
          drivers: {
            connect: updateVehicleDto.driverNames.map((d) => ({
              username: d,
            })),
          },
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

  async getMyVehicles(userInfo: TokenPayload) {
    const myVehicles = await this.prismaService.vehicle.findMany({
      where: {
        organizationName: userInfo.organizationName,
        drivers: {
          some: {
            username: userInfo.username,
          },
        },
      },
    });
    return myVehicles.map((vehicle) =>
      plainToInstance(ResponseVehicleDto, vehicle, {
        excludeExtraneousValues: true,
      }),
    );
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
