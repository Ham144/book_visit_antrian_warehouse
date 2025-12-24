import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Auth } from 'src/common/auth.decorator';
import { Authorization } from 'src/common/authorization.decorator';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto, @Auth() userInfo: any) {
    return this.vehicleService.create(createVehicleDto, userInfo);
  }

  @Authorization('ADMIN_ORGANIZATION', 'ADMIN_VENDOR', 'USER_ORGANIZATION')
  @Get()
  findAll() {
    return this.vehicleService.findAll();
  }

  @Authorization('ADMIN_ORGANIZATION', 'ADMIN_VENDOR', 'USER_ORGANIZATION')
  @Get('/vendor-vehicles')
  getMyVehicle(@Auth() userInfo: any) {
    return this.vehicleService.getVendorVehicles(userInfo);
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION', 'ADMIN_VENDOR')
  @Get('/detail/:id')
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION', 'ADMIN_VENDOR')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Authorization('ADMIN_ORGANIZATION', 'USER_ORGANIZATION')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }
}
