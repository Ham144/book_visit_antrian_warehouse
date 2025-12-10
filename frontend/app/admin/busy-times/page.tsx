"use client";

import { useState } from "react";
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
        error?.response?.data.message || "Gagal menambahkan busy time"
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
        error?.response?.data.message || "Gagal memperbarui busy time"
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

  return (
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
                      "BusyTimeFormModal"
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

            {/* Busy Times List */}
            <div className="space-y-3">
              {busyTimes?.length > 0 ? (
                busyTimes.map((bt: IDockBusyTime) => (
                  <div
                    key={bt.id}
                    className="group bg-white rounded-xl border border-gray-200 hover:border-teal-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start md:items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-teal-100 to-green-100 rounded-lg">
                          <Clock className="text-teal-600" size={22} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">
                              {bt.reason}
                            </h3>
                            {bt.recurring && (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  bt.recurring === "DAILY"
                                    ? "bg-blue-100 text-blue-800"
                                    : bt.recurring === "WEEKLY"
                                    ? "bg-purple-100 text-purple-800"
                                    : bt.recurring === "MONTHLY"
                                    ? "bg-amber-100 text-amber-800"
                                    : bt.recurring === "ONCE"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-teal-100 text-teal-800"
                                }`}
                              >
                                {bt.recurring === "DAILY" && "Harian"}
                                {bt.recurring === "WEEKLY" && "Mingguan"}
                                {bt.recurring === "MONTHLY" && "Bulanan"}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            {/* Time Range */}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-800">
                                  {bt.from}
                                </span>
                                <span className="text-gray-400">-</span>
                                <span className="font-medium text-gray-800">
                                  {bt.to}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                ({getDuration(bt.from, bt.to)})
                              </span>
                            </div>

                            {/* Dock Info */}
                            {bt.dock && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-700 font-medium">
                                    Dock:
                                  </span>
                                  <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs">
                                    {bt.dock.name}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Recurring Info */}
                            {bt.recurring === Recurring.WEEKLY &&
                              bt.recurringCustom && (
                                <div className="flex items-start gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      Hari Tertentu:
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {bt.recurringCustom.map((day, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                        >
                                          {day}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setFormData(bt);
                            (
                              document.getElementById(
                                "BusyTimeFormModal"
                              ) as HTMLDialogElement
                            ).showModal();
                          }}
                          className="btn btn-sm btn-ghost text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Edit busy time"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBusyTimeId(bt.id);
                            (
                              document.getElementById(
                                "confirmation-delete"
                              ) as HTMLDialogElement
                            )?.showModal();
                          }}
                          className="btn btn-sm btn-ghost text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus busy time"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-8 h-8 text-teal-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Belum ada Busy Time
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tambahkan periode waktu tertentu yang tidak bisa digunakan
                      untuk booking, seperti maintenance, istirahat, atau acara
                      khusus.
                    </p>
                    <button
                      onClick={() => {
                        setFormData(initialBusyTime);
                        (
                          document.getElementById(
                            "BusyTimeFormModal"
                          ) as HTMLDialogElement
                        ).showModal();
                      }}
                      className="btn bg-gradient-to-r from-teal-500 to-green-500 border-none text-white hover:from-teal-600 hover:to-green-600 px-4"
                    >
                      <Plus size={18} className="mr-2" />
                      Tambah Busy Time Pertama
                    </button>
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
  );
}
