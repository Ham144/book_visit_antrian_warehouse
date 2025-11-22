import { Booking } from "@/lib/booking.type";
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
  availableFrom?: Date;
  availableUntil?: Date;
  isActive?: boolean;
  priority?: number;
  bookings?: Booking[];
  busyTimes?: object[];
}

export interface DockFilter {
  page: number;
  warehouseId?: string | null;
}
