import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DockRequirement, VehicleType } from '@prisma/client';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  brand: string;
  @IsNotEmpty()
  @IsString()
  vehicleType: VehicleType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productionYear?: number;

  @IsOptional()
  @IsString()
  requiresDock?: DockRequirement;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCapacity?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  durasiBongkar: number;

  @IsBoolean()
  @IsOptional()
  isReefer?: boolean;

  @IsString()
  @IsOptional()
  driverNames?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
