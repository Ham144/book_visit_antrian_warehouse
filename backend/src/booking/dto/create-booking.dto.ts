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
  //visit times
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  arrivalTime: Date;
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  actualArrivalTime?: Date;
  //unloading times
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  actualStartTime?: Date;
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  actualFinishTime?: Date;
  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsString()
  driverUsername: string;
}
