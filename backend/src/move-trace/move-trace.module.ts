import { Module } from '@nestjs/common';
import { MoveTraceService } from './move-trace.service';

@Module({
  providers: [MoveTraceService],
  exports: [MoveTraceService],
})
export class MoveTraceModule {}
