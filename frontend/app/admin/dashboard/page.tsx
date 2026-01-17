"use client";
import React, { useState, useEffect } from "react";
import {
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Building,
  Users,
  Package,
  Filter,
  Search,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

// Components
import AlertItem from "@/components/admin/dashboard-component/AlertItem";
import DockStatusCard from "@/components/admin/dashboard-component/DockStatusCard";
import QueueTableRow from "@/components/admin/dashboard-component/QueueTableRow";
import QuickActionPanel from "./QuickActionPanel";
import SparklineChart from "@/components/admin/dashboard-component/SparklineChart";
import SummaryCard from "@/components/admin/dashboard-component/SummaryCard";

// Types
interface DashboardState {
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
    priority: "HIGH" | "NORMAL" | "LOW";
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

  filters: {
    searchQuery: string;
    selectedStatuses: string[];
    selectedDocks: string[];
    timeRange: {
      start: string;
      end: string;
    };
    priorityFilter: "ALL" | "HIGH" | "NORMAL" | "LOW";
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

// Mock initial state
const initialDashboardState: DashboardState = {
  summaryMetrics: {
    totalBookingsToday: 124,
    activeQueue: 18,
    completedToday: 96,
    delayedBookings: 7,
    avgProcessingMinutes: 42,
    dockUtilizationPercent: 83,
    lastUpdated: new Date().toISOString(),
  },
  dockStatuses: [
    {
      dockId: "dock-01",
      dockName: "Dock A1",
      status: "IN_PROGRESS",
      bookingCode: "Q-2026-0012",
      vendorName: "PT Sumber Logistik",
      estimatedFinishTime: "2026-01-17T14:30:00Z",
      remainingMinutes: 18,
      isOverdue: false,
      colorStatus: "green",
    },
    {
      dockId: "dock-02",
      dockName: "Dock A2",
      status: "IN_PROGRESS",
      bookingCode: "Q-2026-0015",
      vendorName: "CV Mega Distribusi",
      remainingMinutes: -12,
      isOverdue: true,
      colorStatus: "red",
    },
    {
      dockId: "dock-03",
      dockName: "Dock A3",
      status: "IDLE",
      remainingMinutes: 0,
      isOverdue: false,
      colorStatus: "green",
    },
    {
      dockId: "dock-04",
      dockName: "Dock B1",
      status: "BLOCKED",
      remainingMinutes: 0,
      isOverdue: false,
      colorStatus: "red",
    },
    {
      dockId: "dock-05",
      dockName: "Dock B2",
      status: "IN_PROGRESS",
      bookingCode: "Q-2026-0016",
      vendorName: "PT Maju Bersama",
      estimatedFinishTime: "2026-01-17T15:15:00Z",
      remainingMinutes: 8,
      isOverdue: false,
      colorStatus: "yellow",
    },
    {
      dockId: "dock-06",
      dockName: "Dock B3",
      status: "COMPLETED",
      bookingCode: "Q-2026-0013",
      vendorName: "CV Sejahtera Abadi",
      remainingMinutes: 0,
      isOverdue: false,
      colorStatus: "green",
    },
  ],
  queueSnapshot: [
    {
      bookingId: "bk-001",
      code: "Q-2026-0018",
      vendorName: "PT Sinar Jaya",
      arrivalTime: "2026-01-17T13:20:00Z",
      estimatedFinishTime: "2026-01-17T14:05:00Z",
      status: "WAITING",
      priority: "NORMAL",
      isOverdue: false,
      waitingMinutes: 45,
    },
    {
      bookingId: "bk-002",
      code: "Q-2026-0019",
      vendorName: "CV Makmur Sejahtera",
      arrivalTime: "2026-01-17T12:45:00Z",
      estimatedFinishTime: "2026-01-17T13:30:00Z",
      status: "WAITING",
      priority: "HIGH",
      isOverdue: true,
      waitingMinutes: 85,
    },
    {
      bookingId: "bk-003",
      code: "Q-2026-0020",
      vendorName: "PT Logistik Nusantara",
      arrivalTime: "2026-01-17T14:00:00Z",
      estimatedFinishTime: "2026-01-17T14:45:00Z",
      status: "WAITING",
      priority: "NORMAL",
      isOverdue: false,
      waitingMinutes: 10,
    },
    {
      bookingId: "bk-004",
      code: "Q-2026-0021",
      vendorName: "CV Barokah Makmur",
      arrivalTime: "2026-01-17T13:45:00Z",
      estimatedFinishTime: "2026-01-17T14:30:00Z",
      status: "ASSIGNED",
      priority: "HIGH",
      isOverdue: false,
      waitingMinutes: 25,
    },
    {
      bookingId: "bk-005",
      code: "Q-2026-0022",
      vendorName: "PT Global Express",
      arrivalTime: "2026-01-17T14:15:00Z",
      estimatedFinishTime: "2026-01-17T15:00:00Z",
      status: "WAITING",
      priority: "LOW",
      isOverdue: false,
      waitingMinutes: 5,
    },
  ],
  kpiData: {
    queueLengthTimeline: [
      { time: "10:00", value: 12 },
      { time: "11:00", value: 18 },
      { time: "12:00", value: 25 },
      { time: "13:00", value: 19 },
      { time: "14:00", value: 16 },
    ],
    avgWaitingTime: [
      { time: "10:00", minutes: 35 },
      { time: "11:00", minutes: 40 },
      { time: "12:00", minutes: 55 },
      { time: "13:00", minutes: 48 },
      { time: "14:00", minutes: 42 },
    ],
    dockThroughput: [
      { dock: "Dock A1", completed: 12 },
      { dock: "Dock A2", completed: 9 },
      { dock: "Dock A3", completed: 14 },
      { dock: "Dock B1", completed: 7 },
      { dock: "Dock B2", completed: 11 },
      { dock: "Dock B3", completed: 13 },
    ],
  },
  busyTimeData: {
    currentBusyWindow: {
      from: "12:00",
      to: "15:00",
      affectedDocks: ["Dock A1", "Dock A2", "Dock A3"],
      intensity: "HIGH",
    },
    nextBusyWindow: {
      from: "17:00",
      to: "19:00",
      predictedIntensity: 75,
    },
  },
  alerts: [
    {
      id: "alert-01",
      type: "OVERDUE",
      severity: "HIGH",
      bookingCode: "Q-2026-0015",
      message: "Booking exceeded estimated finish time by 12 minutes",
      timestamp: "2026-01-17T13:40:00Z",
      acknowledged: false,
      actionRequired: true,
    },
    {
      id: "alert-02",
      type: "NO_SHOW",
      severity: "MEDIUM",
      bookingCode: "Q-2026-0017",
      message: "Driver has not arrived 30 minutes after scheduled time",
      timestamp: "2026-01-17T13:25:00Z",
      acknowledged: false,
      actionRequired: true,
    },
    {
      id: "alert-03",
      type: "DOCK_BLOCKED",
      severity: "MEDIUM",
      dockId: "dock-04",
      message: "Dock B1 blocked due to maintenance",
      timestamp: "2026-01-17T12:30:00Z",
      acknowledged: true,
      actionRequired: false,
    },
  ],
  filters: {
    searchQuery: "",
    selectedStatuses: [],
    selectedDocks: [],
    timeRange: {
      start: new Date().toISOString().split("T")[0] + "T00:00:00",
      end: new Date().toISOString(),
    },
    priorityFilter: "ALL",
  },
  selectedDock: null,
  selectedBooking: null,
  quickActionPanel: {
    reassignModalOpen: false,
    noteModalOpen: false,
    autoEfficiencyEnabled: true,
  },
  connection: {
    isConnected: true,
    lastMessageTime: new Date().toISOString(),
    error: null,
  },
};

const DashboardAdmin = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(
    initialDashboardState
  );
  const [lastUpdate, setLastUpdate] = useState<string>(
    new Date().toISOString()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format time helpers
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "HH:mm", { locale: id });
    } catch {
      return "Invalid time";
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: id,
      });
    } catch {
      return "Invalid date";
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setDashboardState((prev) => ({
        ...prev,
        summaryMetrics: {
          ...prev.summaryMetrics,
          lastUpdated: new Date().toISOString(),
        },
        connection: {
          ...prev.connection,
          lastMessageTime: new Date().toISOString(),
        },
      }));
      setLastUpdate(new Date().toISOString());
      setIsRefreshing(false);
    }, 1000);
  };

  // Mock WebSocket connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardState((prev) => ({
        ...prev,
        connection: {
          ...prev.connection,
          lastMessageTime: new Date().toISOString(),
        },
      }));
    }, 30000); // Update connection status every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Summary cards data
  const summaryCards = [
    {
      metric: "Total Bookings Today",
      value: dashboardState.summaryMetrics.totalBookingsToday,
      icon: <Package className="h-5 w-5" />,
      status: "normal" as const,
      trend: 12,
    },
    {
      metric: "Active Queue",
      value: dashboardState.summaryMetrics.activeQueue,
      icon: <Truck className="h-5 w-5" />,
      status:
        dashboardState.summaryMetrics.activeQueue > 20
          ? "warning"
          : ("normal" as const),
      trend: 5,
    },
    {
      metric: "Completed Today",
      value: dashboardState.summaryMetrics.completedToday,
      icon: <CheckCircle className="h-5 w-5" />,
      status: "normal" as const,
      trend: -3,
    },
    {
      metric: "Delayed Bookings",
      value: dashboardState.summaryMetrics.delayedBookings,
      icon: <AlertTriangle className="h-5 w-5" />,
      status:
        dashboardState.summaryMetrics.delayedBookings > 5
          ? "critical"
          : ("warning" as const),
      trend: 2,
    },
    {
      metric: "Avg Processing Time",
      value: `${dashboardState.summaryMetrics.avgProcessingMinutes}m`,
      icon: <Clock className="h-5 w-5" />,
      status:
        dashboardState.summaryMetrics.avgProcessingMinutes > 45
          ? "warning"
          : ("normal" as const),
      trend: -8,
    },
    {
      metric: "Dock Utilization",
      value: `${dashboardState.summaryMetrics.dockUtilizationPercent}%`,
      icon: <Building className="h-5 w-5" />,
      status:
        dashboardState.summaryMetrics.dockUtilizationPercent > 85
          ? "warning"
          : ("normal" as const),
      trend: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Warehouse Control Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Real-time dashboard for warehouse operations management
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            {dashboardState.connection.isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dashboardState.connection.isConnected
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              Last updated:{" "}
              {formatRelativeTime(dashboardState.summaryMetrics.lastUpdated)}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6">
        {/* <OperationalFilters
          filters={dashboardState.filters}
          onFilterChange={(newFilters) => {
            setDashboardState(prev => ({ ...prev, filters: { ...prev.filters, ...newFilters } }));
          }}
        /> */}
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {summaryCards.map((card, index) => (
          <SummaryCard
            key={index}
            metric={card.metric}
            value={card.value}
            status={card.status}
            trend={card.trend}
          />
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dock Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dock Status Overview
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {
                  dashboardState.dockStatuses.filter(
                    (d) => d.status === "IN_PROGRESS"
                  ).length
                }{" "}
                active
              </span>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardState.dockStatuses.map((dock) => (
                <DockStatusCard key={dock.dockId} dock={dock} />
              ))}
            </div>
          </div>
        </div>

        {/* Queue Snapshot */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Queue Snapshot
              </h2>
              <a
                href="/admin/live-queue"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                View full queue →
              </a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Next 5 bookings in queue
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Booking Code
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Arrival Time
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardState.queueSnapshot.map((booking) => (
                  <QueueTableRow key={booking.bookingId} booking={booking} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KPI Charts & Busy Time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* KPI Charts */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Real-time KPI Charts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last 4 hours performance
              </p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SparklineChart
                  data={dashboardState.kpiData.queueLengthTimeline}
                  title="Queue Length Trend"
                  color="blue"
                />
                <SparklineChart
                  data={dashboardState.kpiData.avgWaitingTime}
                  title="Avg Waiting Time"
                  color="orange"
                />
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Dock Throughput
                  </h3>
                  <div className="space-y-3">
                    {dashboardState.kpiData.dockThroughput.map(
                      (dock, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {dock.dock}
                          </span>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 dark:text-white mr-2">
                              {dock.completed}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              bookings
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert & Incident Panel */}
      <div className="mb-24">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Alerts & Incidents
                </h2>
                <span className="ml-3 px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                  {dashboardState.alerts.filter((a) => !a.acknowledged).length}{" "}
                  active
                </span>
              </div>
              <button
                onClick={() => {
                  setDashboardState((prev) => ({
                    ...prev,
                    alerts: prev.alerts.map((alert) => ({
                      ...alert,
                      acknowledged: true,
                    })),
                  }));
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Mark all as read
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {dashboardState.alerts.length > 0 ? (
                dashboardState.alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No active alerts
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Panel (Sticky Bottom) */}
      <QuickActionPanel
        isOpen={true}
        actions={dashboardState.quickActionPanel}
      />
    </div>
  );
};

export default DashboardAdmin;
