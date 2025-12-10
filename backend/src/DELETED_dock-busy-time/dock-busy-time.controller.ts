import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DockBusyTimeService } from './dock-busy-time.service';
import { CreateDockBusyTimeDto } from './dto/create-dock-busy-time.dto';
import { UpdateDockBusyTimeDto } from './dto/update-dock-busy-time.dto';

@Controller('dock-busy-time')
export class DockBusyTimeController {
  constructor(private readonly dockBusyTimeService: DockBusyTimeService) {}

  @Post()
  create(@Body() createDockBusyTimeDto: CreateDockBusyTimeDto) {
    return this.dockBusyTimeService.create(createDockBusyTimeDto);
  }

  @Get()
  findAll() {
    return this.dockBusyTimeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dockBusyTimeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDockBusyTimeDto: UpdateDockBusyTimeDto) {
    return this.dockBusyTimeService.update(+id, updateDockBusyTimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dockBusyTimeService.remove(+id);
  }
}
