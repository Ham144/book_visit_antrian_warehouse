export interface IVehicle {
  id?: string;
  brand?: string;
  jenisKendaraan?: string;
  durasiBongkar: number;
  description?: string;
  maxCapacity?: string;
  dimension?: string;
  isActive?: boolean;
}

export interface VehicleType {
  name: string;
  description: string; // e.g.,  "Cargo", "Container"
  defaultUnloadMinutes: number;
}
