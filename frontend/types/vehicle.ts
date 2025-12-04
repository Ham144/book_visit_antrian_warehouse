import { UserInfo } from "./auth";

export interface IVehicle {
  id?: string;
  brand?: string;
  jenisKendaraan?: string;
  productionYear?: number;
  maxCapacity?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  durasiBongkar: number;
  driverNames?: string[];
  drivers: UserInfo[];
  isReefer?: boolean;
  requiresDock?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleType {
  name: string;
  description: string; // e.g.,  "Cargo", "Container"
  defaultUnloadMinutes: number;
}
