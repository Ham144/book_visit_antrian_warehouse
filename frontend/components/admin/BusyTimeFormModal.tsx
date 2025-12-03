"use client";
import { DockApi } from "@/api/dock.api";
import { IDockBusyTime } from "@/types/busyTime.type";
import { Days, Recurring } from "@/types/shared.type";
import { MutateFunction, useQuery } from "@tanstack/react-query";
import { Calendar, Clock, RotateCcw, X } from "lucide-react";
import React from "react";
import { Toaster } from "sonner";
import { useUserInfo } from "../UserContext";
import { IDock } from "@/types/dock.type";

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
    queryFn: async () => DockApi.getAllDocks(userInfo?.homeWarehouse?.id),
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
      <div className="modal-box w-full max-w-md p-0 overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-teal-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-white" />
              <h3 className="font-bold text-lg text-white">
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
              className="btn btn-sm btn-circle btn-ghost hover:bg-teal-600 text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6 px-6 py-4"
        >
          {/* Reason */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-gray-700">
                Alasan
              </span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Istirahat Siang, Maintenance, dll."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="input input-bordered w-full bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-gray-700">
                Pilih Dock Warehouse
              </span>
            </label>
            <select
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dockId: e.target.value,
                }))
              }
              className="select select-bordered w-full "
            >
              <option value="" key={"empty"} disabled>
                -- Pilih Dock --
              </option>
              {docks?.length > 0 &&
                docks.map((dock: IDock) => (
                  <option value={dock.id} key={dock.id}>
                    {dock.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">
                  Dari Jam
                </span>
              </label>
              <input
                type="time"
                value={
                  formData.from
                    ? new Date(formData.from).toTimeString().slice(0, 5)
                    : ""
                }
                onChange={(e) => {
                  const [hour, minute] = e.target.value.split(":");
                  const d = new Date();
                  d.setHours(Number(hour), Number(minute), 0, 0);
                  setFormData({ ...formData, from: d });
                }}
                className="input input-bordered w-full bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">
                  Sampai Jam
                </span>
              </label>
              <input
                type="time"
                value={
                  formData.to
                    ? new Date(formData.to).toTimeString().slice(0, 5)
                    : ""
                }
                onChange={(e) => {
                  const [hour, minute] = e.target.value.split(":");
                  const d = new Date();
                  d.setHours(Number(hour), Number(minute), 0, 0);
                  setFormData({ ...formData, to: d });
                }}
                className="input input-bordered w-full bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>
          </div>

          {/* Recurring Options */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-teal-500" />
                Pengulangan
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              {Object.entries(Recurring).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer"
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
                  <span className="text-sm text-gray-700">
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

          {/* Custom Days Selection */}
          {formData.recurring === Recurring.CUSTOMDAY && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  Pilih Hari
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(Days).map(([day, value]) => (
                  <label
                    key={day}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.recurringCustom.includes(value)
                        ? "bg-teal-50 border-teal-500 text-teal-700"
                        : "border-gray-300 hover:border-teal-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-teal"
                      checked={formData.recurringCustom.includes(value)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          recurringCustom: checked
                            ? [...prev.recurringCustom, value]
                            : prev.recurringCustom.filter((d) => d !== value),
                        }));
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Interval Input for Recurring */}
          {formData.recurring !== Recurring.DAILY &&
            formData.recurring !== Recurring.CUSTOMDAY && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">
                    Interval Pengulangan
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 whitespace-nowrap">
                    Setiap
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.recurringStep || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurringStep: Number(e.target.value),
                      })
                    }
                    className="input  input-bordered border w-20 bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                  <span className="text-gray-600 whitespace-nowrap">
                    {formData.recurring === (Recurring.DAILY as any) && "hari"}
                    {formData.recurring === Recurring.WEEKLY && "minggu"}
                    {formData.recurring === Recurring.MONTHLY && "bulan"}
                  </span>
                </div>
              </div>
            )}

          {/* Actions */}
          <div className="modal-action pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                (
                  document.getElementById(
                    "BusyTimeFormModal"
                  ) as HTMLDialogElement
                ).close()
              }
              className="btn px-3 btn-ghost text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn px-4 bg-teal-500 border-teal-500 text-white hover:bg-teal-600 hover:border-teal-600"
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
