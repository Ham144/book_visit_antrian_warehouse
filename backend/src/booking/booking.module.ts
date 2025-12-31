import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingforVendorService } from './booking-vendor.service';
import { BookingWarehouseService } from './booking.service';

@Module({
  controllers: [BookingController],
  providers: [BookingWarehouseService, BookingforVendorService],
})
export class BookingModule {}
