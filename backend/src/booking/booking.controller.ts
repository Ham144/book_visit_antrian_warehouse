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
import { TokenPayload } from 'src/user/dto/token-payload.dto';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingForVendorService: BookingforVendorService,
  ) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Auth() userInfo: any) {
    return this.bookingForVendorService.create(createBookingDto, userInfo);
  }

  @Get('/all')
  findAll(@Query() filter, @Auth() userInfo: any) {
    return this.bookingService.findAll(filter, userInfo);
  }

  @Get()
  findAllForVendor(@Auth() userInfo: any) {
    return this.bookingForVendorService.findAllForVendor(userInfo);
  }

  @Get('/detail/:id')
  findOne(@Param('id') id: string) {
    return this.bookingForVendorService.findOne(id);
  }

  @Patch('/updateStatus/:id')
  finish(
    @Param('id') id: string,
    @Body() body,
    @Auth() userInfo: TokenPayload,
  ) {
    return this.bookingForVendorService.finish(id, body);
  }

  @Delete('/cancel/:id')
  cancelBook(@Param('id') id: string, @Body() body, @Auth() userInfo) {
    return this.bookingForVendorService.cancelBook(id, body, userInfo);
  }
}
