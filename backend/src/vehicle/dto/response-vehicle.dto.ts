export class ResponseVehicleDto {
  id: string;
  brand?: string | null;
  jenisKendaraan?: string | null;
  plateNumber?: string | null;
  productionYear?: number | null;
  maxCapacity?: string | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  durasiBongkar: number;
  isReefer?: boolean | null;
  requiresDock?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  driverLicense?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
