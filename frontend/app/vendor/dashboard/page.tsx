"use client";

import Link from "next/link";
import { BookOpen, BarChart3, Calendar, History, Truck } from "lucide-react";
import { mockBookings } from "@/lib/mock-data";

export default function VendorDashboard() {
  const upcomingBookings = mockBookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  ).length;
  const completedBookings = mockBookings.filter(
    (b) => b.status === "completed"
  ).length;
  const totalBookings = mockBookings.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Vendor</h1>
          <p className="text-gray-600">Kelola pemesanan dan kendaraan Anda</p>
        </div>

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

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/vendor/booking"
            className="card bg-white shadow-md hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Buat Pemesanan</h3>
                  <p className="text-sm text-gray-600">
                    Pesan kunjungan ke gudang
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/vendor/history"
            className="card bg-white shadow-md hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <History className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Riwayat Pemesanan</h3>
                  <p className="text-sm text-gray-600">
                    Lihat semua pemesanan Anda
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/vendor/vehicles"
            className="card bg-white shadow-md hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Truck className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Kelola Kendaraan</h3>
                  <p className="text-sm text-gray-600">
                    Tambah atau edit kendaraan
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
