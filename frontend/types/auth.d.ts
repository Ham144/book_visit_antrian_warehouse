import { IVehicle } from "./vehicle";
import { Warehouse } from "./warehouse";
export interface LoginRequestDto {
    username: string;
    password: string;
    organization: string;
}
export interface LoginResponseDto {
    access_token: string;
    refresh_token: string;
    user: UserInfo;
}
export interface UserInfo {
    username: string;
    description: string;
    role: string;
    displayName?: string;
    homeWarehouse: Warehouse;
    isActive?: boolean;
    organizationName: string;
    warehouseAccess?: Warehouse[];
    driverLicense?: string;
    driverPhone?: string;
    vendorName?: string;
    accountType?: string;
}
export interface UserApp {
    username: string;
    password?: string;
    role: string;
    passwordConfirm?: string;
    description?: string;
    displayName?: string;
    homeWarehouseId?: string;
    mail?: string;
    isActive?: boolean;
    organizationName: string;
    warehouseAccess?: Warehouse[];
    driverLicense?: string;
    accountType?: string;
    driverPhone?: string;
    vehicle?: IVehicle;
    homeWarehouse?: Warehouse;
    vendorName?: string;
}
export interface ErrorResponse {
    statusCode: number;
    message: string;
    error?: string;
}
export declare enum AccountType {
    APP = "APP",
    AD = "AD"
}
export interface IMemberManagement {
    page: number;
    searchKey: string | undefined;
    vendorName?: string;
    role?: string;
}
