import { Type } from 'class-transformer';
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
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  arrivalTime: Date;
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  estimatedFinishTime: Date;
  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsString()
  driverUsername: string;
}
