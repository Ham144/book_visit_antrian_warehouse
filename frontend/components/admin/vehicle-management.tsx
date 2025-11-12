"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import {
  mockAdminVehicles,
  mockVehicleBrands,
  getBrandName,
} from "@/lib/mock-data";
import { toast } from "sonner";

interface FormData {
  merkId: string;
  jenisKendaraan: string;
  unloadDuration: number;
  description: string;
  maxWeight: string;
  dimension: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  merkId: "",
  jenisKendaraan: "",
  unloadDuration: 30,
  description: "",
  maxWeight: "",
  dimension: "",
  isActive: true,
};

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState(mockAdminVehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleOpen = (vehicle?: (typeof mockAdminVehicles)[0]) => {
    if (vehicle) {
      setFormData({
        merkId: vehicle.merkId,
        jenisKendaraan: vehicle.jenisKendaraan,
        unloadDuration: vehicle.unloadDuration,
        description: vehicle.description || "",
        maxWeight: vehicle.maxWeight || "",
        dimension: vehicle.dimension || "",
        isActive: vehicle.isActive,
      });
      setEditingId(vehicle.id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.merkId || !formData.jenisKendaraan) {
      toast.error("Merk dan Jenis Kendaraan harus diisi");
      return;
    }

    if (editingId) {
      setVehicles(
        vehicles.map((v) =>
          v.id === editingId
            ? {
                ...v,
                ...formData,
              }
            : v
        )
      );
      toast.success("Kendaraan berhasil diperbarui");
    } else {
      const newVehicle = {
        id: `v-${Date.now()}`,
        ...formData,
        createdBy: "admin-1",
      };
      setVehicles([...vehicles, newVehicle]);
      toast.success("Kendaraan berhasil ditambahkan");
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus kendaraan ini?")) {
      setVehicles(vehicles.filter((v) => v.id !== id));
      toast.success("Kendaraan berhasil dihapus");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Kelola Kendaraan</h2>
          <p className="text-gray-600">
            Kelola jenis dan spesifikasi kendaraan di gudang
          </p>
        </div>
        <button onClick={() => handleOpen()} className="btn btn-primary gap-2">
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
                    Merk Kendaraan *
                  </span>
                </label>
                <select
                  value={formData.merkId}
                  onChange={(e) =>
                    setFormData({ ...formData, merkId: e.target.value })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Pilih Merk</option>
                  {mockVehicleBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenis Kendaraan */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Jenis Kendaraan *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Truck Box, Wing Box, Pick Up"
                  value={formData.jenisKendaraan}
                  onChange={(e) =>
                    setFormData({ ...formData, jenisKendaraan: e.target.value })
                  }
                  className="input input-bordered w-full"
                />
              </div>

              {/* Unload Duration */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Durasi Bongkar Muat (menit) *
                  </span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={formData.unloadDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unloadDuration: Number.parseInt(e.target.value),
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
                  value={formData.maxWeight}
                  onChange={(e) =>
                    setFormData({ ...formData, maxWeight: e.target.value })
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
                  value={formData.dimension}
                  onChange={(e) =>
                    setFormData({ ...formData, dimension: e.target.value })
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="textarea textarea-bordered w-full"
                  rows={3}
                />
              </div>

              {/* Status */}
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-semibold">Status Aktif</span>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
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
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Perbarui" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
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
                  {getBrandName(vehicle.merkId)}
                </td>
                <td>{vehicle.jenisKendaraan}</td>
                <td>{vehicle.unloadDuration}</td>
                <td>{vehicle.maxWeight || "-"}</td>
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
                    onClick={() => handleOpen(vehicle)}
                    className="btn btn-sm btn-outline gap-1"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="btn btn-sm btn-outline btn-error gap-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
