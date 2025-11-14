import { Injectable } from '@nestjs/common';
import { CreateMyOrganizationDto } from './dto/create-my-organization.dto';
import { UpdateMyOrganizationDto } from './dto/update-my-organization.dto';

@Injectable()
export class MyOrganizationService {
  create(createMyOrganizationDto: CreateMyOrganizationDto) {
    return 'This action adds a new myOrganization';
  }

  findAll() {
    return `This action returns all myOrganization`;
  }

  findOne(id: number) {
    return `This action returns a #${id} myOrganization`;
  }

  update(id: number, updateMyOrganizationDto: UpdateMyOrganizationDto) {
    return `This action updates a #${id} myOrganization`;
  }

  remove(id: number) {
    return `This action removes a #${id} myOrganization`;
  }
}
