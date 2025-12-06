import { Booking } from "./booking.type";
import { Vacant } from "./vacant.type";
import { Warehouse } from "./warehouse";

export interface IDock {
  id?: string;
  name: string;
  warehouseId?: string;
  warehouse?: Warehouse;
  photos?: string[];
  dockType?: string;
  supportedVehicleTypes?: string[];
  maxLength?: number;
  maxWidth?: number;
  maxHeight?: number;
  vacants?: Vacant[];
  isActive?: boolean;
  priority?: number;
  bookings?: Booking[];
  busyTimes?: object[];
}

export interface DockFilter {
  page: number;
  searchKey?: string | null;
}
