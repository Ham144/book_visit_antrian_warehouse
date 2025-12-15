import { Controller, Get, Param } from '@nestjs/common';
import { VendorService } from './vendor.service';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get('/list')
  findAll() {
    return this.vendorService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.vendorService.findOne(name);
  }
}
