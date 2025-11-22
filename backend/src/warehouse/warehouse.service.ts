import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { responseWarehouseDto } from './dto/response-warehouse.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class WarehouseService {
  constructor(private readonly prismaService: PrismaService) {}
  async createWarehouse(body: CreateWarehouseDto, userInfo: any) {
    const { warehouseAccess = [], members: _members, ...data } = body;

    try {
      await this.prismaService.warehouse.upsert({
        where: { name: data.name },
        update: {
          // kalau mau update sedikit, taruh di sini
          userWarehouseAccesses: {
            connect: warehouseAccess.map((username) => ({ username })),
          },
        },
        create: {
          ...data,
          userWarehouseAccesses: {
            connect: warehouseAccess.map((username) => ({ username })),
          },
          organizationName: userInfo?.organizationName,
        },
      });

      return HttpStatus.CREATED;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateWarehouse(id: string, body: UpdateWarehouseDto) {
    const existingWarehouse = await this.prismaService.warehouse.findUnique({
      where: { id },
    });
    if (!existingWarehouse) {
      throw new NotFoundException(`Warehouse ${id} tidak ditemukan`);
    }

    const { warehouseAccess = [], members: _members, ...data } = body;

    return this.prismaService.$transaction(async (tx) => {
      const warehouse = await tx.warehouse.update({
        where: { id },
        data,
        include: {
          members: { select: { username: true } },
          docks: true,
        },
      });

      const warehouseWithAccess = await tx.warehouse.findUnique({
        where: { id },
        include: {
          members: { select: { username: true } },
          docks: true,
          userWarehouseAccesses: { select: { username: true } },
        },
      });

      return plainToInstance(responseWarehouseDto, {
        ...warehouseWithAccess,
        warehouseAccess:
          warehouseWithAccess?.userWarehouseAccesses?.map(
            (access) => access.username,
          ) ?? [],
      });
    });
  }

  async getWarehouses(userInfo: any, searchKey?: string, page: number = 1) {
    const where: any = {
      organizationName: userInfo.organizationName,
    };

    if (searchKey) {
      where.name = {
        contains: searchKey,
        mode: 'insensitive', // case-insensitive
      };
    }

    const warehouses = await this.prismaService.warehouse.findMany({
      where,
      include: {
        members: { select: { username: true } },
        docks: { select: { name: true } },
        userWarehouseAccesses: { select: { username: true } },
      },
      orderBy: { name: 'asc' },
      take: 10,
      skip: (page - 1) * 10,
    });

    return warehouses.map((w) =>
      plainToInstance(responseWarehouseDto, {
        ...w,
        warehouseAccess: w.userWarehouseAccesses?.map(
          (access) => access.username,
        ),
      }),
    );
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
