import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Auth } from 'src/common/auth.decorator';
import { BookingforVendorService } from './booking-vendor.service';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingForVendorService: BookingforVendorService,
  ) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Auth() userInfo: any) {
    return this.bookingService.create(createBookingDto, userInfo);
  }

  @Get()
  findAll(@Query() filter, @Auth() userInfo: any) {
    return this.bookingService.findAll(filter, userInfo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingForVendorService.findOne(id);
  }

  @Patch('/unload/:id')
  unLoad(@Param('id') id: string) {
    return this.bookingForVendorService.unLoad(id, new Date());
  }

  @Patch('/finish/:id')
  finish(@Param('id') id: string) {
    return this.bookingForVendorService.finish(id, new Date());
  }

  @Delete(':id')
  cancelBook(@Param('id') id: string, @Body() body, @Auth() userInfo) {
    return this.bookingForVendorService.cancelBook(id, body, userInfo);
  }
}
