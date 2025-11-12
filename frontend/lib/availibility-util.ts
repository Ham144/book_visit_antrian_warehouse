// Utility functions for availability calculation and slot management

import {
  mockSlots,
  mockVehicleTypes,
  mockBookings,
  type Slot,
  type VehicleType,
} from "@/lib/mock-data";

export interface AvailableSlot {
  slot: Slot;
  vehicleType: VehicleType;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Get available slots for a specific warehouse and date
export function getAvailableSlots(
  warehouseId: string,
  selectedDate: string,
  selectedTime: string,
  vehicleTypeId: string
): AvailableSlot[] {
  const vehicleType = mockVehicleTypes.find((vt) => vt.id === vehicleTypeId);
  if (!vehicleType) return [];

  const slots = mockSlots.filter(
    (s) => s.warehouseId === warehouseId && s.status === "active"
  );

  return slots.map((slot) => {
    const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const endDateTime = new Date(
      startDateTime.getTime() + vehicleType.defaultUnloadMinutes * 60000
    );

    // Check if slot is available at the requested time
    const isAvailable = !isSlotOccupied(slot.id, startDateTime, endDateTime);

    return {
      slot,
      vehicleType,
      startTime: selectedTime,
      endTime: endDateTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isAvailable,
    };
  });
}

// Check if slot is occupied during the requested time period
export function isSlotOccupied(
  slotId: string,
  startTime: Date,
  endTime: Date
): boolean {
  return mockBookings.some((booking) => {
    if (booking.slotId !== slotId || booking.status === "cancelled")
      return false;

    const bookingStart = new Date(booking.start);
    const bookingEnd = new Date(booking.end);

    // Check for overlap
    return startTime < bookingEnd && endTime > bookingStart;
  });
}

// Get time slots for a specific date
export function getTimeSlots(): string[] {
  const slots = [];
  for (let hour = 7; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      slots.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      );
    }
  }
  return slots;
}

// Format date to Indonesian format
export function formatDateIndonesian(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Get next available dates (excluding weekends)
export function getNextAvailableDates(daysCount = 30): string[] {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysCount; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + i);

    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      dates.push(currentDate.toISOString().split("T")[0]);
    }
  }

  return dates;
}

// Calculate ETA and finish time
export function calculateBookingTime(
  startTime: string,
  vehicleTypeId: string
): { start: string; end: string; duration: number } {
  const vehicleType = mockVehicleTypes.find((vt) => vt.id === vehicleTypeId);
  const durationMinutes = vehicleType?.defaultUnloadMinutes || 30;

  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  return {
    start: startDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    end: endDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    duration: durationMinutes,
  };
}
