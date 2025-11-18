import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsDate()
  arrivalTime: Date;
}
