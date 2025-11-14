// Mock data for warehouse queue management system in Indonesian

import { VehicleType } from "@/types/vehicle";

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  timezone: string;
  openHours: { start: string; end: string };
}

export interface Slot {
  id: string;
  warehouseId: string;
  name: string;
  type: "dock" | "gate";
  maxVehicle: "small" | "medium" | "large";
  status: "active" | "inactive";
}

export interface UserVehicle {
  id: string;
  vendorId: string;
  brand: string;
  licensePlate: string;
  vehicleTypeId: string;
  description?: string;
  status: "active" | "inactive";
}

export interface Booking {
  id: string;
  warehouseId: string;
  slotId: string;
  vendorId: string;
  vehicleId: string;
  plate: string;
  start: string;
  end: string;
  status: "pending" | "confirmed" | "ongoing" | "completed" | "cancelled";
}

// New interfaces for vehicle brand and admin vehicle
export interface VehicleBrand {
  id: string;
  name: string;
  country?: string;
}

export const mockVehicleTypes: VehicleType[] = [
  {
    name: "Truk Kecil",
    description:
      "Kendaraan pengangkut berkapasitas kecil, cocok untuk distribusi dalam kota.",
    defaultUnloadMinutes: 30,
  },
  {
    name: "Truk Sedang",
    description:
      "Truk dengan kapasitas sedang untuk pengiriman jarak menengah.",
    defaultUnloadMinutes: 45,
  },
  {
    name: "Truk Besar",
    description: "Truk berkapasitas besar untuk kontainer atau muatan berat.",
    defaultUnloadMinutes: 60,
  },
];

// Mock warehouses
export const mockWarehouses: Warehouse[] = [
  {
    id: "w-1",
    name: "Gudang Jakarta Barat",
    address: "Jl. Gatot Subroto, Jakarta Barat",
    timezone: "Asia/Jakarta",
    openHours: { start: "07:00", end: "18:00" },
  },
  {
    id: "w-2",
    name: "Gudang Jakarta Timur",
    address: "Jl. Tentara Pelajar, Jakarta Timur",
    timezone: "Asia/Jakarta",
    openHours: { start: "07:00", end: "18:00" },
  },
];

// Mock slots
export const mockSlots: Slot[] = [
  {
    id: "s-1",
    warehouseId: "w-1",
    name: "Dock A",
    type: "dock",
    maxVehicle: "large",
    status: "active",
  },
  {
    id: "s-2",
    warehouseId: "w-1",
    name: "Dock B",
    type: "dock",
    maxVehicle: "medium",
    status: "active",
  },
  {
    id: "s-3",
    warehouseId: "w-1",
    name: "Gate 1",
    type: "gate",
    maxVehicle: "large",
    status: "active",
  },
  {
    id: "s-4",
    warehouseId: "w-2",
    name: "Dock C",
    type: "dock",
    maxVehicle: "medium",
    status: "active",
  },
];

// Mock user vehicles
export const mockUserVehicles: UserVehicle[] = [
  {
    id: "uv-1",
    vendorId: "vendor-1",
    brand: "Hino 500",
    licensePlate: "B1234CD",
    vehicleTypeId: "vt-2",
    description: "Cargo",
    status: "active",
  },
  {
    id: "uv-2",
    vendorId: "vendor-1",
    brand: "Mitsubishi Fuso",
    licensePlate: "B5678EF",
    vehicleTypeId: "vt-3",
    description: "Container",
    status: "active",
  },
];

// Mock bookings
export const mockBookings: Booking[] = [
  {
    id: "b-1",
    warehouseId: "w-1",
    slotId: "s-1",
    vendorId: "vendor-1",
    vehicleId: "uv-1",
    plate: "B1234CD",
    start: "2025-11-12T09:00:00+07:00",
    end: "2025-11-12T10:00:00+07:00",
    status: "completed",
  },
];

// Mock vehicle brands data
export const mockVehicleBrands: string[] = [
  // Small / light trucks
  "Suzuki",
  "Daihatsu",
  "Toyota",
  "Hyundai",

  // Medium trucks (most common in Indonesia)
  "Mitsubishi Fuso",
  "Hino",
  "Isuzu",

  // Heavy duty / container
  "Mercedes Benz",
  "Volvo",
  "Scania",
  "MAN",
  "FAW",
  "Foton",
];

// Utility functions
export function getVehicleTypeName(vehicleTypeId: string): string {
  return (
    mockVehicleTypes.find((vt) => vt.id === vehicleTypeId)?.name || "Unknown"
  );
}

export function getWarehouseName(warehouseId: string): string {
  return mockWarehouses.find((w) => w.id === warehouseId)?.name || "Unknown";
}

export function getSlotName(slotId: string): string {
  return mockSlots.find((s) => s.id === slotId)?.name || "Unknown";
}

export function getDefaultUnloadMinutes(vehicleTypeId: string): number {
  return (
    mockVehicleTypes.find((vt) => vt.id === vehicleTypeId)
      ?.defaultUnloadMinutes || 30
  );
}

export function getBrandName(brandId: string): string {
  return mockVehicleBrands.find((b) => b.id === brandId)?.name || "Unknown";
}
