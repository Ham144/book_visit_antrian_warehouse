import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateAppUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserAppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async createAppUser(body: CreateAppUserDto) {
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
      },
    });
    return HttpStatus.CREATED;
  }
}
