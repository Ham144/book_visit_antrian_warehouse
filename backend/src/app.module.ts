import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { RedisModule } from './redis/redis.module';
import { HttpExceptionFilter } from './common/http-exception-filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    WarehouseModule,
    RedisModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'), // Konsisten menggunakan process.cwd()
      serveRoot: '/uploads', // prefix URL
      serveStaticOptions: {
        index: false,
      },
    }),
    VehicleModule,
  ],
  controllers: [],
  providers: [HttpExceptionFilter],
})
export class AppModule {}
