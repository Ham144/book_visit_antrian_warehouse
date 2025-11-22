import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RedisService } from 'src/redis/redis.service';
import { UserAppService } from './userApp.service';

@Module({
  controllers: [UserController],
  providers: [UserService, RedisService, UserAppService],
})
export class UserModule {}
