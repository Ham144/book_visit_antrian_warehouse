import { PartialType } from '@nestjs/mapped-types';
import { CreateMyOrganizationDto } from './create-my-organization.dto';
import { IsArray, IsString } from 'class-validator';

export class UpdateMyOrganizationDto extends PartialType(
  CreateMyOrganizationDto,
) {
  @IsString({each: true})
  @IsArray()
  disabledFeatures?: string[];
}
