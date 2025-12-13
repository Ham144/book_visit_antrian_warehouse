import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateAppUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from './dto/login.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateAppUserDto } from './dto/update-user.dto';
import { TokenPayload } from './dto/token-payload.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAppUser(body: CreateAppUserDto, userInfo: TokenPayload) {
    const passwordHash = await bcrypt.hash(body.password, 10);

    const homeWarehouse = await this.prismaService.warehouse.findUnique({
      where: {
        id: body.homeWarehouseId,
      },
    });

    await this.prismaService.user.create({
      data: {
        displayName: body.displayName,
        username: body.username,
        passwordHash: passwordHash,
        description: body.description,
        isActive: body.isActive,
        driverPhone: body.driverPhone,
        driverLicense: body.driverLicense,
        homeWarehouseId: homeWarehouse.id,
        accountType: 'APP',
        warehouseAccess: {
          connect: {
            id: homeWarehouse.id,
          },
        },
        mail: body.mail,
        organizations: {
          connect: {
            name: userInfo.organizationName,
          },
        },
      },
    });
    return HttpStatus.CREATED;
  }

  async getAllAccount(page: number, searchKey: string) {
    const where = searchKey
      ? {
          username: {
            contains: searchKey,
          },
        }
      : {};

    const accounts = await this.prismaService.user.findMany({
      where,
      include: {
        homeWarehouse: true,
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

  async getAllAccountForMemberManagement(page: number, searchKey: string) {
    const where = searchKey
      ? {
          username: {
            contains: searchKey,
          },
        }
      : {};

    const accounts = await this.prismaService.user.findMany({
      where,
      include: {
        homeWarehouse: true,
        warehouseAccess: {
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
}
