import { Booking } from "./booking.type";
export interface BaseProps {
    page?: number;
    searchKey?: string;
}
export declare const BasePropsInit: BaseProps;
export declare enum Recurring {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY"
}
export declare enum SubscriptionPlan {
    TRIAL = "TRIAL",
    PRO = "PRO",
    PREMIUM = "PREMIUM"
}
export declare enum Days {
    SENIN = "SENIN",
    SELASA = "SELASA",
    RABU = "RABU",
    KAMIS = "KAMIS",
    JUMAT = "JUMAT",
    SABTU = "SABTU",
    MINGGU = "MINGGU"
}
export declare enum BookingStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    UNLOADING = "UNLOADING",
    FINISHED = "FINISHED",
    CANCELED = "CANCELED",
    DELAYED = "DELAYED"
}
export declare enum ROLE {
    DRIVER_VENDOR = "DRIVER_VENDOR",
    ADMIN_VENDOR = "ADMIN_VENDOR",
    ADMIN_ORGANIZATION = "ADMIN_ORGANIZATION",
    USER_ORGANIZATION = "USER_ORGANIZATION",
    ADMIN_GUDANG = "ADMIN_GUDANG"
}
export declare enum AccountType {
    APP = "APP",
    AD = "AD"
}
export declare enum VehicleType {
    PICKUP = "PICKUP",
    PICKUP_BOX = "PICKUP_BOX",
    GRANDMAX_PICKUP = "GRANDMAX_PICKUP",
    GRANDMAX_BOX = "GRANDMAX_BOX",
    VAN = "VAN",
    CDE = "CDE",
    CDD = "CDD",
    CDD_BOX = "CDD_BOX",
    FUSO = "FUSO",
    FUSO_BOX = "FUSO_BOX",
    TRONTON = "TRONTON",
    TRONTON_BOX = "TRONTON_BOX",
    CONTAINER_20 = "CONTAINER_20",
    CONTAINER_40 = "CONTAINER_40",
    WINGBOX = "WINGBOX",
    TANKER = "TANKER",
    FLATBED = "FLATBED"
}
export interface GetLandingPageStats {
    totalWarehouse: number;
    activeSlot: number;
    bookedToday: number;
    succeedBooking: number;
}
export interface InventoryBooking extends Booking {
    type: "delayed" | "canceled";
}
export type DragAndDropPayload = {
    action: "MOVE_WITHIN_DOCK";
    toStatus: "UNLOADING" | "IN_PROGRESS";
    dockId?: string;
    relativePositionTarget: {
        type: "AFTER" | "SWAP" | "BEFORE";
        bookingId: string;
    };
} | {
    action: "MOVE_OUTSIDE_DOCK";
    toStatus: "UNLOADING" | "CANCELED" | "IN_PROGRESS";
    dockId?: string;
    relativePositionTarget: {
        type: "AFTER" | "SWAP" | "BEFORE";
        bookingId: string;
    };
};
