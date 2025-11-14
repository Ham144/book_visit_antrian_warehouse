import { Module } from '@nestjs/common';
import { MyOrganizationService } from './my-organization.service';
import { MyOrganizationController } from './my-organization.controller';

@Module({
  controllers: [MyOrganizationController],
  providers: [MyOrganizationService],
})
export class MyOrganizationModule {}
