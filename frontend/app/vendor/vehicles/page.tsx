"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Edit2, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  mockUserVehicles,
  mockVehicleTypes,
  type UserVehicle,
} from "@/lib/mock-data";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<UserVehicle[]>(mockUserVehicles);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    brand: "",
    licensePlate: "",
    vehicleTypeId: "vt-1",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brand || !formData.licensePlate) {
      toast.error("Silakan isi semua bidang yang diperlukan");
      return;
    }

    if (editingId) {
      setVehicles(
        vehicles.map((v) =>
          v.id === editingId
            ? {
                ...v,
                brand: formData.brand,
                licensePlate: formData.licensePlate.toUpperCase(),
                vehicleTypeId: formData.vehicleTypeId,
                description: formData.description,
              }
            : v
        )
      );
      toast.success("Kendaraan berhasil diperbarui");
      setEditingId(null);
    } else {
      const newVehicle: UserVehicle = {
        id: `uv-${Date.now()}`,
        vendorId: "vendor-1",
        brand: formData.brand,
        licensePlate: formData.licensePlate.toUpperCase(),
        vehicleTypeId: formData.vehicleTypeId,
        description: formData.description,
        status: "active",
      };
      setVehicles([...vehicles, newVehicle]);
      toast.success("Kendaraan berhasil ditambahkan");
    }

    setFormData({
      brand: "",
      licensePlate: "",
      vehicleTypeId: "vt-1",
      description: "",
    });
    setShowForm(false);
  };

  const handleEdit = (vehicle: UserVehicle) => {
    setEditingId(vehicle.id);
    setFormData({
      brand: vehicle.brand,
      licensePlate: vehicle.licensePlate,
      vehicleTypeId: vehicle.vehicleTypeId,
      description: vehicle.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
    toast.success("Kendaraan berhasil dihapus");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      brand: "",
      licensePlate: "",
      vehicleTypeId: "vt-1",
      description: "",
    });
  };

  const getVehicleTypeName = (vehicleTypeId: string) => {
    return (
      mockVehicleTypes.find((vt) => vt.id === vehicleTypeId)?.name || "Unknown"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Kelola Kendaraan</h1>
              <p className="text-gray-600 text-sm">
                Tambah, edit, atau hapus kendaraan Anda
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary gap-2"
              >
                <Plus size={20} />
                Tambah Kendaraan
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h3 className="text-lg font-bold mb-4">
                  {editingId ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Merek Kendaraan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Hino 500"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Plat Nomor
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: B1234CD"
                        value={formData.licensePlate}
                        onChange={(e) =>
                          setFormData({ ...formData, licensePlate: e.target.value })
                        }
                        className="input input-bordered w-full uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Jenis Kendaraan
                      </label>
                      <select
                        value={formData.vehicleTypeId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleTypeId: e.target.value,
                          })
                        }
                        className="select select-bordered w-full"
                      >
                        {mockVehicleTypes.map((vt) => (
                          <option key={vt.id} value={vt.id}>
                            {vt.name} ({vt.description})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Deskripsi
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: IT, Cargo"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-ghost"
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <Check size={18} />
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Vehicle List */}
          <div className="space-y-3">
            {vehicles.length === 0 ? (
              <div className="card bg-white shadow">
                <div className="card-body text-center py-12">
                  <p className="text-gray-600">Belum ada kendaraan</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Tambahkan kendaraan pertama Anda untuk memulai
                  </p>
                </div>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="card bg-white shadow hover:shadow-lg transition"
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{vehicle.brand}</h3>
                        <p className="text-sm text-gray-600">
                          {vehicle.licensePlate}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          vehicle.status === "active"
                            ? "badge-success"
                            : "badge-gray"
                        }`}
                      >
                        {vehicle.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Jenis Kendaraan</p>
                          <p className="font-semibold">
                            {getVehicleTypeName(vehicle.vehicleTypeId)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Deskripsi</p>
                          <p className="font-semibold">
                            {vehicle.description || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">ID</p>
                          <p className="font-semibold text-xs">{vehicle.id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="btn btn-sm btn-outline btn-primary flex-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="btn btn-sm btn-outline btn-error flex-1"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

