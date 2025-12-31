import { Expose, Type } from 'class-transformer';
import { Days } from 'src/common/shared-enum';
import { responseWarehouseDto } from 'src/warehouse/dto/response-warehouse.dto';

export class Vacant {
  @Expose()
  id?: String;
  @Expose()
  availableFrom: string | null;
  @Expose()
  availableUntil: string | null;
  @Expose()
  day: Days | String; // ini single data bukan array
}

export class ResponseDockDto {
  @Expose()
  id: string;
  @Expose()
  warehouseId?: string;
  @Expose()
  name: string;
  @Expose()
  allowedTypes?: string[];

  @Expose()
  isActive?: boolean;
  @Expose()
  priority?: number;
  @Expose()
  busyTimes?: object[];

  @Expose({ groups: ['detail'] })
  @Type(() => Vacant)
  vacants?: Vacant[];
  @Expose({ groups: ['detail'] })
  @Type(() => responseWarehouseDto)
  warehouse?: responseWarehouseDto;
  @Expose({ groups: ['detail'] })
  bookings?: object[];
  @Expose({ groups: ['detail'] })
  photos?: string[];
  @Expose({ groups: ['detail'] })
  organizationName?: string;
}

export class DockFilter {
  page: number;
  searchKey?: string | null;
}
