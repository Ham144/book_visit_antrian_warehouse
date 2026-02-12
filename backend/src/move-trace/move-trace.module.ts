import { Module } from '@nestjs/common';
import { MoveTraceService } from './move-trace.service';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [ChatModule],
  providers: [MoveTraceService],
  exports: [MoveTraceService],
})
export class MoveTraceModule {}
