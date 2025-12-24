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
import { Authorization } from 'src/common/authorization.decorator';
import { ROLE } from 'src/common/shared-enum';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingForVendorService: BookingforVendorService,
  ) {}

  @Authorization('ADMIN_ORGANIZATION', 'ADMIN_VENDOR')
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Auth() userInfo: any) {
    return this.bookingForVendorService.create(createBookingDto, userInfo);
  }

  @Authorization('ADMIN_ORGANIZATION', 'ADMIN_VENDOR')
  @Get('/all')
  findAll(@Query() filter, @Auth() userInfo: any) {
    return this.bookingService.findAll(filter, userInfo);
  }

  @Authorization(ROLE.ADMIN_VENDOR, ROLE.ADMIN_ORGANIZATION)
  @Get()
  findAllForVendor(@Auth() userInfo: any) {
    return this.bookingForVendorService.findAllForVendor(userInfo);
  }

  @Authorization()
  @Get('/detail/:id')
  findOne(@Param('id') id: string) {
    return this.bookingForVendorService.findOne(id);
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Patch('/updateStatus/:id')
  finish(@Param('id') id: string, @Body() body) {
    return this.bookingForVendorService.finish(id, body);
  }

  @Authorization('USER_ORGANIZATION', 'ADMIN_ORGANIZATION', 'ADMIN_VENDOR')
  @Delete('/cancel/:id')
  cancelBook(@Param('id') id: string, @Body() body) {
    return this.bookingForVendorService.cancelBook(id, body);
  }
}
