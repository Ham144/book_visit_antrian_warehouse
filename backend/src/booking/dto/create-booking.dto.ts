import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;
  @IsString()
  @IsNotEmpty()
  warehouseId: string;
  @IsString()
  @IsNotEmpty()
  dockId?: string;

  @IsDate()
  estimatedFinishTime: Date;

  @IsDate()
  @IsNotEmpty()
  finishTime: Date;
  @IsOptional()
  status: BookingStatus;
  notes?: string;
}

enum BookingStatus {
  waiting = 'waiting',
  in_progress = 'in_progress',
  finished = 'finished',
  canceled = 'canceled',
}
