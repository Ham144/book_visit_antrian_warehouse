import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @Type(() => Date)
  arrivalTime: Date;

  @IsNotEmpty()
  @Type(() => Date)
  estimatedFinishTime: Date;
}
