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

//untuk user Active directory
export interface UserInfo {
  username: string;
  description: string;
  displayName?: string;
  homeWarehouse: Warehouse; //ini adalah warehouse yang sedang di login-in
  isActive?: boolean;
  organizationName: string;
  warehouseAccess?: Warehouse[];
  driverLicense?: string;
  driverPhone?: string;
  vendorName?: string;
  accountType?: string;
  // Tambahkan field lain sesuai kebutuhan
}

//untuk user APP
export interface UserApp {
  username: string;
  password?: string;
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

export enum AccountType {
  APP = "APP",
  AD = "AD",
}
