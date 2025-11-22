import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAppUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  @MinLength(5)
  password?: string;
  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  driverPhone?: string;

  @IsOptional()
  @IsString()
  driverLicense?: string;
  @IsNotEmpty()
  @IsString()
  homeWarehouseId: string;
}
