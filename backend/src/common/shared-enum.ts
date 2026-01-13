//DockBusyTime
export enum Recurring {
  DAILY = 'DAILY', // recurringStep menentukan berapa lompatan tiap hari
  WEEKLY = 'WEEKLY', // customDay
  MONTHLY = 'MONTHLY', // recurringStep menentukan tanggal berapa dalam 1 bulan
}

//Subscription.plan
export enum SubscriptionPlan {
  TRIAL = 'TRIAL',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}

//vacant.day
export enum Days {
  SENIN = 'SENIN',
  SELASA = 'SELASA',
  RABU = 'RABU',
  KAMIS = 'KAMIS',
  JUMAT = 'JUMAT',
  SABTU = 'SABTU',
  MINGGU = 'MINGGU',
}

//Booking.status
export enum BookingStatus {
  IN_PROGRESS = 'IN_PROGRESS', //ini yang sudah book
  UNLOADING = 'UNLOADING', //ini sangat unique tidak boleh ada 2 dalam 1 dock
  FINISHED = 'FINISHED', //ini yang sudah selesai
  CANCELED = 'CANCELED', //ini yang sudah dibatalkan
}

//User.role
export enum ROLE {
  DRIVER_VENDOR = 'DRIVER_VENDOR',
  ADMIN_VENDOR = 'ADMIN_VENDOR',
  ADMIN_ORGANIZATION = 'ADMIN_ORGANIZATION',
  USER_ORGANIZATION = 'USER_ORGANIZATION',
}

//User.accountType
export enum AccountType {
  APP = 'APP',
  AD = 'AD',
}

//Vehicle.type, Dock.allowedTypes[]
export enum VehicleType {
  // Light Vehicle
  PICKUP = 'PICKUP',
  PICKUP_BOX = 'PICKUP_BOX',
  GRANDMAX_PICKUP = 'GRANDMAX_PICKUP',
  GRANDMAX_BOX = 'GRANDMAX_BOX',
  VAN = 'VAN',

  // Medium
  CDE = 'CDE',
  CDD = 'CDD',
  CDD_BOX = 'CDD_BOX',

  // Heavy
  FUSO = 'FUSO',
  FUSO_BOX = 'FUSO_BOX',
  TRONTON = 'TRONTON',
  TRONTON_BOX = 'TRONTON_BOX',

  // Container
  CONTAINER_20 = 'CONTAINER_20',
  CONTAINER_40 = 'CONTAINER_40',

  // Special / others
  WINGBOX = 'WINGBOX',
  TANKER = 'TANKER',
  FLATBED = 'FLATBED',
}

// Mock vehicle brands data
export const mockVehicleBrands: string[] = [
  // Small / light trucks
  'Suzuki',
  'Daihatsu',
  'Toyota',
  'Hyundai',

  // Medium trucks (most common in Indonesia)
  'Mitsubishi Fuso',
  'Hino',
  'Isuzu',

  // Heavy duty / container
  'Mercedes Benz',
  'Volvo',
  'Scania',
  'MAN',
  'FAW',
  'Foton',
];

export interface GetLandingPageStats {
  totalWarehouse: number;
  activeSlot: number;
  bookedToday: number;
  succeedBooking: number;
}

export type DragAndDropPayload =
  | {
      action: 'MOVE_WITHIN_DOCK';
      toStatus: 'UNLOADING' | 'IN_PROGRESS';
      dockId?: string;
      relativePositionTarget: {
        type: 'AFTER' | 'SWAP' | 'BEFORE'; //SWAP hanya berlaku antar dock yang sama dan harus sama2 IN_PROGRESS
        bookingId: string;
      };
    }
  | {
      action: 'MOVE_OUTSIDE_DOCK';
      toStatus: 'UNLOADING' | 'CANCELED' | 'IN_PROGRESS';
      dockId?: string;
      relativePositionTarget: {
        type: 'AFTER' | 'SWAP' | 'BEFORE';
        bookingId: string;
      };
    };
