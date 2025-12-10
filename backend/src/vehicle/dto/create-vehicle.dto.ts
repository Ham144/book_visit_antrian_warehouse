import {
  IsArray,
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
  @IsNumber()
  productionYear?: number;

  @IsOptional()
  @IsString()
  requiresDock?: DockRequirement;

  @IsOptional()
  @IsNumber()
  maxCapacity?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  durasiBongkar: number;

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  driverNames?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
