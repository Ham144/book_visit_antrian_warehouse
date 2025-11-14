import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BusyTimeService } from './busy-time.service';
import { CreateBusyTimeDto } from './dto/create-busy-time.dto';
import { UpdateBusyTimeDto } from './dto/update-busy-time.dto';

@Controller('busy-time')
export class BusyTimeController {
  constructor(private readonly busyTimeService: BusyTimeService) {}

  @Post()
  create(@Body() createBusyTimeDto: CreateBusyTimeDto) {
    return this.busyTimeService.create(createBusyTimeDto);
  }

  @Get()
  findAll() {
    return this.busyTimeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.busyTimeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBusyTimeDto: UpdateBusyTimeDto) {
    return this.busyTimeService.update(+id, updateBusyTimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.busyTimeService.remove(+id);
  }
}
