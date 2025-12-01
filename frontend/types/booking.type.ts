import { IDock } from "./dock.type";
import { IVehicle } from "./vehicle";
import { Warehouse } from "./warehouse";

export interface Booking {
  id: string;
  vehicleId: string;
  warehouseId: string;
  dockId?: string | null;

  arrivalTime: Date;
  estimatedFinishTime?: Date | null;
  actualFinishTime?: Date | null;
  status: BookingStatus;
  notes?: string | null;

  Vehicle?: IVehicle;
  Warehouse?: Warehouse;
  Dock?: IDock | null;

  createdAt?: Date;
  organizationName: string;
}

export enum BookingStatus {
  UNLOADING = "UNLOADING",
  IN_PROGRESS = " IN_PROGRESS",
  FINISHED = "FINISHED",
  CANCELED = "CANCELED",
}
