import { Expose } from 'class-transformer';
import { LoginResponseDto } from 'src/user/dto/login.dto';

export class responseWarehouseDto {
  @Expose()
  id: String;
  @Expose()
  name: String;
  @Expose()
  location: String;
  @Expose()
  description: String;
  @Expose()
  isActive: Boolean;
  @Expose()
  docks?: object[];
  @Expose()
  organizationName?: String;

  @Expose({ groups: ['detail'] })
  homeMembers?: LoginResponseDto[];
  @Expose({ groups: ['detail'] })
  bookings?: object[];
  @Expose({ groups: ['detail'] })
  createdAt?: Date;
  @Expose({ groups: ['detail'] })
  userWarehouseAccesses?: LoginResponseDto[];
  @Expose({ groups: ['detail'] })
  driver?: object[];
}
