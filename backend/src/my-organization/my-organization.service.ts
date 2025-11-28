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

@Injectable()
export class MyOrganizationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly redis: RedisService,
  ) {}

  async create(createMyOrganizationDto: CreateMyOrganizationDto) {
    const subscription = await this.prismaService.subscription.create({
      data: {
        start: new Date(),
        plan: 'TRIAL',
        ...createMyOrganizationDto,
      },
    });

    await this.prismaService.organization.create({
      data: {
        name: createMyOrganizationDto.name,
        subscriptionId: createMyOrganizationDto.subscriptionId,
        subscription: {
          connect: {
            id: subscription.id,
          },
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
      plainToInstance(ResponseMyOrganizationDto, org),
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
                plateNumber: true,
                brand: true,
                jenisKendaraan: true,
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

  async switchOrganization(id: string, userInfo: TokenPayload, req: any) {
    const isMember = await this.prismaService.organization.findFirst({
      where: {
        accounts: {
          some: {
            username: userInfo.username,
          },
        },
      },
    });

    if (!isMember) {
      throw new ForbiddenException('Anda bukan anggota warehouse ini');
    }

    //edit user db
    const user = await this.prismaService.user.findUnique({
      where: {
        username: userInfo.username,
      },
    });
    const payload: TokenPayload = {
      username: user.username,
      description: user.description,
      homeWarehouseId: user.homeWarehouseId,
      organizationName: isMember.name,
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
    return HttpStatus.ACCEPTED;
  }

  async remove(name: string, userInfo: TokenPayload) {
    //periksa apakah si penghapus adalah member org
    const org = await this.prismaService.organization.findUnique({
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
      return HttpStatus.FORBIDDEN;
    }
    await this.prismaService.organization.delete({
      where: {
        name: name,
      },
    });
    return HttpStatus.ACCEPTED;
  }
}
