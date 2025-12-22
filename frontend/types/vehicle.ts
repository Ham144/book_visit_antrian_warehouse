import { UserInfo } from "./auth";
import { DockRequirement, VehicleType } from "./shared.type";

export interface IVehicle {
  id?: string;
  brand?: string;
  vehicleType?: VehicleType;
  productionYear?: number;
  durasiBongkar: number;
  requiresDock?: DockRequirement;
  drivers: UserInfo[];
  description?: string;
  isActive?: boolean;
  driverNames?: string[];
  isReefer?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
