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
  @Expose({})
  warehouses?: Warehouse[];
  @Expose({})
  accounts?: LoginResponseDto[];
  @Expose({})
  docks?: Dock[];
  @Expose({})
  vehicles?: Vehicle[];
  @Expose({})
  bookings?: Booking[];
}
