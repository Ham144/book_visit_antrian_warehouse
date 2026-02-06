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
import { UpdateBookingDto } from './dto/update-booking.dto';
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { BookingGateway } from './booking.gateway';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingWarehouseService: BookingWarehouseService,
    private readonly bookingForVendorService: BookingforVendorService,
    private readonly gateway: BookingGateway,
  ) {}

  @Authorization('ADMIN_ORGANIZATION', 'ADMIN_VENDOR')
  @Post()
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Auth() userInfo: any,
  ) {
    const response = await this.bookingForVendorService.create(
      createBookingDto,
      userInfo,
    );
    if (response.success && response.warehouseId) {
      this.gateway.emitWarehouseUpdate(response.warehouseId);
    }
  }

  @Authorization()
  @Get('/list')
  async findAll(@Query() filter, @Auth() userInfo: any) {
    const response = await this.bookingWarehouseService.findAll(
      filter,
      userInfo,
    );
    return response;
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
  async justify(@Param('id') id: string, @Body() body) {
    const response = await this.bookingWarehouseService.justifyBooking(
      id,
      body,
    );
    if (response.warehouseId) {
      this.gateway.emitWarehouseUpdate(response.warehouseId);
    }
    return response;
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Put('/drag-and-drop/:id')
  async dragAndDrop(@Param('id') id: string, @Body() body) {
    const response = await this.bookingWarehouseService.dragAndDrop(id, body);
    if (response.warehouseId) {
      this.gateway.emitWarehouseUpdate(response.warehouseId);
    }
    return response;
  }

  @Authorization()
  @Patch('/updateStatus/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateBookingDto,
  ) {
    const response = await this.bookingWarehouseService.updateBookingStatus(
      id,
      payload,
    );
    if (response.warehouseId) {
      this.gateway.emitWarehouseUpdate(response.warehouseId);
    }
  }

  @Authorization('USER_ORGANIZATION', 'ADMIN_ORGANIZATION', 'ADMIN_VENDOR')
  @Delete('/cancel/:id')
  async cancelBook(@Param('id') id: string, @Auth() userInfo, @Body() body) {
    const response = await this.bookingForVendorService.cancelBook(
      id,
      userInfo,
      body,
    );
    if (response.success && response.warehouseId) {
      console.log('emit justify');
      this.gateway.emitWarehouseUpdate(response.warehouseId);
    }
    return response;
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

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Get('/admin-warehouse-reports')
  getStatsForVendor(
    @Query() filter: { startDate: string; endDate: string },
    @Auth() userinfo: TokenPayload,
  ) {
    return this.bookingWarehouseService.adminReports(
      userinfo,
      filter.startDate,
      filter.endDate,
    );
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Get('/admin-warehouse-dashboard')
  adminDashboard(@Auth() userinfo: TokenPayload) {
    return this.bookingWarehouseService.adminDashboard(userinfo);
  }
}
