import { UserApp, UserInfo } from "./auth";
import { IDock } from "./dock.type";
import { IVehicle } from "./vehicle";
import { Warehouse } from "./warehouse";
import { BookingStatus } from "./shared.type";
export interface Booking {
    id?: string;
    code?: string;
    vehicleId: string | null;
    warehouseId: string;
    dockId: string;
    arrivalTime: Date;
    estimatedFinishTime: Date;
    actualArrivalTime?: Date;
    actualStartTime?: Date;
    actualFinishTime?: Date;
    status?: BookingStatus;
    notes?: string | null;
    driverUsername?: string;
    counterId?: number;
    canceledReason?: string;
    Vehicle?: IVehicle | null;
    Warehouse?: Warehouse | null;
    Dock?: IDock | null | null;
    driver?: UserInfo | UserApp;
    isConfirmed?: boolean;
    createdAt?: Date;
    organizationName?: string;
}
export interface BookingFilter {
    searchKey?: string | null;
    warehouseId?: string | null;
    page?: number;
    vendorName?: string | null;
    date?: string | null;
    status?: "all" | "PENDING" | "CANCELED" | "DELAYED" | "FINISHED" | "IN_PROGRESS" | "UNLOADING";
    weekStart?: string;
    weekEnd?: string;
    isForBooking?: boolean;
    sortBy?: "updatedAt" | "bookingDate";
    sortOrder?: "asc" | "desc";
    dockId?: string;
}
export interface UpdateBookingStatus {
    id: string;
    status: BookingStatus;
    actualFinishTime?: Date;
    actualArrivalTime?: Date;
    canceledReason?: string;
}
