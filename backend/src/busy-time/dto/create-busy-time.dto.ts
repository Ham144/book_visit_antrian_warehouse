import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Recurring } from 'src/common/shared-enum';

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
