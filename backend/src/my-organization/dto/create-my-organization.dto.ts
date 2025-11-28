import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
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

export enum SubscriptionPlan {
  TRIAL = 'TRIAL',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}
