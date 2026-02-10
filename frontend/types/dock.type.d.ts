import { Booking } from "./booking.type";
import { Vacant } from "./vacant.type";
import { VehicleType } from "./shared.type";
import { Warehouse } from "./warehouse";
export interface IDock {
    id?: string;
    name: string;
    warehouseId?: string;
    warehouse?: Warehouse;
    photos?: string[];
    allowedTypes?: VehicleType[];
    isActive?: boolean;
    priority?: number;
    vacants?: Vacant[];
    bookings?: Booking[];
    busyTimes?: object[];
}
export interface DockFilter {
    page: number;
    searchKey?: string | null;
}
