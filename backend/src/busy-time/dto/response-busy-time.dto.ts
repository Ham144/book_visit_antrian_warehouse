import { Expose } from 'class-transformer';
import { Recurring } from 'src/common/shared-enum';
import { ResponseDockDto } from 'src/dock/dto/response-dock.dto';

export class ResponseBusyTimeDockDto {
  @Expose()
  id: string;
  @Expose()
  from: Date;
  @Expose()
  to: Date;
  @Expose()
  reason: string;
  @Expose()
  dock?: ResponseDockDto;
  @Expose()
  dockId?: string;
  @Expose()
  recurring: Recurring;
  @Expose()
  recurringStep?: number; //daily weekly monthly
  @Expose()
  recurringCustom?: String[];
}
