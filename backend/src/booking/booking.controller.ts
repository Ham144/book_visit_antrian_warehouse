import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Auth } from 'src/common/auth.decorator';
import { BookingforVendorService } from './booking-vendor.service';
import { Authorization } from 'src/common/authorization.decorator';
import { BookingWarehouseService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingWarehouseService: BookingWarehouseService,
    private readonly bookingForVendorService: BookingforVendorService,
  ) {}

  @Authorization('ADMIN_ORGANIZATION', 'ADMIN_VENDOR')
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Auth() userInfo: any) {
    return this.bookingForVendorService.create(createBookingDto, userInfo);
  }

  @Authorization()
  @Get('/list')
  findAll(@Query() filter, @Auth() userInfo: any) {
    return this.bookingWarehouseService.findAll(filter, userInfo);
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION', 'ADMIN_VENDOR')
  @Get('/semi-detail-list')
  semiDetailList(@Query() filter, @Auth() userInfo: any) {
    return this.bookingWarehouseService.semiDetailList(filter, userInfo);
  }

  @Authorization()
  @Get('/detail/:id')
  findOne(@Param('id') id: string) {
    return this.bookingForVendorService.findOne(id);
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Put('/justify/:id')
  justify(@Param('id') id: string, @Body() body) {
    return this.bookingWarehouseService.justifyBooking(id, body);
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Put('/drag-and-drop/:id')
  dragAndDrop(@Param('id') id: string, @Body() body) {
    return this.bookingWarehouseService.dragAndDrop(id, body);
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Patch('/updateStatus/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; actualFinishTime?: Date },
  ) {
    return this.bookingWarehouseService.updateBookingStatus(
      id,
      body.status,
      body.actualFinishTime,
    );
  }

  @Authorization('USER_ORGANIZATION', 'ADMIN_ORGANIZATION', 'ADMIN_VENDOR')
  @Delete('/cancel/:id')
  cancelBook(@Param('id') id: string, @Body() body) {
    return this.bookingForVendorService.cancelBook(id, body);
  }

  @Authorization('DRIVER_VENDOR', 'ADMIN_ORGANIZATION')
  @Get('/stats/stats-for-driver')
  getStatsForDriver() {
    return this.bookingForVendorService.getStatsForDriver();
  }

  @Authorization('ADMIN_VENDOR', 'ADMIN_ORGANIZATION')
  @Get('/stats/stats-for-admin-vendor')
  getStatsForAdminVendor() {
    return this.bookingForVendorService.getStatsForAdminVendor();
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Get('/stats/stats-for-organization')
  getStatsForUserOrganizations() {
    return this.bookingWarehouseService.getStatsForUserOrganizations();
  }
}
