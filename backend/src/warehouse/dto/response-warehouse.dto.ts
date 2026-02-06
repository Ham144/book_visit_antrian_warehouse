import { Expose, Type } from 'class-transformer';
import { LoginResponseDto } from 'src/user/dto/login.dto';

export class responseWarehouseDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
  @Expose()
  location?: string;
  @Expose()
  description?: string;
  @Expose()
  isActive?: boolean;
  @Expose()
  docks?: object[];
  @Expose()
  organizationName?: string;
  @Expose()
  @Type(() => LoginResponseDto)
  userWarehouseAccesses?: LoginResponseDto[];
  @Expose()
  intervalMinimalQueueu?: number;
  @Expose()
  delayTolerance?: number;
  @Expose()
  isAutoEfficientActive?: boolean;
  @Expose()
  maximumWeekSelection?: number;

  @Expose({ groups: ['detail'] })
  @Type(() => LoginResponseDto)
  homeMembers?: LoginResponseDto[];
  @Expose({ groups: ['detail'] })
  createdAt?: Date;
}
