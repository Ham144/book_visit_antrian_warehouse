import {
  ForbiddenException,
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
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { AuthService } from 'src/user/auth.service';
import { RedisService } from 'src/redis/redis.service';
import { randomUUID } from 'crypto';
import { LoginResponseDto } from 'src/user/dto/login.dto';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly redis: RedisService,
  ) {}

  async createWarehouse(body: CreateWarehouseDto, userInfo: any) {
    const { userWarehouseAccesses = [], homeMembers, ...data } = body;

    try {
      await this.prismaService.warehouse.upsert({
        where: { name: data.name },
        update: {
          // kalau mau update sedikit, taruh di sini
          userWarehouseAccesses: {
            connect: userWarehouseAccesses.map((username) => ({ username })),
          },
        },
        create: {
          ...data,
          userWarehouseAccesses: {
            connect: userWarehouseAccesses.map((username) => ({ username })),
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

    const { userWarehouseAccesses, homeMembers, name, ...data } = body;

    return this.prismaService.$transaction(async (tx) => {
      const updateData: any = { ...data };

      if (userWarehouseAccesses !== undefined) {
        updateData.userWarehouseAccesses = {
          set: userWarehouseAccesses.map((username) => ({ username })),
        };
      }

      await tx.warehouse.update({
        where: { id },
        data: updateData,
      });

      const warehouseWithAccess = await tx.warehouse.findUnique({
        where: { id },
        include: {
          homeMembers: { select: { username: true, displayName: true } },
          docks: { select: { name: true, id: true } },
          userWarehouseAccesses: {
            select: { username: true, displayName: true },
          },
          bookings: {
            include: {
              Vehicle: {
                select: {
                  brand: true,
                  vehicleType: true,
                },
              },
              Dock: { select: { name: true, id: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return plainToInstance(responseWarehouseDto, warehouseWithAccess, {
        excludeExtraneousValues: true,
        groups: ['detail'],
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
        homeMembers: { select: { username: true } },
        docks: { select: { name: true } },
        userWarehouseAccesses: { select: { username: true } },
      },
      orderBy: { name: 'asc' },
      take: 10,
      skip: (page - 1) * 10,
    });

    return warehouses.map((w) =>
      plainToInstance(
        responseWarehouseDto,
        {
          ...w,
          warehouseAccess: w.userWarehouseAccesses?.map(
            (access) => access.username,
          ),
        },
        {
          excludeExtraneousValues: true,
          groups: ['detail'],
        },
      ),
    );
  }

  async getAccessWarehouses(userInfo: TokenPayload) {
    const warehouses = await this.prismaService.warehouse.findMany({
      where: {
        userWarehouseAccesses: {
          some: {
            username: userInfo.username,
          },
        },
      },
    });
    return warehouses.map((w) =>
      plainToInstance(responseWarehouseDto, w, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async getWarehouseDetail(id: string) {
    const warehouse = await this.prismaService.warehouse.findUnique({
      where: { id },
      include: {
        homeMembers: { select: { username: true, displayName: true } },
        docks: { select: { name: true, id: true } },
        userWarehouseAccesses: {
          select: {
            username: true,
            displayName: true,
          },
        },
        bookings: {
          include: {
            Vehicle: {
              select: { brand: true, vehicleType: true },
            },
            Dock: { select: { name: true, id: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    const warehouseData = {
      ...warehouse,
      userWarehouseAccesses:
        (warehouse as any)?.userWarehouseAccesses?.map(
          (access: any) => access.username,
        ) ?? [],
    };

    return plainToInstance(responseWarehouseDto, warehouseData, {
      excludeExtraneousValues: true,
      groups: ['detail'],
    });
  }

  async switchHomeWarehouse(id: string, userInfo: LoginResponseDto, req: any) {
    //coba periksa apakah benar anggota
    const targetWH = await this.prismaService.warehouse.findUnique({
      where: {
        id: id,
        userWarehouseAccesses: {
          some: {
            username: userInfo.username,
          },
        },
      },
    });

    if (!targetWH) {
      throw new ForbiddenException('Anda bukan anggota warehouse ini');
    }

    //edit user db
    const editedUser = await this.prismaService.user.update({
      where: {
        username: userInfo.username,
      },
      data: {
        homeWarehouseId: targetWH.id,
      },
      include: {
        homeWarehouse: true,
        organizations: { select: { name: true } },
        warehouseAccess: { select: { name: true } },
      },
    });

    const payload: TokenPayload = {
      description: userInfo.description,
      homeWarehouseId: targetWH?.id || null,
      jti: randomUUID(),
      vendorName: userInfo?.vendorName || null,
      organizationName: targetWH.organizationName,
      username: userInfo.username,
    };

    // Generate JWT tokens using reusable method
    const access_token = this.authService.generateToken(payload, 'access');
    const refresh_token = this.authService.generateToken(payload, 'refresh');

    if (!access_token || !refresh_token) {
      throw new Error('Failed to generate authentication tokens');
    }

    //simpan refresh_token ke redis
    await this.redis.set(
      payload.jti,
      JSON.stringify({
        username: payload.username,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }),
      604800, // 1 minggu
    );
    const user: LoginResponseDto = {
      access_token,
      refresh_token,
      organizationName: userInfo.organizationName,
      description: userInfo.description,
      username: userInfo.username,
      displayName: editedUser.displayName,
      homeWarehouse: targetWH,
    };
    return plainToInstance(
      LoginResponseDto,
      {
        access_token,
        refresh_token,
        ...user,
        ...payload,
      },
      {
        excludeExtraneousValues: true,
        groups: ['login'],
      },
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
