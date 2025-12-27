import { Expose } from 'class-transformer';

export class ResponseVehicleDto {
  @Expose()
  id: string;
  @Expose()
  brand?: string;
  @Expose()
  productionYear?: number;
  @Expose()
  vehicleType?: string;
  @Expose()
  durasiBongkar: number;
  @Expose()
  description?: string;
  @Expose()
  isActive: boolean;
  @Expose({ groups: ['detail'] })
  createdAt?: Date;
  @Expose({ groups: ['detail'] })
  updatedAt?: Date;
}
