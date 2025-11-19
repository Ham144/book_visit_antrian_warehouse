import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { User, Warehouse } from '@prisma/client';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { responseWarehouseDto } from './dto/response-warehouse.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WarehouseService {
  constructor(private readonly prismaService: PrismaService) {}

  async createWarehouse(body: CreateWarehouseDto) {
    const warehouse = await this.prismaService.warehouse.create({
      data: {
        ...body,
        members: {
          connect: body.members.map((username) => ({ username })),
        },
      },
      include: {
        members: true,
        docks: true,
      },
    });
    return plainToInstance(responseWarehouseDto, warehouse);
  }

  async updateWarehouse(id: string, body: UpdateWarehouseDto) {
    const existingWarehouse = await this.prismaService.warehouse.findUnique({
      where: { id },
    });
    if (!existingWarehouse) {
      throw new NotFoundException(`Warehouse ${id} tidak ditemukan`);
    }

    const warehouse = await this.prismaService.warehouse.update({
      where: {
        id,
      },
      data: {
        ...body,
        members: {
          connect: body.members.map((username) => ({ username })),
        },
      },
      include: {
        members: true,
      },
    });

    return plainToInstance(responseWarehouseDto, warehouse);
  }

  async getWarehouses(userInfo: any, searchKey?: string, page: number = 1) {
    let where: any = {
      organization: {
        name: userInfo.organizationName,
      },
    };

    if (searchKey) {
      where = {
        AND: [
          {
            organization: {
              name: userInfo.organizationName,
            },
          },
          {
            OR: [
              { name: { contains: searchKey } },
              { description: { contains: searchKey } },
            ],
          },
        ],
      };
    }

    const warehouses = await this.prismaService.warehouse.findMany({
      where,
      include: {
        members: true,
        docks: true,
      },
      orderBy: { name: 'asc' },
      take: 10,
      skip: (page - 1) * 10, // sekarang page = 1 kalau undefined
    });

    return warehouses.map((w) => plainToInstance(responseWarehouseDto, w));
  }

  async deleteWarehouse(id: string) {
    try {
      const result = await this.prismaService.warehouse.deleteMany({
        where: { id },
      });

      if (result.count === 0) {
        throw new NotFoundException('Warehouse tidak ditemukan');
      }

      return {
        message: 'Warehouse berhasil dihapus',
        statusCode: 200,
      };
    } catch (error) {
      // Prisma error misalnya invalid id, connection issue, dsb
      console.error('Delete error:', error);
      throw new InternalServerErrorException('Gagal menghapus warehouse');
    }
  }
}
