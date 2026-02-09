import { ResponseBookingDto } from './response-booking.dto';

export class ResponseDashboardBookingDto {
  summaryMetrics: {
    totalBookingsToday: number;
    pending: number;
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
    status: string;
    vendorName?: string;
    remainingMinutes?: number;
  }>;
  queueSnapshot: any[];
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
      intensity: 'MEDIUM' | 'HIGH';
    };
    nextBusyWindow?: {
      from: string;
      to: string;
      predictedIntensity: number;
    };
  };

  alerts: Array<{
    id: string;
    type: 'OVERDUE' | 'NO_SHOW' | 'DOCK_BLOCKED' | 'SLA_BREACH';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    bookingCode?: string;
    dockId?: string;
    message: string;
    timestamp: string;
    acknowledged: boolean;
    actionRequired: boolean;
  }>;

  filters: {
    searchQuery: string;
    selectedStatuses: string[];
    selectedDocks: string[];
    timeRange: {
      start: string;
      end: string;
    };
    priorityFilter: 'ALL' | 'HIGH' | 'NORMAL' | 'LOW';
  };

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
