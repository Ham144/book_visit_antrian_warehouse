import { UserInfo } from "./auth";
import { VehicleType } from "./shared.type";
export interface IVehicle {
    id?: string;
    brand?: string;
    vehicleType?: VehicleType;
    productionYear?: number;
    durasiBongkar: number;
    drivers: UserInfo[];
    description?: string;
    isActive?: boolean;
    driverNames?: string[];
    isReefer?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
