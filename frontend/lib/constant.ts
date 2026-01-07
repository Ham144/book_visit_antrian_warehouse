import { Booking } from "@/types/booking.type";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  ? process.env.NEXT_PUBLIC_BASE_URL
  : "http://192.168.169.12:3001";
// Calculate time remaining dari arrivalTime menuju now
export const timeRemainingAutoUnloading = (booking: Booking): string => {
  try {
    const now = new Date();

    // Pastikan arrivalTime adalah Date object yang valid
    const arrivalTime = new Date(booking.arrivalTime);
    if (isNaN(arrivalTime.getTime())) {
      return "Time error";
    }

    // Hitung selisih antara arrivalTime dan now
    const diffMs = arrivalTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Jika arrivalTime sudah lewat (di masa lalu)
    if (diffMs < 0) {
      const minutesPast = Math.abs(diffMinutes);
      return `+${minutesPast} min`; // atau "-{minutes} min" tergantung preferensi
    }

    // Jika masih di masa depan
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }

    // Kurang dari 1 jam
    return `${diffMinutes} min`;
  } catch (error) {
    console.error("Error calculating time remaining:", error);
    return "Error";
  }
};
