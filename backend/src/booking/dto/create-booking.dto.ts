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
  @IsNotEmpty()
  arrivalTime: Date;
  @IsDate()
  @IsNotEmpty()
  estimatedFinishTime: Date;
  @IsOptional()
  @IsString()
  notes?: string;
}
