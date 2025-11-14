"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VehicleApi } from "@/api/vehicle";
import type { IVehicle } from "@/types/vehicle";
import { mockVehicleBrands, mockVehicleTypes } from "@/lib/mock-data";

const initialFormData: IVehicle = {
  brand: "",
  jenisKendaraan: "",
  durasiBongkar: 30,
  description: "",
  maxCapacity: "",
  dimension: "",
  isActive: true,
};

export default function VehiclesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<IVehicle>(initialFormData);
  const queryClient = useQueryClient();

  const {
    data: vehicles = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => VehicleApi.getVehicles(),
    retry: 1,
    staleTime: 30000,
  });

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const createMutation = useMutation({
    mutationFn: async (body: Omit<IVehicle, "id">) =>
      await VehicleApi.createVehicle(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Kendaraan berhasil ditambahkan");
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menambahkan kendaraan";
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<IVehicle, "id">>;
    }) => await VehicleApi.updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Kendaraan berhasil diperbarui");
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui kendaraan";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await VehicleApi.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Kendaraan berhasil dihapus");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus kendaraan";
      toast.error(errorMessage);
    },
  });

  const handleOpenEdit = (vehicle?: IVehicle) => {
    if (vehicle && vehicle.id) {
      setFormData({
        brand: vehicle.brand || "",
        jenisKendaraan: vehicle.jenisKendaraan || "",
        durasiBongkar: vehicle.durasiBongkar,
        description: vehicle.description || "",
        maxCapacity: vehicle.maxCapacity || "",
        dimension: vehicle.dimension || "",
        isActive: vehicle.isActive ?? true,
      });
      setEditingId(vehicle.id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.durasiBongkar) {
      toast.error("Durasi bongkar muat harus diisi");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          brand: formData.brand || undefined,
          jenisKendaraan: formData.jenisKendaraan || undefined,
          durasiBongkar: formData.durasiBongkar,
          description: formData.description || undefined,
          maxCapacity: formData.maxCapacity || undefined,
          dimension: formData.dimension || undefined,
          isActive: formData.isActive,
        },
      });
    } else {
      createMutation.mutate({
        brand: formData.brand || undefined,
        jenisKendaraan: formData.jenisKendaraan || undefined,
        durasiBongkar: formData.durasiBongkar,
        description: formData.description || undefined,
        maxCapacity: formData.maxCapacity || undefined,
        dimension: formData.dimension || undefined,
        isActive: formData.isActive ?? true,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus kendaraan ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Kelola Kendaraan</h2>
                <p className="text-gray-600">
                  Kelola jenis dan spesifikasi kendaraan di gudang
                </p>
              </div>
              <button
                onClick={() => handleOpenEdit()}
                className="btn btn-primary gap-2"
              >
                <Plus size={20} />
                Tambah Kendaraan
              </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div className="modal modal-open">
                <div className="modal-box w-full max-w-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      {editingId ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
                    </h3>
                    <button
                      onClick={handleClose}
                      className="btn btn-sm btn-circle btn-ghost"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Merk */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Merk Kendaraan (opsional)
                        </span>
                      </label>
                      <select
                        value={formData.brand || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brand: e.target.value || undefined,
                          })
                        }
                        className="select select-bordered w-full"
                      >
                        <option value="">Pilih Merk</option>
                        {mockVehicleBrands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Jenis Kendaraan */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Jenis Kendaraaan(opsional)
                        </span>
                      </label>
                      <select
                        value={formData.brand || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            jenisKendaraan: e.target.value || undefined,
                            durasiBongkar:
                              mockVehicleTypes.find(
                                (vt) => vt.name === e.target.value
                              )?.defaultUnloadMinutes || 30,
                          })
                        }
                        className="select select-bordered w-full"
                      >
                        <option value="">Pilih Jenis Kendaraan</option>
                        {mockVehicleTypes.map((vehicleType) => (
                          <option
                            key={vehicleType.name}
                            value={vehicleType.name}
                          >
                            {`${vehicleType.name} - ${vehicleType.defaultUnloadMinutes} menit`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unload Duration */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Durasi Bongkar Muat (menit) (max 5 jam)
                        </span>
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="300" //max 5 jam
                        value={formData.durasiBongkar || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            durasiBongkar: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>

                    {/* Max Weight */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Kapasitas Maksimum (opsional)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 10 ton, 5000 kg"
                        value={formData.maxCapacity || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxCapacity: e.target.value || undefined,
                          })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>

                    {/* Dimension */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Dimensi (opsional)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 7m x 2.5m x 3m"
                        value={formData.dimension || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimension: e.target.value || undefined,
                          })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>

                    {/* Description */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Deskripsi (opsional)
                        </span>
                      </label>
                      <textarea
                        placeholder="Deskripsi tambahan tentang kendaraan"
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value || undefined,
                          })
                        }
                        className="textarea textarea-bordered w-full"
                        rows={3}
                      />
                    </div>

                    {/* Status */}
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text font-semibold">
                          Status Aktif
                        </span>
                        <input
                          type="checkbox"
                          checked={formData.isActive ?? true}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className="checkbox"
                        />
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="modal-action">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="btn btn-ghost"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                          createMutation.isPending || updateMutation.isPending
                        }
                      >
                        {createMutation.isPending ||
                        updateMutation.isPending ? (
                          <span className="loading loading-spinner"></span>
                        ) : editingId ? (
                          "Perbarui"
                        ) : (
                          "Tambah"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : fetchError ? (
                <div className="alert alert-error">
                  <span>Gagal memuat data kendaraan</span>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="alert alert-info">
                  <span>Belum ada data kendaraan</span>
                </div>
              ) : (
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Merk</th>
                      <th>Jenis Kendaraan</th>
                      <th>Durasi Bongkar (menit)</th>
                      <th>Kapasitas</th>
                      <th>Dimensi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="font-semibold">
                          {vehicle.brand || "-"}
                        </td>
                        <td>{vehicle.jenisKendaraan || "-"}</td>
                        <td>{vehicle.durasiBongkar}</td>
                        <td>{vehicle.maxCapacity || "-"}</td>
                        <td className="text-sm">{vehicle.dimension || "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              vehicle.isActive ? "badge-success" : "badge-error"
                            }`}
                          >
                            {vehicle.isActive ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </td>
                        <td className="flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(vehicle)}
                            className="btn btn-sm btn-outline gap-1"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id!)}
                            className="btn btn-sm btn-outline btn-error gap-1"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
