"use client";

import React, { useState } from "react";
import {
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  Building,
  Package,
  Wifi,
  WifiOff,
} from "lucide-react";
import { formatDistanceToNow, set } from "date-fns";
import { id } from "date-fns/locale";

// Components
import QueueTableRow from "@/components/admin/dashboard-component/QueueTableRow";
import SparklineChart from "@/components/admin/dashboard-component/SparklineChart";
import SummaryCard from "@/components/admin/dashboard-component/SummaryCard";
import { useQuery } from "@tanstack/react-query";
import { BookingApi } from "@/api/booking.api";
import { useUserInfo } from "@/components/UserContext";
import { ROLE } from "@/types/shared.type";
import DockStatusSection from "@/components/admin/dashboard-component/DockStatusSection";
import QueueDetailModal from "@/components/admin/QueueDetailModal";
import MyWarehouseActionModal from "@/components/admin/my-warehouse-action-modal";
import { toast } from "sonner";

// Types
export interface DashboardState {
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
    status: "IDLE" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
    bookingCode?: string;
    vendorName?: string;
    estimatedFinishTime?: string;
    remainingMinutes: number;
    isOverdue: boolean;
    colorStatus: "green" | "yellow" | "red";
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

const DashboardAdmin = () => {
  const { userInfo } = useUserInfo();
  const isAdmin =
    userInfo?.role == ROLE.USER_ORGANIZATION ||
    userInfo?.role == ROLE.ADMIN_ORGANIZATION ||
    userInfo?.role == ROLE.ADMIN_GUDANG;

  //main
  const { data: dashboardState, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => await BookingApi.adminWarehouseDashboard(),
    enabled: isAdmin,
  });

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

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

  // Summary cards data
  const summaryCards = [
    {
      metric: "Total Semua Booking",
      value: dashboardState?.summaryMetrics?.totalBookingsToday,
      icon: <Package className="h-5 w-5" />,
      status: "normal" as const,
    },
    {
      metric: "Booking Butuh Konfirmasi hari ini",
      value: dashboardState?.summaryMetrics?.pending,
      icon: <Package className="h-5 w-5" />,
      status: "normal" as const,
    },
    {
      metric: "Telah Datang",
      value: dashboardState?.summaryMetrics?.activeQueue,
      icon: <Truck className="h-5 w-5" />,
      status:
        dashboardState?.summaryMetrics.activeQueue > 20
          ? "warning"
          : ("normal" as const),
    },
    {
      metric: "Belum Juga Datang",
      value: dashboardState?.summaryMetrics.delayedBookings,
      icon: <AlertTriangle className="h-5 w-5" />,
      status:
        dashboardState?.summaryMetrics.delayedBookings > 5
          ? "critical"
          : ("warning" as const),
    },
    {
      metric: "Telah Selesai Hari ini",
      value: dashboardState?.summaryMetrics.completedToday,
      icon: <CheckCircle className="h-5 w-5" />,
      status: "normal" as const,
    },

    {
      metric: "Persentase Utilisasi Warehouse anda",
      value: `${dashboardState?.summaryMetrics.dockUtilizationPercent}%`,
      icon: <Building className="h-5 w-5" />,
      status:
        dashboardState?.summaryMetrics.dockUtilizationPercent > 85
          ? "warning"
          : ("normal" as const),
      tooltip: `Dock Utilization dihitung berdasarkan beban operasional tertinggi pada setiap dock, lalu dirata-ratakan ke seluruh dock.
Status aktif memiliki bobot berbeda (Unloading = 100%, In Progress = 80%, Finished/canceled = 0%)`,
    },
    {
      metric: "Waktu Rata-Rata UNLOADING",
      value: `${dashboardState?.summaryMetrics.avgProcessingMinutes}m`,
      icon: <Clock className="h-5 w-5" />,
      status:
        dashboardState?.summaryMetrics.avgProcessingMinutes > 45
          ? "warning"
          : ("normal" as const),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex container justify-center items-center w-full min-h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col   bg-gray-50 dark:bg-gray-900 p-4 md:p-6 overflow-y-auto max-h-96">
      <div role="alert" className="alert  alert-error w-full bg-red-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          Page ini sedang dalam pengembangan, beberapa belum disempurkan.
        </span>
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Today Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Real-time dashboard for warehouse operations management
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            {dashboardState?.connection.isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dashboardState?.connection.isConnected
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              Last updated:{" "}
              {formatRelativeTime(dashboardState?.summaryMetrics.lastUpdated)}
            </span>
          </div>
        </div>
      </div>
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
        {summaryCards?.map((card, index) => (
          <SummaryCard
            key={index}
            metric={card.metric}
            value={card.value}
            status={card.status}
            tooltip={card.tooltip}
          />
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Dock Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dock Status Overview
              </h2>
              <a
                href="/admin/queue"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Manage Today's Queue →
              </a>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {dashboardState?.dockStatuses?.map((statusData) => (
                <DockStatusSection dock={statusData} />
              ))}
            </div>
          </div>
        </div>

        {/* Queue Snapshot */}
        <div className="bg-white col-span-2 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Queue Snapshot
              </h2>
              <a
                href="/admin/my-warehouse"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                View All Queue Logs →
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
                    Gate
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Booking Code
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Plat
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Arrival Time
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actual Arrival
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardState?.queueSnapshot &&
                dashboardState.queueSnapshot.length > 0 ? (
                  dashboardState.queueSnapshot
                    .slice(0, 5)
                    .map((booking, index) => (
                      <QueueTableRow
                        key={booking.id || booking.code || index}
                        booking={booking}
                        onClick={() => {
                          setSelectedBookingId(booking.id);
                          (
                            document.getElementById(
                              "my-warehouse-action-modal"
                            ) as HTMLDialogElement
                          )?.showModal();
                        }}
                      />
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Belum ada antrian untuk hari ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* KPI Charts & Busy Time */}
      <div className="grid grid-cols-1 gap-6 mb-6">
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
                {dashboardState?.kpiData?.queueLengthTimeline && (
                  <SparklineChart
                    data={dashboardState?.kpiData?.queueLengthTimeline}
                    title="Queue Length Trend"
                    color="blue"
                  />
                )}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Dock Throughput
                  </h3>
                  <div className="space-y-3">
                    {dashboardState?.kpiData?.dockThroughput.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {item.dock}
                          </span>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 dark:text-white mr-2">
                              {item.completed}
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
      <QueueDetailModal
        selectedBookingId={selectedBookingId || ""}
        setSelectedBookingId={setSelectedBookingId}
        key={"QueueDetailModalCreate"}
        mode="create"
      />
      <MyWarehouseActionModal
        key={"MyWarehouseActionModal"}
        onModifyAndConfirm={() => toast.info("test")}
        selectedBooking={dashboardState?.queueSnapshot.find(
          (booking) => booking.id === selectedBookingId
        )}
      />
    </div>
  );
};

export default DashboardAdmin;
