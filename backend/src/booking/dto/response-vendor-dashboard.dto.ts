export class ResponseVendorDashboardDto {
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
      status: string;
      vehicleBrand?: string;
      vehicleType?: string;
      driverName?: string;
      isOverdue: boolean;
      overdueMinutes?: number;
      waitingMinutes?: number;
      priority?: 'HIGH' | 'NORMAL' | 'LOW';
    }>;
    nextArrivals: Array<{
      bookingId: string;
      code: string;
      warehouseName: string;
      dockName?: string;
      arrivalTime: string;
      estimatedFinishTime: string;
      status: string;
      vehicleBrand?: string;
      vehicleType?: string;
      driverName?: string;
      isOverdue: boolean;
      overdueMinutes?: number;
      waitingMinutes?: number;
      priority?: 'HIGH' | 'NORMAL' | 'LOW';
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

  filters: {
    selectedRange: {
      from: string;
      to: string;
      type: 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'CUSTOM';
    };
    selectedWarehouseIds: string[];
    statusFilter: 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  };
}
