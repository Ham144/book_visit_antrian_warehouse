import { responseWarehouseDto } from 'src/warehouse/dto/response-warehouse.dto';

export class ResponseDockDto {
  id?: string;
  name: string;
  warehouseId?: string;
  warehouse?: responseWarehouseDto;
  photos?: string[];
  dockType?: string;
  supportedVehicleTypes?: string[];
  maxLength?: number;
  maxWidth?: number;
  maxHeight?: number;
  availableFrom?: Date;
  availableUntil?: Date;
  isActive?: boolean;
  priority?: number;
  bookings?: object[];
  busyTimes?: object[];
}

export class DockFilter {
  page: number;
  warehouseId?: string | null;
  organizationName: string;
}
