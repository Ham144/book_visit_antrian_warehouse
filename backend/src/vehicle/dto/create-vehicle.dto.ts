import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  brand: string;
  @IsNotEmpty()
  @IsString()
  jenisKendaraan: string;

  @IsNotEmpty()
  @IsString()
  plateNumber: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productionYear?: number;

  @IsOptional()
  @IsString()
  maxCapacity?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  dimensionLength?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  dimensionWidth?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  dimensionHeight?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  durasiBongkar: number;
  @IsBoolean()
  @IsOptional()
  isReefer?: boolean;
  @IsString()
  @IsOptional()
  requiresDock?: string;

  @IsString()
  @IsOptional()
  driverName?: string;
  @IsString()
  @IsOptional()
  driverPhone?: string;
  @IsString()
  @IsOptional()
  driverLicense?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
