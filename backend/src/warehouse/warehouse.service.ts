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

  private async resolveMembers(usernames?: string[]) {
    if (!usernames || usernames.length === 0) {
      return [];
    }

    const users = await this.prismaService.user.findMany({
      where: {
        username: {
          in: usernames,
        },
      },
    });

    const foundUsernames = new Set(users.map((user) => user.username));

    const missingUsers = usernames.filter(
      (username) => !foundUsernames.has(username),
    );
    if (missingUsers.length > 0) {
      throw new NotFoundException(
        `User${missingUsers.length > 1 ? 's' : ''} ${missingUsers.join(', ')} tidak ditemukan`,
      );
    }

    return users.map((user: User) => ({ username: user.username }));
  }

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

  async getWarehouses(searchKey?: string, userInfo?: any) {
    const isSuperAdmin = userInfo?.description === 'IT';

    let where: any = {};

    if (isSuperAdmin) {
      // Bentuk where dasar
      where = {
        ...(searchKey && {
          name: {
            contains: searchKey,
            mode: 'insensitive',
          },
        }),
      };
    }

    // Jika bukan superadmin, tampilkan hanya warehouse miliknya
    if (!isSuperAdmin) {
      where.members = {
        some: {
          username: userInfo.username,
        },
      };
    }

    // Query prisma
    const warehouses = await this.prismaService.warehouse.findMany({
      where,
      include: {
        members: true,
        docks: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return warehouses.map((warehouse) =>
      plainToInstance(responseWarehouseDto, warehouse),
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
