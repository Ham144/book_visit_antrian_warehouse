import { Module } from '@nestjs/common';
import { DockBusyTimeService } from './dock-busy-time.service';
import { DockBusyTimeController } from './dock-busy-time.controller';

@Module({
  controllers: [DockBusyTimeController],
  providers: [DockBusyTimeService],
})
export class DockBusyTimeModule {}
