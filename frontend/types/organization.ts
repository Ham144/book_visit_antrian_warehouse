import { IDock } from "./dock.type";
import { IVehicle } from "./vehicle";
import { Warehouse } from "./warehouse";
import { UserInfo } from "./auth";
import { SubscriptionPlan } from "./shared.type";
import { Booking } from "./booking.type";

export interface Organization {
  name: string;
  subscriptionId?: string;
  subscription?: SubscriptionPlan;
  AD_HOST?: string;
  AD_PORT?: string;
  AD_DOMAIN?: string;
  AD_BASE_DN?: string;
  warehouses?: Warehouse[];
  docks?: IDock[];
  vehicles?: IVehicle[];
  bookings?: Booking[];
  accounts?: UserInfo[];
  isEditing?: boolean;
}

export interface MyOrganizationSettingsDto {
  name: string;
  AD_HOST?: string;
  AD_PORT?: string;
  AD_DOMAIN?: string;
  AD_BASE_DN?: string;
  disabledFeatures: string[];
}
