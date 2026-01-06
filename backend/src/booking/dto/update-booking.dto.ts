import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @Type(() => Date)
  actualArrivalTime: Date;

  @IsNotEmpty()
  @Type(() => Date)
  estimatedFinishTime: Date;

  @IsNotEmpty()
  @Type(() => Date)
  actualStartTime: Date;

  @IsNotEmpty()
  @Type(() => Date)
  actualFinishTime: Date;

  @IsOptional()
  @IsString()
  notes: string;
}
