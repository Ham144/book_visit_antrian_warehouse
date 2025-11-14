import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DockService } from './dock.service';
import { CreateDockDto } from './dto/create-dock.dto';
import { UpdateDockDto } from './dto/update-dock.dto';

@Controller('dock')
export class DockController {
  constructor(private readonly dockService: DockService) {}

  @Post()
  create(@Body() createDockDto: CreateDockDto) {
    return this.dockService.create(createDockDto);
  }

  @Get()
  findAll() {
    return this.dockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dockService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDockDto: UpdateDockDto) {
    return this.dockService.update(+id, updateDockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dockService.remove(+id);
  }
}
