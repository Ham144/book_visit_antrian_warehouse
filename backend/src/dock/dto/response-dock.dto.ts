import { Days } from '@prisma/client';
import { Expose } from 'class-transformer';
import { responseWarehouseDto } from 'src/warehouse/dto/response-warehouse.dto';

export class Vacant {
  id?: String;
  availableFrom: string | null;
  availableUntil: string | null;
  day: Days | String; // ini single data bukan array
}

export class ResponseDockDto {
  @Expose()
  id: string;
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
  vacants?: Vacant[];
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
  searchKey?: string | null;
}
