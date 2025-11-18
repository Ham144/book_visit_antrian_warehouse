export class CreateDockDto {
  id?: string;
  name: string;
  warehouseId: string;
  warehouse?: Object;
  photos?: string[];
  dockType?: string;
  supportedVehicleTypes?: string[];
  maxLength?: number;
  maxWidth?: number;
  maxHeight?: number;
  availableFrom?: Date;
  availableUntil?: Date;
  isActive?: boolean;
  status?: string;
  priority?: number;
  busyTimes?: Date[];
  createdAt?: Date;
  updatedAt?: Date;
}
