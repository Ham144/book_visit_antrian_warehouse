import { BookingStatus } from "./shared.type";

export interface VendorDashboardState {
  summaryMetrics: {
    totalBookingsInRange: number;
    totalWarehouses: number;
    activeToday: number;
    completedInRange: number;
    canceledInRange: number;
    onTimeRatePercent: number;
    avgUnloadingMinutes: number;
    lastUpdated: string;
  };

  warehouseBreakdown: Array<{
    warehouseId: string;
    warehouseName: string;
    totalBookings: number;
    activeToday: number;
    completedInRange: number;
    canceledInRange: number;
    onTimeRatePercent: number;
    avgUnloadingMinutes: number;
  }>;

  operationalSnapshotToday: {
    todayQueue: Array<{
      bookingId: string;
      code: string;
      warehouseName: string;
      dockName?: string;
      arrivalTime: string;
      estimatedFinishTime: string;
      status: BookingStatus | string;
      vehicleBrand?: string;
      vehicleType?: string;
      driverName?: string;
      isOverdue: boolean;
      overdueMinutes?: number;
      waitingMinutes?: number;
      priority?: "HIGH" | "NORMAL" | "LOW";
    }>;
    nextArrivals: Array<{
      bookingId: string;
      code: string;
      warehouseName: string;
      dockName?: string;
      arrivalTime: string;
      estimatedFinishTime: string;
      status: BookingStatus | string;
      vehicleBrand?: string;
      vehicleType?: string;
      driverName?: string;
      isOverdue: boolean;
      overdueMinutes?: number;
      waitingMinutes?: number;
      priority?: "HIGH" | "NORMAL" | "LOW";
    }>;
  };

  kpiData: {
    bookingsPerDay: Array<{
      date: string;
      total: number;
      completed: number;
      canceled: number;
    }>;
    onTimeRateTimeline: Array<{
      date: string;
      percent: number;
    }>;
    warehouseDistribution: Array<{
      warehouseName: string;
      total: number;
    }>;
  };

  alerts: Array<{
    id: string;
    type: "OVERDUE" | "NO_SHOW" | "CANCELED_BY_WAREHOUSE" | "SLA_BREACH";
    severity: "LOW" | "MEDIUM" | "HIGH";
    bookingCode?: string;
    warehouseName?: string;
    message: string;
    timestamp: string;
    actionSuggested?: string;
  }>;

  filters: {
    selectedRange: {
      from: string;
      to: string;
      type: "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS" | "CUSTOM";
    };
    selectedWarehouseIds: string[];
    statusFilter: "ALL" | "ACTIVE" | "COMPLETED" | "CANCELED";
  };
}

