import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MyOrganizationService } from './my-organization.service';
import { CreateMyOrganizationDto } from './dto/create-my-organization.dto';
import { UpdateMyOrganizationDto } from './dto/update-my-organization.dto';

@Controller('my-organization')
export class MyOrganizationController {
  constructor(private readonly myOrganizationService: MyOrganizationService) {}

  @Post()
  create(@Body() createMyOrganizationDto: CreateMyOrganizationDto) {
    return this.myOrganizationService.create(createMyOrganizationDto);
  }

  @Get()
  findAll() {
    return this.myOrganizationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.myOrganizationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMyOrganizationDto: UpdateMyOrganizationDto) {
    return this.myOrganizationService.update(+id, updateMyOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.myOrganizationService.remove(+id);
  }
}
