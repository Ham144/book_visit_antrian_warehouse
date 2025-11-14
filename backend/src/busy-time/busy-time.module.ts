import { Module } from '@nestjs/common';
import { BusyTimeService } from './busy-time.service';
import { BusyTimeController } from './busy-time.controller';

@Module({
  controllers: [BusyTimeController],
  providers: [BusyTimeService],
})
export class BusyTimeModule {}
