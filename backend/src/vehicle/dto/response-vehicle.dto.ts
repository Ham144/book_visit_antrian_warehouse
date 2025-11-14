import { CreateVehicleDto } from './create-vehicle.dto';

export class ResponseVehicleDto extends CreateVehicleDto {
  id: string;
  brand?: string | null;
  jenisKendaraan?: string | null;
  durasiBongkar: number;
  description?: string | null;
  maxCapacity?: string | null;
  dimension?: string | null;
  isActive: boolean;
}
