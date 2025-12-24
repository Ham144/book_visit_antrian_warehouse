import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { responseWarehouseDto } from 'src/warehouse/dto/response-warehouse.dto';

import { Expose } from 'class-transformer';
import { ResponseVehicleDto } from 'src/vehicle/dto/response-vehicle.dto';
import { ROLE } from 'src/common/shared-enum';

export class LoginResponseDto {
  @Expose()
  description: string;
  @Expose()
  role: ROLE;

  @Expose()
  username: string;

  @Expose()
  displayName: string;

  @Expose()
  homeWarehouse?: responseWarehouseDto;

  @Expose()
  homeWarehouseId?: string;

  @Expose()
  isActive?: boolean;

  @Expose()
  organizationName: string;

  @Expose()
  warehouseAccess?: responseWarehouseDto[];

  @Expose()
  accountType?: string;

  @Expose()
  vendorName?: string;

  @Expose({ groups: ['detail'] })
  vehicle?: ResponseVehicleDto;

  @Expose({ groups: ['detail'] })
  vehicleId?: string;

  @Expose({ groups: ['login'] })
  refresh_token?: string;

  @Expose({ groups: ['login'] })
  access_token?: string;
}

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  organization: string;
}
