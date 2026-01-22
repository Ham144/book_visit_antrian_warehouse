import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateAppUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from './dto/login.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateAppUserDto } from './dto/update-user.dto';
import { TokenPayload } from './dto/token-payload.dto';
import { Prisma } from '@prisma/client';
import { ROLE } from 'src/common/shared-enum';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAppUser(body: CreateAppUserDto, userInfo: TokenPayload) {
    const { password, homeWarehouseId, vendorName, ...rest } = body;

    if (!homeWarehouseId && !vendorName) {
      throw new BadRequestException(
        'homeWarehouseId atau vendorName salah satu diperlukan',
      );
    } else if (homeWarehouseId && vendorName) {
      throw new BadRequestException(
        'homeWarehouseId atau vendorName tidak boleh digunakan bersamaan',
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let homeWarehouse;
    if (rest.role.includes('ORGANIZATION')) {
      homeWarehouse = await this.prismaService.warehouse.findUnique({
        where: {
          id: body.homeWarehouseId,
        },
      });
    }

    await this.prismaService.user.create({
      data: {
        ...rest,
        passwordHash: passwordHash,
        accountType: 'APP',
        vendorName: vendorName || null,
        homeWarehouseId: homeWarehouse?.id || null,
        organizations: {
          connect: {
            name: userInfo.organizationName,
          },
        },
      },
    });
    return HttpStatus.CREATED;
  }

  //get myDriver
  async getMyDrivers(page: number, searchKey: string, userInfo: TokenPayload) {
    const where: Prisma.UserWhereInput = {
      vendorName: userInfo.vendorName,
      role: ROLE.DRIVER_VENDOR,
      isActive: true,
    };

    if (searchKey) {
      where.username = {
        contains: searchKey,
        mode: 'insensitive',
      };
    }

    const drivers = await this.prismaService.user.findMany({
      where,
      take: 10,
      skip: (page - 1) * 10,
      orderBy: {
        createdAt: 'desc', // optional tapi recommended
      },
    });

    return plainToInstance(LoginResponseDto, drivers, {
      excludeExtraneousValues: true,
    });
  }

  //untuk admin_organization
  async getAllAccountForMemberManagement(
    page: number,
    searchKey: string,
    userInfo: TokenPayload,
  ) {
    const where: Prisma.UserWhereInput = {
      organizations: {
        some: {
          name: userInfo.organizationName,
        },
      },
    };

    if (searchKey) {
      where.username = {
        contains: searchKey,
        mode: 'insensitive',
      };
    }

    const accounts = await this.prismaService.user.findMany({
      where,
      include: {
        homeWarehouse: true,
        warehouseAccess: {
          select: { name: true },
        },
        organizations: {
          select: { name: true },
        },
      },
      skip: (page - 1) * 10,
      take: 10,
    });

    return accounts.map((account) =>
      plainToInstance(LoginResponseDto, account, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async getVendorMemberOnly(
    page: number,
    searchKey: string,
    userInfo: TokenPayload,
  ) {
    const where: Prisma.UserWhereInput = searchKey
      ? {
          username: {
            contains: searchKey,
          },
        }
      : {};

    if (userInfo?.vendorName) {
      where.vendorName = userInfo.vendorName;
    } else {
      return new BadRequestException('Anda bukan vendor');
    }

    const accounts = await this.prismaService.user.findMany({
      where,
      include: {
        organizations: {
          select: { name: true },
        },
      },
      skip: (page - 1) * 10,
      take: 10,
    });

    return accounts.map((account) =>
      plainToInstance(LoginResponseDto, account, {
        excludeExtraneousValues: true,
        groups: ['detail'],
      }),
    );
  }

  async updateAccount(body: UpdateAppUserDto) {
    const { username, password, ...rest } = body;

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      rest.passwordHash = passwordHash;
    }

    const updated = await this.prismaService.user.update({
      where: {
        username: username,
      },
      data: rest,
    });

    return plainToInstance(LoginResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }
  
  async deleteAppUser(username: string) {
    await this.prismaService.user.delete({
      where: {
        username: username,
      },
    });
  }
}
