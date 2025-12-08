import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Vacant } from './response-dock.dto';
import { DockType } from '@prisma/client';

export class CreateDockDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  dockType?: DockType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedVehicleTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  vacants?: Vacant[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;
}
