import { Module } from '@nestjs/common';
import { DockService } from './dock.service';
import { DockController } from './dock.controller';

@Module({
  controllers: [DockController],
  providers: [DockService],
})
export class DockModule {}
