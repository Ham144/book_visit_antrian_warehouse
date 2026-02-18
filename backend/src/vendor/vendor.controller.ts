import { Controller, Get, Param } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { Authorization } from 'src/common/authorization.decorator';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Authorization(
    'ADMIN_GUDANG',
    'USER_ORGANIZATION',
    'ADMIN_ORGANIZATION',
    'ADMIN_VENDOR',
  )
  @Get('/list')
  findAll() {
    return this.vendorService.findAll();
  }

  @Authorization('ADMIN_GUDANG', 'USER_ORGANIZATION', 'ADMIN_ORGANIZATION')
  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.vendorService.findOne(name);
  }
}
