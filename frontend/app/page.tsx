"use client";

import { AuthApi } from "@/api/auth";
import { useUserInfo } from "@/components/UserContext";
import { UserInfo } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";
import {
  Building,
  Truck,
  Calendar,
  Clock,
  BarChart3,
  CheckCircle,
  PlayCircle,
  Package,
  Warehouse,
  CalendarClock,
  Car,
  UserCog,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { setUserInfo } = useUserInfo();
  const { data: userInfo } = useQuery({
    queryKey: ["user-info"],
    queryFn: async () => {
      {
        const res = await AuthApi.getUserInfo();
        setUserInfo(res);
        return res;
      }
    },
  });
  const stats = [
    {
      label: "Total Warehouse",
      value: "12",
      icon: Building,
      trend: "+2",
      description: "Gudang aktif",
    },
    {
      label: "Slot Aktif",
      value: "48",
      icon: Truck,
      trend: "85%",
      description: "Kapasitas tersedia",
    },
    {
      label: "Booking Hari Ini",
      value: "23",
      icon: Calendar,
      trend: "+5",
      description: "Kunjungan terjadwal",
    },
    {
      label: "Rata-rata Delay",
      value: "15m",
      icon: Clock,
      trend: "-3m",
      description: "Dari minggu lalu",
    },
  ];

  const features = [
    {
      title: "Booking Management",
      desc: "Atur jadwal kunjungan vendor dengan pemilihan warehouse dan slot",
      href: "/booking",
      icon: CalendarClock,
      color: "bg-blue-500",
    },
    {
      title: "Warehouse Setup",
      desc: "Kelola data gudang, kapasitas, dan informasi operasional",
      href: "/warehouse",
      icon: Warehouse,
      color: "bg-green-500",
    },
    {
      title: "Slot Management",
      desc: "Atur dock bongkar muat dan status ketersediaan slot",
      href: "/slots",
      icon: Package,
      color: "bg-purple-500",
    },
    {
      title: "Vehicle Setup",
      desc: "Daftar kendaraan vendor dengan estimasi waktu bongkar muat",
      href: "/vehicles",
      icon: Car,
      color: "bg-orange-500",
    },
    {
      title: "Queue Monitoring",
      desc: "Pantau antrian real-time dan estimasi waktu penyelesaian",
      href: "/queue",
      icon: BarChart3,
      color: "bg-red-500",
    },
    {
      title: "User Management",
      desc: "Kelola akses pengguna dan role berdasarkan kebutuhan",
      href: "/users",
      icon: UserCog,
      color: "bg-gray-500",
    },
  ];

  const queueData = [
    { warehouse: "Gudang Pusat", capacity: 75, status: "sibuk" },
    { warehouse: "Gudang Timur", capacity: 40, status: "normal" },
    { warehouse: "Gudang Barat", capacity: 90, status: "penuh" },
    { warehouse: "Gudang Utara", capacity: 25, status: "sepi" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-green-200 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm mb-6">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Catur Sukses Internasional
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Sistem Antrian Gudang & Manajemen
            <span className="block text-teal-200">Unload Muatan</span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Kelola antrian vendor, jadwal bongkar muat, dan slot gudang dengan
            sistem terintegrasi yang efisien
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={
                userInfo && userInfo?.description
                  ? "/admin/dashboard"
                  : "/vendor/booking"
              }
              onClick={() => {
                if (!userInfo) {
                  (
                    document.getElementById("login_modal") as HTMLDialogElement
                  ).showModal();
                }
              }}
              className="btn btn-lg bg-white text-blue-700 hover:bg-gray-100 border-0 font-semibold px-8 gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              {userInfo?.description ? "Lihat Dashboard Admin" : "Mulai Order"}
            </Link>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl ${
                      index === 0
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : index === 1
                        ? "bg-green-100 dark:bg-green-900/30"
                        : index === 2
                        ? "bg-purple-100 dark:bg-purple-900/30"
                        : "bg-orange-100 dark:bg-orange-900/30"
                    }`}
                  >
                    <stat.icon
                      className={`w-6 h-6 ${
                        index === 0
                          ? "text-blue-600 dark:text-blue-400"
                          : index === 1
                          ? "text-green-600 dark:text-green-400"
                          : index === 2
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      stat.trend.startsWith("+")
                        ? "text-green-600 dark:text-green-400"
                        : stat.trend.startsWith("-")
                        ? "text-red-600 dark:text-red-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="py-12 md:py-16 bg-green-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Modul Sistem Terintegrasi
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Akses semua fitur manajemen antrian dan operasional gudang dalam
              satu platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>

                <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                  <span>Akses modul</span>
                  <svg
                    className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Queue Summary */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Status Antrian Hari Ini
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Monitoring real-time kepadatan gudang
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Live Update</span>
              </div>
            </div>

            <div className="space-y-4">
              {queueData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.warehouse}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-1 max-w-md">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            item.status === "penuh"
                              ? "bg-red-500"
                              : item.status === "sibuk"
                              ? "bg-orange-500"
                              : item.status === "normal"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${item.capacity}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.capacity}%
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.status === "penuh"
                            ? "bg-red-500"
                            : item.status === "sibuk"
                            ? "bg-orange-500"
                            : item.status === "normal"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-teal-600 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Warehouse Queue System</p>
                <p className="text-sm text-gray-400">
                  PT Catur Sukses Internasional
                </p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} — Sistem Manajemen Antrian Vendor
                v2.1
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Terintegrasi & Teroptimasi untuk Operasional Logistik
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
