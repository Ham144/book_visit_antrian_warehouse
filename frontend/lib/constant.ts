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

// Fungsi untuk menghitung progress unloading (0-100%)
export const calculateTimeProgress = (booking: Booking): number => {
  try {
    const now = new Date();
    const arrival = new Date(booking.actualArrivalTime);
    const estimatedFinish = new Date(
      new Date(booking.actualStartTime).getTime() +
        booking.Vehicle.durasiBongkar * 60000
    );

    if (isNaN(arrival.getTime()) || isNaN(estimatedFinish.getTime())) {
      return 0;
    }

    const totalDuration = estimatedFinish.getTime() - arrival.getTime();
    const elapsedTime = now.getTime() - arrival.getTime();

    if (totalDuration <= 0) return 100;
    if (elapsedTime <= 0) return 0;
    if (elapsedTime >= totalDuration) return 100;

    return Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100));
  } catch (error) {
    return 0;
  }
};

export const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export const normalizeDate = (d: Date) => {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
};
