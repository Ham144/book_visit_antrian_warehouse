import { UserInfo } from "./auth";
import { IDock } from "./dock.type";
import { IVehicle } from "./vehicle";
import { Warehouse } from "./warehouse";

export interface Booking {
  id?: string;
  vehicleId: string | null;
  warehouseId: string;
  dockId: string;
  arrivalTime: Date | null;
  estimatedFinishTime: Date | null;
  actualFinishTime?: Date | null;
  status?: BookingStatus;
  notes?: string | null;
  driverId?: string;
  counterId?: number;
  canceledReason?: string;

  Vehicle?: IVehicle | null;
  Warehouse?: Warehouse | null;
  Dock?: IDock | null | null;
  Driver?: UserInfo | null;

  createdAt?: Date;
  organizationName?: string;
}

export interface BookingFilter {
  searchKey?: string | null;
  warehouseId?: string | null;
}

export enum BookingStatus {
  UNLOADING = "UNLOADING",
  IN_PROGRESS = " IN_PROGRESS",
  FINISHED = "FINISHED",
  CANCELED = "CANCELED",
}
