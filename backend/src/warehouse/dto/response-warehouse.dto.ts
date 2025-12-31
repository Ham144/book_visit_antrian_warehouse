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

  @Expose({ groups: ['detail'] })
  @Type(() => LoginResponseDto)
  homeMembers?: LoginResponseDto[];
  @Expose({ groups: ['detail'] })
  bookings?: object[];
  @Expose({ groups: ['detail'] })
  createdAt?: Date;
  @Expose({ groups: ['detail'] })
  @Type(() => LoginResponseDto)
  driver?: LoginResponseDto[];
}
