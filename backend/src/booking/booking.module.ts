import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingforVendorService } from './booking-vendor.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, BookingforVendorService],
})
export class BookingModule {}
