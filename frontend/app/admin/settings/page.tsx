"use client";
import { WarehouseApi } from "@/api/warehouse.api";
import Loading from "@/components/shared-common/Loading";
import { WarehouseSetting } from "@/types/warehouse";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  LucideCalendarClock,
  MousePointerClick,
} from "lucide-react";
import React, { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";

const AdminSettings = () => {
  // State untuk form
  const [formData, setFormData] = useState<WarehouseSetting>({
    name: "",
    intervalMinimalQueueu: 0,
    delayTolerance: 0,
    isAutoEfficientActive: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  // Query untuk mengambil data setting
  const { data: settings, isLoading: isLoadingQuery } = useQuery({
    queryKey: ["settings"],
    queryFn: WarehouseApi.getSettings,
  });

  // Mutation untuk update data
  const { mutateAsync: updateWarehouseSetting } = useMutation({
    mutationKey: ["settings"],
    mutationFn: (updatedSettings: WarehouseSetting) =>
      WarehouseApi.updateSetting(updatedSettings),
    onSuccess: () => {
      toast.success("Pengaturan berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Gagal memperbarui setting",
      );
    },
  });

  // Update form data ketika data dari API berhasil diambil
  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        intervalMinimalQueueu: settings.intervalMinimalQueueu || 0,
        delayTolerance: settings.delayTolerance || 0,
        isAutoEfficientActive: settings.isAutoEfficientActive || false,
        maximumWeekSelection: settings.maximumWeekSelection || 3,
      });
    }
  }, [settings]);

  // Handler untuk perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : parseFloat(value) || 0,
    }));

    // Reset status save saat user mulai mengedit
    if (saveStatus.type) {
      setSaveStatus({ type: null, message: "" });
    }
  };

  // Handler untuk submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveStatus({ type: null, message: "" });

    try {
      // Siapkan data untuk dikirim
      const dataToSend: WarehouseSetting = {
        ...formData,
      };

      await updateWarehouseSetting(dataToSend).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      setSaveStatus({
        type: "error",
        message: "Gagal menyimpan pengaturan. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoadingQuery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-teal-700 font-medium">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 p-4 md:p-6">
        <div className="container mx-auto ">
          {/* Settings Form */}
          <form id="settings-form" onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-teal-100 ">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  Warehouse Settings
                </h2>
                <p className="text-teal-100 text-sm mt-1">
                  Konfigurasi dasar dan operasional gudang
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-8 max-h-[calc(100vh-300px)] overflow-auto">
                {/* Warehouse Name */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-teal-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-teal-900"
                      >
                        Nama Gudang
                      </label>
                      <p className="text-sm text-gray-500">
                        Nama resmi gudang yang akan ditampilkan di sistem
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 w-full px-4 py-3 border border-teal-200 rounded-lg bg-teal-50 font-bold ">
                    {formData.name}
                  </p>
                </div>

                <div className="border-t border-teal-100 pt-8 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Interval Minimal Queue */}
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-teal-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <label
                            htmlFor="intervalMinimalQueueu"
                            className="block text-sm font-semibold text-teal-900"
                          >
                            Interval Minimal Antrian (menit)
                          </label>
                          <p className="text-sm text-gray-500">
                            Waktu interval proses antrian
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          id="intervalMinimalQueueu"
                          name="intervalMinimalQueueu"
                          min="0"
                          step="1"
                          value={formData.intervalMinimalQueueu}
                          onChange={handleInputChange}
                          className="mt-2 w-full px-4 py-3 pl-12 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-teal-50/50"
                        />
                      </div>
                      <div className="text-xs text-teal-600 bg-teal-50 p-2 rounded">
                        <span className="font-medium">Penjelasan:</span>{" "}
                        Interval (menit) untuk menjaga jarak dengan booking
                        dengan status IN_PROGRESS sebelumnya, jika 0 maka auto
                        estimatedFinishTime dari book sebelumnya akan digunakan
                        sebagai book start (arrivalTime).
                      </div>
                    </div>

                    {/* Delay Tolerance */}
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-teal-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <label
                            htmlFor="delayTolerance"
                            className="block text-sm font-semibold text-teal-900"
                          >
                            Toleransi Keterlambatan (menit)
                          </label>
                          <p className="text-sm text-gray-500">
                            Batas toleransi waktu keterlambatan
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          id="delayTolerance"
                          name="delayTolerance"
                          min="0"
                          step="1"
                          value={formData.delayTolerance}
                          onChange={handleInputChange}
                          className="mt-2 w-full px-4 py-3 pl-12 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-teal-50/50"
                        />
                      </div>
                      <div className="text-xs text-teal-600 bg-teal-50 p-2 rounded">
                        <span className="font-medium">Penjelasan:</span> Jika
                        waktu telah tiba dan supir masih belum konfirmasi
                        kedatangan maka waktu book nya bisa diambil alih karena
                        telah dianggap kosong.
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Auto efficient Click */}
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center mr-3">
                          <MousePointerClick className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <label
                            htmlFor="intervalMinimalQueueu"
                            className="block text-sm font-semibold text-teal-900"
                          >
                            Auto efficient Click
                          </label>
                          <p className="text-sm text-gray-500">
                            Penjegahan waktu terbuang di awal hari
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="flex px-1 gap-x-4 items-center border border-dashed p-3 rounded-lg">
                          <input
                            type="checkbox"
                            id="isAutoEfficientActive"
                            name="isAutoEfficientActive"
                            checked={formData.isAutoEfficientActive}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                isAutoEfficientActive:
                                  !prev.isAutoEfficientActive,
                              }))
                            }
                            className="mr-2 rounded checkbox checkbox-teal-600 border "
                          />
                          <span>isAutoEfficientActive</span>
                        </div>
                      </div>
                      <div className="text-xs text-teal-600 bg-teal-50 p-2 rounded">
                        <span className="font-medium">Penjelasan:</span> Apakah
                        admin vendor dan admin gudang boleh memilih waktu
                        spesifik (false) atau auto smart berdasarkan ujung
                        booking terakhir atau ujung busy time atau awal dari
                        hari kerja (vacant time start).
                      </div>
                    </div>
                    {/* Auto efficient Click */}
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center mr-3">
                          <LucideCalendarClock className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <label
                            htmlFor="intervalMinimalQueueu"
                            className="block text-sm font-semibold text-teal-900"
                          >
                            Maximum Future Week Selection
                          </label>
                          <p className="text-sm text-gray-500">
                            Batas maksimal pilihan minggu kedepan
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          id="maximumWeekSelection"
                          name="maximumWeekSelection"
                          min="1"
                          step="1"
                          value={formData.maximumWeekSelection}
                          onChange={handleInputChange}
                          className="mt-2 w-full px-4 py-3 pl-12 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-teal-50/50"
                        />
                      </div>
                      <div className="text-xs text-teal-600 bg-teal-50 p-2 rounded">
                        <span className="font-medium">Penjelasan:</span> Batas
                        maksimal yang vendor bisa book dari minggu ini, contoh:
                        minggu ini (senin - minggu) ialah minggu 1, maka jika
                        nilai maximumWeekSelection adalah 1 maka hanya hari
                        senin ini dan minggu esok yang bisa.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-teal-100 pt-8">
                  <h3 className="text-lg font-semibold text-teal-900 mb-4">
                    Aksi Cepat
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          intervalMinimalQueueu: 5,
                          delayTolerance: 15,
                          isAutoEfficientActive: true,
                        });
                      }}
                      className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition duration-200 font-medium text-sm"
                    >
                      Setelan Standar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (settings) {
                          setFormData({
                            name: settings.name || "",
                            intervalMinimalQueueu:
                              settings.intervalMinimalQueueu || 0,
                            delayTolerance: settings.delayTolerance || 0,
                          });
                        }
                      }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-200 font-medium text-sm"
                    >
                      Reset Perubahan
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="bg-teal-50 px-6 py-4 border-t border-teal-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="text-sm text-teal-700 mb-3 md:mb-0">
                    <p className="font-medium">
                      Terakhir diperbarui:{" "}
                      {settings ? "Beberapa saat yang lalu" : "Belum pernah"}
                    </p>
                    <p>
                      Settingan Ini hanya berlaku untuk:{" "}
                      {settings?.name || "Belum tersedia"}
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Suspense>
  );
};

export default AdminSettings;
