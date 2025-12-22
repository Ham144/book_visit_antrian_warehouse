import { Expose } from 'class-transformer';
import { LoginResponseDto } from 'src/user/dto/login.dto';

export class ResponseVehicleDto {
  @Expose()
  id: string;
  @Expose()
  brand?: string;
  @Expose()
  jenisKendaraan?: string;
  @Expose()
  productionYear?: number;
  @Expose()
  vehicleType?: string;
  @Expose()
  durasiBongkar: number;
  @Expose()
  requiresDock?: string;
  @Expose()
  description?: string;
  @Expose()
  isActive: boolean;
  @Expose()
  drivers: LoginResponseDto[];
  @Expose()
  createdAt?: Date;
  @Expose()
  updatedAt?: Date;
}
