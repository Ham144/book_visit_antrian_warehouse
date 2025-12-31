import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ROLE } from 'src/common/shared-enum';

export class CreateAppUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  password?: string;

  @IsString()
  @IsOptional()
  passwordHash?: string;

  @IsString()
  @IsOptional()
  mail?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  role: ROLE;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  displayName: string;

  @IsString()
  @IsOptional()
  driverPhone?: string;

  @IsString()
  @IsOptional()
  vendorName?: string;

  @IsOptional()
  @IsString()
  driverLicense?: string;
  @IsOptional()
  @IsString()
  homeWarehouseId: string;
}
