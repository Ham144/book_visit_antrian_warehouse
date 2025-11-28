import { PartialType } from '@nestjs/mapped-types';
import {
  CreateMyOrganizationDto,
  SubscriptionPlan,
} from './create-my-organization.dto';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateMyOrganizationDto extends PartialType(
  CreateMyOrganizationDto,
) {
  @IsOptional()
  @IsObject()
  subscription?: SubscriptionPlan;
  @IsOptional()
  AD_BASE_DN?: string;
  @IsOptional()
  AD_PORT?: string;
  @IsOptional()
  AD_DOMAIN?: string;
  @IsOptional()
  AD_HOST?: string;
}
