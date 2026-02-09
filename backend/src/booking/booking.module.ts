import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingforVendorService } from './booking-vendor.service';
import { BookingWarehouseService } from './booking.service';
import { BookingGateway } from './booking.gateway';
import { MoveTraceModule } from '../move-trace/move-trace.module';

@Module({
  imports: [MoveTraceModule],
  controllers: [BookingController],
  providers: [BookingWarehouseService, BookingforVendorService, BookingGateway],
})
export class BookingModule {}
