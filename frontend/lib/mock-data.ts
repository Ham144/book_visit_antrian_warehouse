// Mock data for warehouse queue management system in Indonesian

export interface VehicleType {
  id: string;
  name: string;
  description: string; // e.g., "IT", "Cargo", "Container"
  defaultUnloadMinutes: number;
}

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

export interface AdminVehicle {
  id: string;
  merkId: string;
  jenisKendaraan: string;
  unloadDuration: number;
  description?: string;
  maxWeight?: string;
  dimension?: string;
  isActive: boolean;
  createdBy: string;
}

// Mock vehicle types
export const mockVehicleTypes: VehicleType[] = [
  {
    id: "vt-1",
    name: "Truk Kecil",
    description: "IT",
    defaultUnloadMinutes: 30,
  },
  {
    id: "vt-2",
    name: "Truk Sedang",
    description: "Cargo",
    defaultUnloadMinutes: 45,
  },
  {
    id: "vt-3",
    name: "Truk Besar",
    description: "Container",
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
export const mockVehicleBrands: VehicleBrand[] = [
  { id: "brand-1", name: "Hino", country: "Jepang" },
  { id: "brand-2", name: "Mitsubishi Fuso", country: "Jepang" },
  { id: "brand-3", name: "Isuzu", country: "Jepang" },
  { id: "brand-4", name: "Mercedes Benz", country: "Jerman" },
  { id: "brand-5", name: "Volvo", country: "Swedia" },
];

// Mock admin vehicles database with new spec
export const mockAdminVehicles: AdminVehicle[] = [
  {
    id: "v-001",
    merkId: "brand-1",
    jenisKendaraan: "Truck Box",
    unloadDuration: 45,
    description: "Truck besar dengan lift belakang",
    maxWeight: "10 ton",
    dimension: "7m x 2.5m x 3m",
    isActive: true,
    createdBy: "admin-1",
  },
  {
    id: "v-002",
    merkId: "brand-2",
    jenisKendaraan: "Wing Box",
    unloadDuration: 50,
    description: "Truck dengan sayap samping",
    maxWeight: "12 ton",
    dimension: "8m x 2.8m x 3.5m",
    isActive: true,
    createdBy: "admin-1",
  },
  {
    id: "v-003",
    merkId: "brand-3",
    jenisKendaraan: "Pick Up",
    unloadDuration: 20,
    description: "Kendaraan pickup ringan",
    maxWeight: "2 ton",
    dimension: "5m x 1.8m x 1.8m",
    isActive: true,
    createdBy: "admin-1",
  },
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
