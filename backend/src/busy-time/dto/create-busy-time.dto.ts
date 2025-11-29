import { Recurring } from '@prisma/client';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBusyTimeDto {
  @IsString()
  @IsNotEmpty()
  from: string;
  @IsNotEmpty()
  @IsString()
  to: string;
  @IsString()
  @IsNotEmpty()
  reason: string;
  @IsString()
  @IsNotEmpty()
  dockId: string;
  @IsString()
  @IsNotEmpty()
  recurring: Recurring;
  @IsOptional()
  @IsNumber()
  recurringStep: number;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recurringCustom: string[];
}
