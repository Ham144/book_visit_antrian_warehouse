import { PartialType } from '@nestjs/mapped-types';
import { CreateMyOrganizationDto } from './create-my-organization.dto';

export class UpdateMyOrganizationDto extends PartialType(CreateMyOrganizationDto) {}
