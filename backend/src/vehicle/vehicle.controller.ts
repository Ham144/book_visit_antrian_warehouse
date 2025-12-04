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

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto, @Auth() userInfo: any) {
    return this.vehicleService.create(createVehicleDto, userInfo);
  }

  @Get()
  findAll() {
    return this.vehicleService.findAll();
  }

  @Get('/my-vehicles')
  getMyVehicle(@Auth() userInfo: any) {
    return this.vehicleService.getMyVehicles(userInfo);
  }

  @Get('/detail/:id')
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }
}
