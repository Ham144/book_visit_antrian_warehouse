import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { AuthService } from 'src/user/auth.service';
import { PrismaService } from 'src/common/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService, AuthService, PrismaService, RedisService],
})
export class WarehouseModule {}
