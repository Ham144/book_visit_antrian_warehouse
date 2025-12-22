// Mock data for warehouse queue management system in Indonesian

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  timezone: string;
  openHours: { start: string; end: string };
}

// New interfaces for vehicle brand and admin vehicle
export interface VehicleBrand {
  id: string;
  name: string;
  country?: string;
}

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
