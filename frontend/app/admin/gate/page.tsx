"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import DockFormModal from "@/components/admin/DockFormModal";
import { IDock } from "@/types/dock.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DockApi } from "@/api/dock.api";
import { useUserInfo } from "@/components/UserContext";
import { Days } from "@/types/shared.type";
import ConfirmationModal from "@/components/shared-common/confirmationModal";
import { Vacant } from "@/types/vacant.type";

export default function GatesPage() {
  const queryClient = useQueryClient();
  const [selectedDockId, setSelectedDockId] = useState<string | null>(null);
  const { userInfo } = useUserInfo();
  const initialDock: IDock = {
    name: "",
    warehouseId: userInfo?.homeWarehouse?.id,
    warehouse: userInfo?.homeWarehouse,
    photos: [],
    allowedTypes: [],
    vacants: ((): Vacant[] => {
      const days = Object.values(Days);
      return days.map((day) => {
        if (day == "MINGGU") {
          return {
            day: day,
            availableFrom: null,
            availableUntil: null,
          };
        } else {
          return {
            day,
            availableFrom: "08:00",
            availableUntil: "15:50",
          };
        }
      });
    })(),
    isActive: true,
    priority: undefined,
    busyTimes: [],
  };
  const [formData, setFormData] = useState<IDock>(initialDock);

  const formatDockData = (data: IDock): IDock => {
    return {
      ...data,
      photos: data.photos || [],
      allowedTypes: data.allowedTypes || [],
      priority: data.priority ? Number(data.priority) : undefined,
      isActive: data.isActive ?? true,
    };
  };

  const { mutateAsync: handleCreate } = useMutation({
    mutationKey: ["docks"],
    mutationFn: async () => {
      const { warehouse, ...createData } = formatDockData(formData!);
      return await DockApi.registerDock(createData);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal membuat dock baru");
    },
    onSuccess: () => {
      toast.success("Dock berhasil dibuat");
      setFormData(initialDock);
      queryClient.invalidateQueries({ queryKey: ["docks"] });
      setFormData(undefined);
      (document.getElementById("DockFormModal") as HTMLDialogElement).close();
    },
  });

  const { mutateAsync: handleUpdate } = useMutation({
    mutationKey: ["docks"],
    mutationFn: async () => {
      const { id } = formData;
      return DockApi.updateDock(id!, formData);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memperbarui dock");
    },
    onSuccess: () => {
      toast.success("Dock berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["docks"] });
      setFormData(undefined);
      (document.getElementById("DockFormModal") as HTMLDialogElement).close();
      setFormData(initialDock);
    },
  });

  const { data: docks } = useQuery({
    queryKey: ["docks", userInfo],
    queryFn: async () =>
      await DockApi.getDocksByWarehouseId(userInfo?.homeWarehouse?.id),
    enabled: !!userInfo?.homeWarehouse?.id,
  });

  const { mutateAsync: handleDelete } = useMutation({
    mutationKey: ["docks"],
    mutationFn: async (dockId: string) => await DockApi.deleteDock(dockId),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menghapus dock");
    },
    onSuccess: () => {
      toast.success("Dock berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["docks"] });
    },
  });

  const handleSelectToEdit = (dock: IDock) => {
    setFormData(dock);
    (document.getElementById("DockFormModal") as HTMLDialogElement).showModal();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex justify-between mb-2 items-center">
                <h1 className="text-3xl font-bold">Gate Management</h1>
                <button
                  onClick={() => {
                    setFormData(initialDock);
                    (
                      document.getElementById(
                        "DockFormModal",
                      ) as HTMLDialogElement
                    ).showModal();
                  }}
                  className="btn px-4 btn-primary"
                >
                  <Plus size={20} /> New Gate
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-leaf-green-50 border-b border-leaf-green-100">
                        <th className="font-semibold text-gray-700 py-4 px-4">
                          Nama Gate
                        </th>
                        <th className="font-semibold text-gray-700 py-4 px-4">
                          Allow Types
                        </th>
                        <th className="font-semibold text-gray-700 py-4 px-4">
                          Prioritas
                        </th>
                        <th className="font-semibold text-gray-700 py-4 px-4">
                          Status
                        </th>
                        <th className="font-semibold text-gray-700 py-4 px-4">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {docks?.length > 0 ? (
                        docks?.map((dock: IDock, index: number) => (
                          <tr
                            key={index}
                            className={`hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? "bg-gray-25" : "bg-white"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-leaf-green-500 flex-shrink-0" />
                                <span className="font-semibold text-gray-800">
                                  {dock.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {dock?.allowedTypes &&
                              dock.allowedTypes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {dock.allowedTypes.map((type, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {dock?.allowedTypes && dock.priority > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {Array.from({ length: dock.priority }).map(
                                    (_, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                      >
                                        <Star className="w-4 h-4 text-leaf-green-500 flex-shrink-0" />
                                      </span>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 ">
                              <span
                                className={`inline-flex  items-start text-start px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  dock.isActive
                                    ? "bg-leaf-green-100 text-leaf-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {dock.isActive ? "Aktif" : "Tidak Aktif"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    handleSelectToEdit(dock);
                                  }}
                                  className="btn btn-sm btn-ghost hover:bg-leaf-green-50 hover:text-leaf-green-600 text-gray-500 transition-colors"
                                  title="Edit dock"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={async () => {
                                    setSelectedDockId(dock.id);
                                    (
                                      document.getElementById(
                                        "confirmation1",
                                      ) as HTMLDialogElement
                                    ).showModal();
                                  }}
                                  className="btn btn-sm btn-ghost hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors"
                                  title="Hapus dock"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr key={"empty"}>
                          <td colSpan={6} className="px-4 py-8 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <MapPin className="w-12 h-12 text-gray-300 mb-2" />
                              <p className="font-medium">Belum ada data dock</p>
                              <p className="text-sm mt-1">
                                Mulai dengan menambahkan Gate pertama
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <DockFormModal
        formData={formData}
        setFormData={setFormData}
        onCreate={handleCreate}
        onEdit={handleUpdate}
        key={"DockFormModal"}
      />
      <ConfirmationModal
        message="Konfirmasi menghapus dock ini? "
        onConfirm={() => handleDelete(selectedDockId!)}
        title="Hapus Dock"
        modalId="confirmation1"
        key={"confirmation1"}
      />
    </div>
  );
}
