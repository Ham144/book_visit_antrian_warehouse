import { Booking } from "@/lib/booking.type";
import { IDock } from "./dock.type";
import { IVehicle } from "./vehicle";
import { Warehouse } from "./warehouse";
import { UserInfo } from "./auth";
import { SubscriptionPlan } from "./shared.type";

export interface Organization {
  id: string;
  name: string;
  subscriptionId?: string;
  subscription?: SubscriptionPlan;
  AD_HOST?: string;
  AD_PORT?: string;
  AD_DOMAIN?: string;
  AD_BASE_DN?: string;
  warehouses: Warehouse[];
  docks: IDock;
  vehicles: IVehicle[];
  bookings: Booking[];
  accounts: UserInfo[];
}
