"use client";
import { BookOpen, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BookingApi } from "@/api/booking.api";

export default function VendorDashboard() {
  const { data: upcomingBookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => await BookingApi.getUpcomingBookings(),
  });

  const totalBookings = 0;
  const completedBookings = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pemesanan Mendatang</p>
                  <p className="text-3xl font-bold">{upcomingBookings}</p>
                </div>
                <BookOpen size={32} className="opacity-75" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Pemesanan</p>
                  <p className="text-3xl font-bold">{totalBookings}</p>
                </div>
                <BarChart3 size={32} className="opacity-75" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pemesanan Selesai</p>
                  <p className="text-3xl font-bold">{completedBookings}</p>
                </div>
                <BarChart3 size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
