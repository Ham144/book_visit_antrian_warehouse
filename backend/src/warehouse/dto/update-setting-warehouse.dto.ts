import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateSettingWarehouseDto {
  @IsNumber()
  intervalMinimalQueueu?: number;
  @IsNumber()
  delayTolerance?: number;
  @IsBoolean()
  isAutoEfficientActive?: boolean;
  @IsNumber()
  maximumWeekSelection?: number;
}
