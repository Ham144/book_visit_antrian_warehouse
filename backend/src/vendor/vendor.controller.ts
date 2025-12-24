import { Controller, Get, Param } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { Authorization } from 'src/common/authorization.decorator';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Authorization('USER_ORGANIZATION', 'ADMIN_ORGANIZATION')
  @Get('/list')
  findAll() {
    return this.vendorService.findAll();
  }

  @Authorization('USER_ORGANIZATION', 'ADMIN_ORGANIZATION')
  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.vendorService.findOne(name);
  }
}
