import { Expose } from 'class-transformer';
import { responseWarehouseDto } from 'src/warehouse/dto/response-warehouse.dto';

export class ResponseDockDto {
  @Expose()
  dockType?: string;
  @Expose()
  warehouseId?: string;
  @Expose()
  name: string;
  @Expose()
  supportedVehicleTypes?: string[];
  @Expose()
  maxLength?: number;
  @Expose()
  maxWidth?: number;
  @Expose()
  maxHeight?: number;
  @Expose()
  availableFrom?: Date;
  @Expose()
  availableUntil?: Date;
  @Expose()
  isActive?: boolean;
  @Expose()
  priority?: number;
  @Expose({ groups: ['detail'] })
  bookings?: object[];
  @Expose()
  busyTimes?: object[];
  @Expose({ groups: ['detail'] })
  warehouse?: responseWarehouseDto;
  @Expose({ groups: ['detail'] })
  photos?: string[];
}

export class DockFilter {
  page: number;
  warehouseId?: string | null;
  organizationName: string;
}
