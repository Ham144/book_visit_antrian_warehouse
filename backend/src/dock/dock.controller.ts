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
import { DockService } from './dock.service';
import { CreateDockDto } from './dto/create-dock.dto';
import { UpdateDockDto } from './dto/update-dock.dto';
import { DockFilter } from './dto/response-dock.dto';
import { Auth } from 'src/common/auth.decorator';

@Controller('dock')
export class DockController {
  constructor(private readonly dockService: DockService) {}

  @Post()
  create(@Body() createDockDto: CreateDockDto, @Auth() userInfo) {
    return this.dockService.create(createDockDto, userInfo);
  }

  @Get()
  findAll(@Query() filter: any, @Auth() userInfo) {
    return this.dockService.findAll(filter, userInfo);
  }

  @Get('/warehouse/:id')
  getDocksByWarehouseId(@Param('id') id: string) {
    return this.dockService.getDocksByWarehouseId(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dockService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDockDto: UpdateDockDto) {
    return this.dockService.update(id, updateDockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dockService.remove(id);
  }
}
