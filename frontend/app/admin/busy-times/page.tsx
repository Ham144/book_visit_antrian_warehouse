"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Clock, Calendar, Edit, MapPin } from "lucide-react";
import { toast } from "sonner";

import { IDockBusyTime } from "@/types/busyTime.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BusyTimeApi } from "@/api/busyTime.api";
import BusyTimeFormModal from "@/components/admin/BusyTimeFormModal";
import { Recurring } from "@/types/shared.type";
import { useUserInfo } from "@/components/UserContext";
import ConfirmationModal from "@/components/shared-common/confirmationModal";
import getDuration from "@/lib/getDuration";
import Loading from "@/components/shared-common/Loading";

export default function BusyTimesPage() {
  const { userInfo } = useUserInfo();
  const [selectedBusyTimeId, setSelectedBusyTimeId] = useState<
    string | undefined
  >();

  const initialBusyTime = {
    dockId: "",
    from: "12:00",
    to: "13:00",
    reason: "",
    recurring: Recurring.DAILY,
    recurringStep: 1,
    recurringCustom: [],
  };

  const [formData, setFormData] = useState<IDockBusyTime>(initialBusyTime);

  const qq = useQueryClient();
  const { data: busyTimes } = useQuery({
    queryKey: ["busy-times", userInfo?.homeWarehouse?.id],
    queryFn: async () => BusyTimeApi.getAll(userInfo.homeWarehouse.id),
    enabled: !!userInfo,
  });

  const { mutateAsync: handleCreateBusyTime } = useMutation({
    mutationKey: ["busy-times", "create"],
    mutationFn: async () => BusyTimeApi.create(formData),
    onSuccess: () => {
      (
        document.getElementById("BusyTimeFormModal") as HTMLDialogElement
      ).close();
      qq.invalidateQueries({
        queryKey: ["busy-times", userInfo.homeWarehouse.id],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data.message || "Gagal menambahkan busy time",
      );
    },
  });

  const { mutateAsync: handleUpdateBusyTime } = useMutation({
    mutationKey: ["busy-times", "update"],
    mutationFn: async () => BusyTimeApi.update(formData?.id, formData),
    onSuccess: () => {
      (
        document.getElementById("BusyTimeFormModal") as HTMLDialogElement
      ).close();
      qq.invalidateQueries({
        queryKey: ["busy-times", userInfo.homeWarehouse.id],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data.message || "Gagal memperbarui busy time",
      );
    },
  });

  const { mutateAsync: handleDelete } = useMutation({
    mutationKey: ["busy-times", "delete"],
    mutationFn: async () => BusyTimeApi.remove(selectedBusyTimeId),
    onSuccess: () => {
      toast.success("Busy time berhasil dihapus");
      qq.invalidateQueries({
        queryKey: ["busy-times", userInfo.homeWarehouse.id],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data.message || "Gagal menghapus busy time");
    },
  });

  const [selectedDock, setSelectedDock] = useState<string | "all">("all");
  const docksFilter = useMemo(() => {
    const set = new Set<string>();

    busyTimes?.forEach((bt: IDockBusyTime) => {
      set.add(bt.dock.name);
    });

    return Array.from(set);
  }, [busyTimes]);

  const filtered = useMemo(() => {
    if (!busyTimes) return [];
    if (selectedDock === "all") {
      return busyTimes;
    }
    return busyTimes.filter(
      (bt: IDockBusyTime) => bt.dock?.name === selectedDock,
    );
  }, [busyTimes, selectedDock]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex">
          <main className="flex-1 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    Busy Time Management
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Kelola periode waktu yang tidak tersedia untuk booking
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormData(initialBusyTime);
                    (
                      document.getElementById(
                        "BusyTimeFormModal",
                      ) as HTMLDialogElement
                    ).showModal();
                  }}
                  className="btn bg-gradient-to-r from-teal-500 to-green-500 border-none text-white hover:from-teal-600 hover:to-green-600 shadow-lg hover:shadow-xl transition-all duration-300 px-4"
                >
                  <Plus size={20} className="md:mr-2" />
                  <span className="hidden md:inline">Tambah Busy Time</span>
                  <span className="md:hidden">Tambah</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedDock("all");
                }}
                key={"all"}
                className={`btn ${
                  selectedDock == "all"
                    ? "btn btn-active bg-primary text-white"
                    : ""
                }`}
              >
                Semua
              </button>
              {docksFilter?.length &&
                docksFilter?.map((dockName: string) => (
                  <button
                    onClick={() => {
                      setSelectedDock(dockName);
                    }}
                    key={dockName}
                    className={`btn ${
                      selectedDock == dockName
                        ? "btn btn-active bg-primary text-white"
                        : ""
                    }`}
                  >
                    {dockName}
                  </button>
                ))}

              {/* Busy Times List */}
              <div className="space-y-3 max-h-[80vh] overflow-y-auto">
                {busyTimes?.length > 0 ? (
                  // Gunakan useMemo untuk filtering
                  (() => {
                    // Periksa jika filtered kosong
                    if (filtered.length === 0) {
                      return (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
                          <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <Clock className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              Tidak ada Busy Time untuk dock ini
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Tidak ditemukan busy time untuk dock yang dipilih.
                              Coba pilih dock lain atau tambahkan busy time
                              baru.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return filtered.map((bt: IDockBusyTime) => (
                      <div
                        key={bt.id}
                        className="group bg-white rounded-xl border border-gray-200 hover:border-teal-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start md:items-center gap-4">
                            <div
                              className={`p-3 rounded-lg ${
                                bt.recurring === "DAILY"
                                  ? "bg-blue-50 text-blue-600"
                                  : bt.recurring === "WEEKLY"
                                    ? "bg-purple-50 text-purple-600"
                                    : bt.recurring === "MONTHLY"
                                      ? "bg-amber-50 text-amber-600"
                                      : "bg-teal-50 text-teal-600"
                              }`}
                            >
                              <Clock className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-bold text-gray-900 truncate">
                                  {bt.reason}
                                </h3>
                                {bt.recurring && (
                                  <span
                                    className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                      bt.recurring === "DAILY"
                                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                                        : bt.recurring === "WEEKLY"
                                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                                          : bt.recurring === "MONTHLY"
                                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                                            : bt.recurring === "ONCE"
                                              ? "bg-gray-100 text-gray-800 border border-gray-200"
                                              : "bg-teal-100 text-teal-800 border border-teal-200"
                                    }`}
                                  >
                                    {bt.recurring === "DAILY" && "🔄 Harian"}
                                    {bt.recurring === "WEEKLY" && "📅 Mingguan"}
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2.5 text-sm text-gray-600">
                                {/* Time Range */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium text-gray-800">
                                        {bt.from}
                                      </span>
                                      <span className="text-gray-400 mx-1">
                                        →
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {bt.to}
                                      </span>
                                    </div>
                                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                      {getDuration(bt.from, bt.to)}
                                    </span>
                                  </div>
                                </div>

                                {/* Dock Info */}
                                {bt.dock && (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-lg">
                                      <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                      <div className="flex items-center gap-2">
                                        <span className="text-teal-700 font-medium">
                                          Dock:
                                        </span>
                                        <span className="font-semibold text-teal-800">
                                          {bt.dock.name}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Recurring Info - Weekly */}
                                {bt.recurring === "WEEKLY" &&
                                  bt.recurringCustom &&
                                  bt.recurringCustom.length > 0 && (
                                    <div className="bg-purple-50 rounded-lg p-3">
                                      <div className="flex items-start gap-2">
                                        <Calendar className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <div className="text-xs font-medium text-purple-700 mb-1.5">
                                            Hari Tertentu:
                                          </div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {bt.recurringCustom.map(
                                              (day, idx) => (
                                                <span
                                                  key={idx}
                                                  className="inline-flex items-center px-2.5 py-1 bg-white border border-purple-200 text-purple-700 rounded-md text-xs font-medium shadow-sm"
                                                >
                                                  {day}
                                                </span>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-start md:self-center">
                            <button
                              onClick={() => {
                                setFormData(bt);
                                const modal = document.getElementById(
                                  "BusyTimeFormModal",
                                ) as HTMLDialogElement;
                                if (modal) modal.showModal();
                              }}
                              className="btn btn-sm btn-outline border-gray-300 text-gray-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200"
                              title="Edit busy time"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="hidden sm:inline ml-1">
                                Edit
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBusyTimeId(bt.id);
                                const modal = document.getElementById(
                                  "confirmation-delete",
                                ) as HTMLDialogElement;
                                if (modal) modal.showModal();
                              }}
                              className="btn btn-sm btn-outline border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                              title="Hapus busy time"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline ml-1">
                                Hapus
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  // Empty State
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center shadow-sm">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center shadow-inner">
                        <Clock className="w-10 h-10 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        Belum ada Busy Time
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Tambahkan periode waktu tertentu yang tidak bisa
                        digunakan untuk booking, seperti maintenance, istirahat,
                        atau acara khusus. Ini akan membantu mengelola
                        ketersediaan dock dengan lebih baik.
                      </p>
                      <button
                        onClick={() => {
                          setFormData(initialBusyTime);
                          const modal = document.getElementById(
                            "BusyTimeFormModal",
                          ) as HTMLDialogElement;
                          if (modal) modal.showModal();
                        }}
                        className="btn bg-gradient-to-r from-teal-500 to-green-500 border-0 text-white hover:from-teal-600 hover:to-green-600 shadow-md hover:shadow-lg px-6 py-3 transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        <span className="font-semibold">
                          Tambah Busy Time Pertama
                        </span>
                      </button>

                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          💡 <span className="font-medium">Tips:</span> Gunakan
                          recurring untuk jadwal rutin seperti maintenance
                          harian/mingguan
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
        <BusyTimeFormModal
          key={"BusyTimeFormModal"}
          formData={formData}
          onCreate={handleCreateBusyTime}
          onEdit={handleUpdateBusyTime}
          setFormData={setFormData}
        />
        <ConfirmationModal
          key={"confirmation1"}
          message="Apakah anda Yakin ingin Menghapus Busy Time?"
          onConfirm={() => handleDelete()}
          title="Apakah anda Yakin ingin Menghapus"
          modalId="confirmation-delete"
        />
      </div>
    </Suspense>
  );
}
