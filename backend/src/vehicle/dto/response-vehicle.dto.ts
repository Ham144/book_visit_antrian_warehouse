import { Expose } from 'class-transformer';
import { LoginResponseDto } from 'src/user/dto/login.dto';

export class ResponseVehicleDto {
  @Expose()
  id: string;
  @Expose()
  brand?: string | null;
  @Expose()
  jenisKendaraan?: string | null;
  @Expose()
  plateNumber?: string | null;
  @Expose()
  productionYear?: number | null;
  @Expose()
  maxCapacity?: string | null;
  @Expose()
  dimensionLength?: number | null;
  @Expose()
  dimensionWidth?: number | null;
  @Expose()
  dimensionHeight?: number | null;
  @Expose()
  durasiBongkar: number;
  @Expose()
  driverName?: string | null;
  @Expose()
  isReefer?: boolean | null;
  @Expose()
  requiresDock?: string | null;
  @Expose()
  description?: string | null;
  @Expose()
  isActive: boolean;
  @Expose({ groups: ['detail'] })
  driver: LoginResponseDto;
  @Expose()
  createdAt?: Date;
  @Expose()
  updatedAt?: Date;
}
