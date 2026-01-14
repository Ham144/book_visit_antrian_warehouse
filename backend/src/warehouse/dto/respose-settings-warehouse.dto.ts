import { Expose } from 'class-transformer';

export class responseSettingWarehouseDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  intervalMinimalQueueu: number;
  @Expose()
  delayTolerance: number;
  @Expose()
  isAutoEfficientActive: boolean;
  @Expose()
  maximumWeekSelection: number;
}
