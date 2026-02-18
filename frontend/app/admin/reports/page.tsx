"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
DateRangePicker;
import { subDays } from "date-fns";
import DateRangePicker from "@/components/shared-common/DateRangePicker";
import { toast } from "sonner";
import { BookingApi } from "@/api/booking.api";
import Loading from "@/components/shared-common/Loading";

// Types
interface ReportsData {
  onTimeDeliveryRate: number;
  averageUnloadTime: number;
  noShows: number;
  totalBooking: number;
  dockPerformances: Array<{
    id: string;
    name: string;
    totalBooking: number;
    onTimeDeliveryRate: number;
    averageUnloadTime: number;
    noShows: number;
    canceled: number;
  }>;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface TrendInfo {
  value: string;
  direction: "up" | "down" | "stable";
  percentage: number;
  isPositive: boolean;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState<ReportsData | null>(null);
  const [previousData, setPreviousData] = useState<ReportsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 6), // 7 hari terakhir termasuk hari ini
    endDate: new Date(),
  });

  // Fetch data untuk periode tertentu
  const fetchReportsData = async (
    start: Date,
    end: Date,
  ): Promise<ReportsData> => {
    try {
      const data = await BookingApi.adminWarehouseReports({
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      });
      return data;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      throw error;
    }
  };

  // Hitung periode sebelumnya berdasarkan periode saat ini
  const getPreviousPeriod = useCallback((start: Date, end: Date): DateRange => {
    const durationMs = end.getTime() - start.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);

    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - durationDays + 1);

    return { startDate: previousStart, endDate: previousEnd };
  }, []);

  // Fetch data untuk periode saat ini dan sebelumnya
  const fetchReports = async () => {
    try {
      setLoading(true);

      const previousPeriod = getPreviousPeriod(
        dateRange.startDate,
        dateRange.endDate,
      );

      // Fetch data secara paralel
      const [currentResult, previousResult] = await Promise.all([
        fetchReportsData(dateRange.startDate, dateRange.endDate),
        fetchReportsData(previousPeriod.startDate, previousPeriod.endDate),
      ]);

      setCurrentData(currentResult);
      setPreviousData(previousResult);
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  // Hitung trend dari data current vs previous
  const calculateTrend = (current: number, previous: number): TrendInfo => {
    if (previous === 0) {
      return {
        value: current > 0 ? "New" : "No change",
        direction: current > 0 ? "up" : "stable",
        percentage: current > 0 ? 100 : 0,
        isPositive: current > 0,
      };
    }

    const percentage = ((current - previous) / previous) * 100;
    const direction = percentage >= 0 ? "up" : "down";

    // Tentukan apakah trend positif berdasarkan metrik
    let isPositive = percentage >= 0;

    // Untuk averageUnloadTime: angka lebih kecil = lebih baik
    // Untuk noShows: angka lebih kecil = lebih baik
    // Logika ini akan dihandle di keyMetrics

    return {
      value: `${Math.abs(percentage).toFixed(1)}%`,
      direction,
      percentage: Math.abs(percentage),
      isPositive,
    };
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleExport = (format: "csv" | "pdf") => {
    toast.success(`Export ${format.toUpperCase()} feature coming soon`);
  };

  // Prepare key metrics dengan trend
  const keyMetrics = currentData
    ? [
        {
          metric: "Total Bookings",
          value: currentData.totalBooking.toString(),
          trend: previousData
            ? calculateTrend(
                currentData.totalBooking,
                previousData.totalBooking,
              )
            : {
                value: "No data",
                direction: "stable",
                percentage: 0,
                isPositive: true,
              },
          period: "vs last period",
        },
        {
          metric: "On-Time Delivery Rate",
          value: `${currentData.onTimeDeliveryRate.toFixed(1)}%`,
          trend: previousData
            ? calculateTrend(
                currentData.onTimeDeliveryRate,
                previousData.onTimeDeliveryRate,
              )
            : {
                value: "No data",
                direction: "stable",
                percentage: 0,
                isPositive: true,
              },
          period: "vs last period",
        },
        {
          metric: "Avg Unload Time",
          value: `${currentData.averageUnloadTime.toFixed(1)} min`,
          trend: previousData
            ? calculateTrend(
                currentData.averageUnloadTime,
                previousData.averageUnloadTime,
              )
            : {
                value: "No data",
                direction: "stable",
                percentage: 0,
                isPositive: true,
              },
          period: "vs last period",
        },
        {
          metric: "No Shows (Tidak Datang)",
          value: currentData.noShows.toString(),
          trend: previousData
            ? calculateTrend(currentData.noShows, previousData.noShows)
            : {
                value: "No data",
                direction: "stable",
                percentage: 0,
                isPositive: true,
              },
          period: "vs last period",
        },
      ]
    : [];

  // Adjust trend positivity berdasarkan metrik
  const adjustedKeyMetrics = keyMetrics.map((metric) => {
    let isPositiveTrend = metric.trend.isPositive;

    // Untuk Avg Unload Time: trend naik (angka lebih besar) = buruk
    if (metric.metric === "Avg Unload Time") {
      isPositiveTrend = !isPositiveTrend;
    }

    // Untuk No Shows: trend naik (angka lebih besar) = buruk
    if (metric.metric === "No Shows") {
      isPositiveTrend = !isPositiveTrend;
    }

    return {
      ...metric,
      trend: {
        ...metric.trend,
        isPositive: isPositiveTrend,
      },
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header with Date Picker */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="font-bold ">
                  <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                  <p className="text-gray-600">
                    {dateRange.startDate.toLocaleDateString()} -{" "}
                    {dateRange.endDate.toLocaleDateString()}
                    {previousData &&
                      ` (Compared to previous ${Math.ceil(
                        (dateRange.endDate.getTime() -
                          dateRange.startDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                      )} days)`}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <DateRangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    className="bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport("csv")}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
                      disabled
                    >
                      <Download size={20} /> CSV
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition-colors flex items-center gap-2"
                      disabled
                    >
                      <Download size={20} /> PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {adjustedKeyMetrics.map((metric, i) => (
                  <div
                    key={i}
                    className="card bg-white shadow hover:shadow-md transition-shadow"
                  >
                    <div className="card-body p-6">
                      <p className="text-gray-600 text-sm font-medium">
                        {metric.metric}
                      </p>
                      <p className="text-3xl font-bold mt-2 text-gray-900">
                        {metric.value}
                      </p>
                      <div className="flex justify-between items-center mt-4 text-sm">
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            metric.trend.direction === "stable"
                              ? "text-gray-600"
                              : metric.trend.isPositive
                                ? "text-green-600"
                                : "text-red-600"
                          }`}
                        >
                          {metric.trend.direction === "up" ? (
                            <TrendingUp size={16} />
                          ) : metric.trend.direction === "down" ? (
                            <TrendingDown size={16} />
                          ) : null}
                          {metric.trend.value}
                        </span>
                        <span className="text-gray-500">{metric.period}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dock Performance Table */}
              {currentData?.dockPerformances &&
              currentData.dockPerformances.length > 0 ? (
                <div className="card bg-white shadow">
                  <div className="card-body p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">
                      Dock Performance
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-left font-semibold text-gray-700">
                              Dock
                            </th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-700">
                              Bookings
                            </th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-700">
                              Avg Unload Time
                            </th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-700">
                              On-Time Rate
                            </th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-700">
                              Canceled
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentData.dockPerformances.map((dock) => (
                            <tr
                              key={dock.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 px-4 font-semibold text-gray-900">
                                {dock.name}
                              </td>
                              <td className="py-3 px-4 text-gray-700">
                                {dock.totalBooking}
                              </td>
                              <td className="py-3 px-4 text-gray-700">
                                {dock.averageUnloadTime.toFixed(1)} min
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    dock.onTimeDeliveryRate >= 90
                                      ? "bg-green-100 text-green-800"
                                      : dock.onTimeDeliveryRate >= 80
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {dock.onTimeDeliveryRate.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-700">
                                {dock.canceled}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card bg-white shadow">
                  <div className="card-body p-6">
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No dock performance data available for the selected
                        period.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  );
}
