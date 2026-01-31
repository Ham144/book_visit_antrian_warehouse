import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMyOrganizationDto } from './dto/create-my-organization.dto';
import { UpdateMyOrganizationDto } from './dto/update-my-organization.dto';
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { PrismaService } from 'src/common/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ResponseMyOrganizationDto } from './dto/response-my-organization.dto';
import { AuthService } from 'src/user/auth.service';
import { RedisService } from 'src/redis/redis.service';
import { randomUUID } from 'crypto';
import { LoginResponseDto } from 'src/user/dto/login.dto';
import {
  BookingStatus,
  GetLandingPageStats,
  ROLE,
  SubscriptionPlan,
} from 'src/common/shared-enum';
import { BaseProps } from 'src/common/shared-interface';
import { ResponseMyOrganizationSettingsDto } from './dto/response-my-organization-settings.dto';

@Injectable()
export class MyOrganizationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly redis: RedisService,
  ) {}

  async create(createMyOrganizationDto: CreateMyOrganizationDto) {
    await this.prismaService.organization.create({
      data: {
        name: createMyOrganizationDto.name,
        subscription: {
          create: {
            start: new Date(),
            plan: SubscriptionPlan.PREMIUM,
          },
        },
        accounts: {
          connect: createMyOrganizationDto.accounts.map((user) => ({
            username: user.username,
          })),
        },
        AD_HOST: createMyOrganizationDto.AD_HOST,
        AD_PORT: createMyOrganizationDto.AD_PORT,
        AD_DOMAIN: createMyOrganizationDto.AD_DOMAIN,
        AD_BASE_DN: createMyOrganizationDto.AD_BASE_DN,
      },
    });
  }

  async getMyOrganizations(userInfo: TokenPayload) {
    const organizations = await this.prismaService.organization.findMany({
      where: {
        accounts: {
          some: {
            username: userInfo.username,
          },
        },
      },
    });
    return organizations.map((org) =>
      plainToInstance(ResponseMyOrganizationDto, org, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async getAllOrganizations(filter: BaseProps) {
    const { page, searchKey } = filter;

    let where = {};
    if (searchKey) {
      where = {
        OR: [
          {
            name: {
              contains: searchKey,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    const organizations = await this.prismaService.organization.findMany({
      where,
      include: {
        accounts: {
          select: {
            username: true,
            displayName: true,
          },
        },
        subscription: true,
        warehouses: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        docks: {
          select: {
            name: true,
          },
        },
        vehicles: {
          select: {
            id: true,
          },
        },
      },
      take: 20,
      skip: (page - 1) * 20,
    });

    return organizations.map((org) =>
      plainToInstance(ResponseMyOrganizationDto, org, {
        excludeExtraneousValues: true,
        groups: ['detail'],
      }),
    );
  }

  async findOne(name: string) {
    const org = await this.prismaService.organization.findUnique({
      where: {
        name,
      },
      include: {
        accounts: {
          select: {
            username: true,
            displayName: true,
          },
        },
        subscription: true,
        warehouses: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        bookings: {
          include: {
            Vehicle: {
              select: {
                brand: true,
                vehicleType: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return plainToInstance(ResponseMyOrganizationDto, org, {
      excludeExtraneousValues: true,
      groups: ['detail'],
    });
  }

  async update(name: string, updateMyOrganizationDto: UpdateMyOrganizationDto) {
    const { subscription, ...rest } = updateMyOrganizationDto;

    await this.prismaService.organization.update({
      where: { name },
      data: {
        ...rest,
        accounts: {
          connect: updateMyOrganizationDto.accounts.map((user) => ({
            username: user.username,
          })),
        },
      },
    });
  }

  async switchOrganization(name: string, userInfo: TokenPayload, req: any) {
    const usercheckcompatibleWH_ORG =
      await this.prismaService.organization.findFirst({
        where: {
          name: name,
          OR: [
            {
              warehouses: {
                some: {
                  id: userInfo.homeWarehouseId,
                },
              },
            },
            {
              vendors: {
                some: {
                  name: userInfo.vendorName,
                },
              },
            },
          ],
        },
      });
    if (!usercheckcompatibleWH_ORG) {
      throw new ForbiddenException(
        'warehouse saat ini tidak terdaftar di organisasi target, coba ganti warehouse dahulu',
      );
    }

    const org = await this.prismaService.organization.findFirst({
      where: {
        name: name,
        accounts: {
          some: {
            username: userInfo.username,
          },
        },
      },
    });

    if (!org) {
      throw new ForbiddenException('Anda bukan anggota organisasi ini');
    }
    //edit user db
    const user = await this.prismaService.user.findUnique({
      where: {
        username: userInfo.username,
        organizations: {
          some: {
            name: userInfo.organizationName,
          },
        },
      },
      include: {
        homeWarehouse: true,
        organizations: { select: { name: true } },
        warehouseAccess: { select: { name: true } },
      },
    });

    const payload: TokenPayload = {
      username: user.username,
      role: user.role as ROLE,
      homeWarehouseId: user?.homeWarehouseId || null,
      vendorName: user?.vendorName || null,
      organizationName: org.name,
      jti: randomUUID(),
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
    return plainToInstance(
      LoginResponseDto,
      {
        access_token,
        refresh_token,
        ...payload,
        ...user,
      },
      {
        excludeExtraneousValues: true,
        groups: ['login'],
      },
    );
  }

  async remove(name: string, userInfo: TokenPayload) {
    //periksa apakah si penghapus adalah member org
    if (userInfo.role != 'ADMIN_ORGANIZATION') {
      return HttpStatus.FORBIDDEN;
    }

    const org = await this.prismaService.organization.findUnique({
      where: {
        name: name,
      },
    });
    if (!org) {
      return HttpStatus.FORBIDDEN;
    }
    await this.prismaService.organization.delete({
      where: {
        name: name,
      },
    });
    return HttpStatus.ACCEPTED;
  }

  async getLandingPage() {
    const response: GetLandingPageStats = {
      totalWarehouse: 0,
      activeSlot: 0,
      bookedToday: 0,
      succeedBooking: 0,
    };
    const now = new Date();
    const todayGte = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const todayLte = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    response.totalWarehouse = await this.prismaService.warehouse.count();
    response.activeSlot = await this.prismaService.warehouse.count({
      where: {
        isActive: true,
      },
    });

    response.activeSlot = await this.prismaService.dock.count({
      where: {
        isActive: true,
      },
    });

    response.bookedToday = await this.prismaService.booking.count({
      where: {
        status: BookingStatus.IN_PROGRESS,
        arrivalTime: {
          gte: todayGte,
          lte: todayLte,
        },
      },
    });
    response.succeedBooking = await this.prismaService.booking.count({
      where: { status: BookingStatus.FINISHED },
    });

    return response;
  }

  async getMyOrganizationSettings(userInfo: TokenPayload) {
    const org = await this.prismaService.organization.findFirst({
      where: {
        accounts: {
          some: {
            username: userInfo.username,
          },
        },
      },
    });
    return plainToInstance(ResponseMyOrganizationSettingsDto, org, {
      excludeExtraneousValues: true,
    });
  }

  async updateMyOrganizationSettings(
    userinfo: TokenPayload,
    body: UpdateMyOrganizationDto,
  ) {
    const { name, subscription, accounts,  ...rest } = body;


    await this.prismaService.organization.update({
      where: {
        accounts: {
          some: {
            username: userinfo.username,
          },
        },
        name,
      },
      data: {
        ...rest,
      },
    });

    return {
      message: 'Berhasil memperbarui setting organisasi',
    };
  }
}
