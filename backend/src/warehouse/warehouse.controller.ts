import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { Auth } from 'src/common/auth.decorator';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';

@Controller('/api/warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  createWarehouse(@Body() body: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(body);
  }

  @Post('/create')
  createWarehouseLegacy(@Body() body: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(body);
  }

  @Get()
  list(@Query('searchKey') searchKey?: string, @Auth() userInfo?: any) {
    return this.warehouseService.getWarehouses(searchKey, userInfo);
  }

  @Patch(':id')
  updateWarehouse(@Param('id') id: string, @Body() body: CreateWarehouseDto) {
    return this.warehouseService.updateWarehouse(id, body);
  }

  @Delete(':id')
  deleteWarehouse(@Param('id') id: string) {
    return this.warehouseService.deleteWarehouse(id);
  }
}
