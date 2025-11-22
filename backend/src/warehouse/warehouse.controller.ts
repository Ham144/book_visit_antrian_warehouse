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
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Controller('/warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  createWarehouse(@Body() body: CreateWarehouseDto, @Auth() userInfo: any) {
    return this.warehouseService.createWarehouse(body, userInfo);
  }

  @Get()
  list(@Query() filter: any, @Auth() userInfo: any) {
    return this.warehouseService.getWarehouses(
      userInfo,
      filter.searchKey,
      filter.page,
    );
  }

  @Patch(':id')
  updateWarehouse(@Param('id') id: string, @Body() body: UpdateWarehouseDto) {
    return this.warehouseService.updateWarehouse(id, body);
  }

  @Delete(':id')
  deleteWarehouse(@Param('id') id: string) {
    return this.warehouseService.deleteWarehouse(id);
  }
}
