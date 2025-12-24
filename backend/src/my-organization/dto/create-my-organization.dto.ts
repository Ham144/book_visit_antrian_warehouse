import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { SubscriptionPlan } from 'src/common/shared-enum';
import { LoginResponseDto } from 'src/user/dto/login.dto';

export class CreateMyOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsString()
  subscription: SubscriptionPlan;
  @IsNotEmpty()
  @IsString()
  AD_HOST?: string;
  @IsNotEmpty()
  @IsString()
  AD_PORT?: string;
  @IsNotEmpty()
  @IsString()
  AD_DOMAIN?: string;
  @IsNotEmpty()
  @IsString()
  AD_BASE_DN?: string;
  @IsNotEmpty()
  @IsArray()
  @IsObject({ each: true })
  accounts: LoginResponseDto[];
}
