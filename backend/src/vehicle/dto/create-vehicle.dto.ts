import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleType } from 'src/common/shared-enum';

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
  @IsNumber()
  maxCapacity?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  durasiBongkar: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
