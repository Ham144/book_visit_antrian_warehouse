import { Booking } from "@/types/booking.type";
import { IDock } from "@/types/dock.type";

//Backend Polling & socket di port yg sama
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
    const start = new Date(booking.actualStartTime);
    const estimatedActualFinishTime = new Date(
      new Date(booking.actualStartTime).getTime() +
        booking.Vehicle.durasiBongkar * 60000
    );

    if (isNaN(start.getTime()) || isNaN(estimatedActualFinishTime.getTime())) {
      return 0;
    }

    const totalDuration = estimatedActualFinishTime.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();

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

export const FormatTimeIndonesian = (date: Date) => {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export interface DashboardState {
  summaryMetrics: {
    totalBookingsToday: number;
    activeQueue: number;
    completedToday: number;
    delayedBookings: number;
    avgProcessingMinutes: number;
    dockUtilizationPercent: number;
    lastUpdated: string;
  };

  dockStatuses: Array<{
    dockId: string;
    dockName: string;
    status: "IDLE" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
    bookingCode?: string;
    vendorName?: string;
    estimatedFinishTime?: string;
    remainingMinutes: number;
    isOverdue: boolean;
    colorStatus: "green" | "yellow" | "red";
  }>;

  queueSnapshot: Array<{
    bookingId: string;
    code: string;
    vendorName: string;
    arrivalTime: string;
    estimatedFinishTime: string;
    status: "WAITING" | "ASSIGNED" | "ARRIVED";
    dock: IDock,
    isOverdue: boolean;
    waitingMinutes: number;
  }>;

  kpiData: {
    queueLengthTimeline: Array<{ time: string; value: number }>;
    avgWaitingTime: Array<{ time: string; minutes: number }>;
    dockThroughput: Array<{ dock: string; completed: number }>;
  };
  busyTimeData: {
    currentBusyWindow?: {
      from: string;
      to: string;
      affectedDocks: string[];
      intensity: "MEDIUM" | "HIGH";
    };
    nextBusyWindow?: {
      from: string;
      to: string;
      predictedIntensity: number;
    };
  };
  alerts: Array<{
    id: string;
    type: "OVERDUE" | "NO_SHOW" | "DOCK_BLOCKED" | "SLA_BREACH";
    severity: "LOW" | "MEDIUM" | "HIGH";
    bookingCode?: string;
    dockId?: string;
    message: string;
    timestamp: string;
    acknowledged: boolean;
    actionRequired: boolean;
  }>;
  selectedDock: string | null;
  selectedBooking: string | null;
  quickActionPanel: {
    reassignModalOpen: boolean;
    noteModalOpen: boolean;
    autoEfficiencyEnabled: boolean;
  };

  connection: {
    isConnected: boolean;
    lastMessageTime: string;
    error: string | null;
  };
}