"use client";
import { DockApi } from "@/api/dock.api";
import { IDockBusyTime } from "@/types/busyTime.type";
import { Days, Recurring } from "@/types/shared.type";
import { MutateFunction, useQuery } from "@tanstack/react-query";
import { Calendar, Clock, FileText, MapPin, RotateCcw, X } from "lucide-react";
import React from "react";
import { Toaster } from "sonner";
import { useUserInfo } from "../UserContext";
import { IDock } from "@/types/dock.type";
import getDuration from "@/lib/getDuration";

interface BusyTimeProps {
  formData: IDockBusyTime;
  setFormData: React.Dispatch<React.SetStateAction<IDockBusyTime>>;
  onCreate: MutateFunction;
  onEdit: MutateFunction;
}

const BusyTimeFormModal = ({
  formData,
  onCreate,
  onEdit,
  setFormData,
}: BusyTimeProps) => {
  const { userInfo } = useUserInfo();

  const { data: docks } = useQuery({
    queryKey: ["docks"],
    queryFn: async () =>
      DockApi.getDocksByWarehouseId(userInfo?.homeWarehouse.id),
    enabled: !!userInfo?.homeWarehouse?.id,
  });

  const onSubmit = () => {
    if (formData.id) {
      onEdit();
    } else {
      onCreate();
    }
  };

  return (
    <dialog id="BusyTimeFormModal" className="modal">
      <div className="modal-box w-full max-w-xl p-0 overflow-hidden bg-white overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-white">
                Atur Waktu Tidak Tersedia
              </h3>
            </div>
            <button
              onClick={() =>
                (
                  document.getElementById(
                    "BusyTimeFormModal"
                  ) as HTMLDialogElement
                ).close()
              }
              className="btn btn-sm btn-circle btn-ghost hover:bg-white/20 text-white transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-7 px-8 py-6"
        >
          {/* Reason */}
          <div className="form-control">
            <label className="label py-2">
              <span className="label-text font-medium text-gray-800 text-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-teal-500" />
                Alasan
              </span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Istirahat Siang, Maintenance, Meeting, dll."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="input input-bordered w-full py-3 text-base bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-colors"
              required
            />
          </div>

          {/* Dock Selection */}
          <div className="form-control">
            <label className="label py-2">
              <span className="label-text font-medium text-gray-800 text-lg flex items-center gap-3">
                <MapPin className="w-5 h-5 text-teal-500" />
                Pilih Dock
              </span>
            </label>
            <select
              value={formData.dockId ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dockId: e.target.value,
                }))
              }
              className="select select-bordered w-full py-3 text-base bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-colors"
              required
            >
              <option value="" disabled className="text-gray-400">
                -- Pilih Dock --
              </option>
              {docks?.map((dock: IDock) => (
                <option value={dock.id} key={dock.id} className="py-2">
                  {dock.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="space-y-4">
            <label className="label py-2">
              <span className="label-text font-medium text-gray-800 text-lg flex items-center gap-3">
                <Clock className="w-5 h-5 text-teal-500" />
                Rentang Waktu
              </span>
            </label>
            <div className="grid grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">
                    Dari Jam
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.from}
                    onChange={(e) => {
                      setFormData({ ...formData, from: e.target.value });
                    }}
                    className="input input-bordered w-full py-3 text-base bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">
                    Sampai Jam
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.to}
                    onChange={(e) => {
                      setFormData({ ...formData, to: e.target.value });
                    }}
                    className="input input-bordered w-full py-3 text-base bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-colors"
                    required
                  />
                  {formData.from && formData.to && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded">
                        {getDuration(formData.from, formData.to)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Options */}
          <div className="space-y-4">
            <label className="label py-2">
              <span className="label-text font-medium text-gray-800 text-lg flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-teal-500" />
                Pengulangan
              </span>
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(Recurring).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.recurring === value
                      ? "bg-teal-50 border-teal-500 text-teal-700 shadow-sm"
                      : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="recurring"
                    value={value}
                    checked={formData.recurring === value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurring: e.target.value as Recurring,
                      })
                    }
                    className="radio radio-teal"
                  />
                  <span className="font-medium">
                    {key === "ONCE" && "Sekali"}
                    {key === "DAILY" && "Harian"}
                    {key === "WEEKLY" && "Mingguan"}
                    {key === "MONTHLY" && "Bulanan"}
                    {key === "CUSTOMDAY" && "Hari Tertentu"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Monthly Date */}
          {formData.recurring === Recurring.MONTHLY && (
            <div className="space-y-4">
              <label className="label py-2">
                <span className="label-text font-medium text-gray-800 text-lg flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  Tanggal dalam Bulan
                </span>
              </label>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Di Tanggal</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1"
                    value={formData.recurringStep}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurringStep: Number(e.target.value),
                      })
                    }
                    className="input input-bordered w-24 text-center py-2 text-lg font-medium bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                  <span className="text-gray-700 font-medium">tiap bulan</span>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Days */}
          {formData.recurring === Recurring.WEEKLY && (
            <div className="space-y-4">
              <label className="label py-2">
                <span className="label-text font-medium text-gray-800 text-lg flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  Hari dalam Minggu
                </span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(Days).map(([day, value]) => (
                  <label
                    key={day}
                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.recurringCustom.includes(value)
                        ? "bg-teal-50 border-teal-500 text-teal-700 shadow-sm"
                        : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-teal"
                      checked={formData.recurringCustom.includes(value)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          recurringCustom: e.target.checked
                            ? [...prev.recurringCustom, value]
                            : prev.recurringCustom.filter((d) => d !== value),
                        }))
                      }
                    />
                    <span className="text-sm font-medium">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="modal-action pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                (
                  document.getElementById(
                    "BusyTimeFormModal"
                  ) as HTMLDialogElement
                ).close()
              }
              className="btn btn-ghost text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-6 py-3 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn bg-gradient-to-r from-teal-500 to-teal-600 border-none text-white hover:from-teal-600 hover:to-teal-700 px-8 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              Simpan Waktu
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </dialog>
  );
};

export default BusyTimeFormModal;
