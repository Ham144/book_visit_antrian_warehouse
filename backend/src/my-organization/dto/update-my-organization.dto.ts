import { PartialType } from '@nestjs/mapped-types';
import { CreateMyOrganizationDto } from './create-my-organization.dto';
import { IsObject, IsOptional } from 'class-validator';
import { SubscriptionPlan } from 'src/common/shared-enum';

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
