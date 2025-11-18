export interface IVehicle {
  id?: string;
  brand?: string;
  jenisKendaraan?: string;
  plateNumber?: string;
  productionYear?: number;
  maxCapacity?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  durasiBongkar: number;
  isReefer?: boolean;
  requiresDock?: string;
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
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
