import {
  Booking,
  Dock,
  SubscriptionPlan,
  Vehicle,
  Warehouse,
} from '@prisma/client';
import { Expose } from 'class-transformer';

export class ResponseMyOrganizationDto {
  @Expose()
  name: string;
  @Expose()
  subscriptionId?: string;
  @Expose({ groups: ['detail'] })
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
  docks?: Dock[];
  @Expose({ groups: ['detail'] })
  vehicles?: Vehicle[];
  @Expose({ groups: ['detail'] })
  bookings?: Booking[];
}
