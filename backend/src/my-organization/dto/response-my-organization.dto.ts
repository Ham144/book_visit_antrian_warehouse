import {
  Booking,
  Dock,
  SubscriptionPlan,
  Vehicle,
  Warehouse,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { LoginResponseDto } from 'src/user/dto/login.dto';

export class ResponseMyOrganizationDto {
  @Expose()
  name: string;
  @Expose()
  subscriptionId?: string;
  @Expose({})
  subscription?: SubscriptionPlan;
  @Expose({ groups: ['detail'] })
  AD_HOST?: string;
  @Expose({ groups: ['detail'] })
  AD_PORT?: string;
  @Expose({ groups: ['detail'] })
  AD_DOMAIN?: string;
  @Expose({ groups: ['detail'] })
  AD_BASE_DN?: string;
  @Expose({ groups: ['detail'] })
  warehouses?: Warehouse[];
  @Expose({ groups: ['detail'] })
  accounts?: LoginResponseDto[];
  @Expose({ groups: ['detail'] })
  docks?: Dock[];
  @Expose({ groups: ['detail'] })
  vehicles?: Vehicle[];
  @Expose({ groups: ['detail'] })
  bookings?: Booking[];
}
