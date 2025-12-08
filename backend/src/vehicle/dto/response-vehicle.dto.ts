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
  productionYear?: number | null;
  @Expose()
  maxCapacity?: string | null;
  @Expose()
  durasiBongkar: number;
  @Expose()
  requiresDock?: string | null;
  @Expose()
  description?: string | null;
  @Expose()
  isActive: boolean;
  @Expose({ groups: ['detail'] })
  drivers: LoginResponseDto[];
  @Expose()
  createdAt?: Date;
  @Expose()
  updatedAt?: Date;
}
