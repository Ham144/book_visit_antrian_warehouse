"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { IDockBusyTime } from "@/types/busyTime.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BusyTimeApi } from "@/api/busyTime.api";
import BusyTimeFormModal from "@/components/admin/BusyTimeFormModal";
import { Recurring } from "@/types/shared.type";
import { useUserInfo } from "@/components/UserContext";

export default function BusyTimesPage() {
  const { userInfo } = useUserInfo();

  const [formData, setFormData] = useState<IDockBusyTime>({
    dockId: "",
    from: new Date(1970, 1, 1, 11, 0, 0),
    to: new Date(new Date().setHours(23, 59, 59, 999)),
    reason: "",
    recurring: Recurring.DAILY,
    recurringStep: 0,
    recurringCustom: [],
  });

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
    mutationFn: async (id: string) => BusyTimeApi.remove(id),
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between mb-2 items-center">
              <h1 className="md:text-3xl font-bold">Busy time Management</h1>{" "}
              <button
                onClick={() => {
                  (
                    document.getElementById(
                      "BusyTimeFormModal"
                    ) as HTMLDialogElement
                  ).showModal();
                }}
                className="btn btn-primary md:px-4 px-2"
              >
                <Plus size={20} />{" "}
                <span className="hidden md:inline">Add Busy Time</span>
              </button>
            </div>

            <div className="space-y-2">
              {busyTimes?.length > 0 &&
                busyTimes.map((bt: IDockBusyTime) => (
                  <div key={bt.id} className="card bg-white shadow">
                    <div className="card-body p-4 flex flex-row justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-orange-600" size={24} />
                        <div>
                          <p className="font-bold">{bt.reason}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(bt.from).toLocaleString()} -{" "}
                            {new Date(bt.to).toLocaleString()}{" "}
                            {bt.recurring && "(Daily)"}
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleDelete(bt.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
