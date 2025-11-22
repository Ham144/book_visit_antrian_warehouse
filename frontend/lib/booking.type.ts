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
