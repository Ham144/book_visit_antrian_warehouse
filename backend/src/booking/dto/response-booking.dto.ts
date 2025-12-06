import { Expose } from 'class-transformer';
import { ResponseDockDto } from 'src/dock/dto/response-dock.dto';
import { LoginResponseDto } from 'src/user/dto/login.dto';
import { ResponseVehicleDto } from 'src/vehicle/dto/response-vehicle.dto';
import { responseWarehouseDto } from 'src/warehouse/dto/response-warehouse.dto';

export class ResponseBookingDto {
  @Expose()
  id: string;
  @Expose()
  vehicleId: string;
  @Expose()
  warehouseId: string;
  @Expose()
  dockId?: string | null;

  @Expose()
  arrivalTime: string;
  @Expose()
  estimatedFinishTime?: string | null;
  @Expose()
  actualFinishTime?: string | null;
  @Expose()
  status: string;
  @Expose({ groups: ['detail'] })
  notes?: string | null;
  @Expose()
  driverId?: string;
  @Expose()
  counterId?: number;
  canceledReason?: string;

  @Expose({ groups: ['detail'] })
  Vehicle?: ResponseVehicleDto;
  @Expose({ groups: ['detail'] })
  Warehouse?: responseWarehouseDto;
  @Expose({ groups: ['detail'] })
  Dock?: ResponseDockDto;
  @Expose({ groups: ['detail'] })
  Driver?: LoginResponseDto;

  @Expose()
  createdAt?: Date;
  @Expose()
  organizationName: string;
}
