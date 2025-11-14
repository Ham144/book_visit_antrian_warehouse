import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVehicleDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  jenisKendaraan?: string;

  @IsNotEmpty()
  @IsNumber()
  durasiBongkar: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  maxCapacity?: string;

  @IsOptional()
  @IsString()
  dimension?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
