import { Expose, Type } from 'class-transformer';
import { ResponseDockDto } from 'src/dock/dto/response-dock.dto';
import { LoginResponseDto } from 'src/user/dto/login.dto';
import { ResponseVehicleDto } from 'src/vehicle/dto/response-vehicle.dto';
import { responseWarehouseDto } from 'src/warehouse/dto/response-warehouse.dto';

export class ResponseBookingDto {
  @Expose()
  id: string;
  @Expose()
  code?: string;
  @Expose()
  vehicleId: string;
  @Expose()
  warehouseId: string;
  @Expose()
  dockId?: string | null;

  @Expose()
  arrivalTime: Date;
  @Expose()
  @Type(() => Date)
  actualArrivalTime?: Date; //ini konfirmasi sudah sampai
  @Expose()
  @Type(() => Date)
  actualStartTime?: Date; //ini kenyataannya
  @Expose()
  @Type(() => Date)
  actualFinishTime?: Date; //ini kenyataannya
  status: string;
  @Expose()
  driverUsername: string;

  @Expose({ groups: ['detail'] })
  createdByUsername?: string;

  @Expose({ groups: ['detail'] })
  canceledReason?: string;

  @Expose({ groups: ['detail'] })
  notes?: string | null;

  @Expose({ groups: ['detail'] })
  @Type(() => ResponseVehicleDto)
  Vehicle?: ResponseVehicleDto;

  @Expose({ groups: ['detail'] })
  @Type(() => responseWarehouseDto)
  Warehouse?: responseWarehouseDto;

  @Expose({ groups: ['detail'] })
  @Type(() => ResponseDockDto)
  Dock?: ResponseDockDto;

  @Expose({ groups: ['detail'] })
  @Type(() => LoginResponseDto)
  driver?: LoginResponseDto;

  @Expose({ groups: ['detail'] })
  organizationName: string;
}
