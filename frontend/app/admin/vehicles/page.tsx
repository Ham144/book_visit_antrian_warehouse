"use client";

import type React from "react";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Snowflake,
  Car,
  Search,
  Clock,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VehicleApi } from "@/api/vehicle.api";
import type { IVehicle } from "@/types/vehicle";
import VehilcleModalForm from "@/components/admin/vehicleModelForm";
import { useUserInfo } from "@/components/UserContext";
import ConfirmationModal from "@/components/shared-common/confirmationModal";

const initialFormData: IVehicle = {
  driverNames: [],
  brand: "",
  vehicleType: null,
  productionYear: undefined,
  durasiBongkar: 0,
  description: "",
  isReefer: false,
  drivers: [],
  isActive: true,
};

export interface FilterVehicle {
  searchKey?: string;
  page?: number;
}

export default function VehiclesPage() {
  const [filter, setFilter] = useState<FilterVehicle>({
    searchKey: "",
    page: 1,
  });

  const { userInfo } = useUserInfo();

  const [selectedVehicleId, setSelectedVehicleId] = useState<
    string | undefined
  >();

  const [formData, setFormData] = useState<IVehicle>(initialFormData);

  const qq = useQueryClient();

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles", filter],
    queryFn: () => VehicleApi.getVehicles(filter),
    enabled: !!userInfo?.homeWarehouse?.id,
  });

  const { mutateAsync: handleCreateVehicle } = useMutation({
    mutationKey: ["vehicles", "create"],
    mutationFn: async () => await VehicleApi.createVehicle(formData),
    onSuccess: () => {
      qq.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Berhasil mendaftarkan template kendaraan baru");
      (document.getElementById("vehicle-modal") as HTMLDialogElement).close();
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message);
    },
  });

  const { mutateAsync: handleUpdateVehicle } = useMutation({
    mutationFn: async () =>
      await VehicleApi.updateVehicle(formData.id, formData),
    onSuccess: () => {
      qq.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Kendaraan berhasil diperbarui");
      (document.getElementById("vehicle-modal") as HTMLDialogElement).close();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui kendaraan";
      toast.error(errorMessage);
    },
  });

  const { mutateAsync: handleDeleteVehicle } = useMutation({
    mutationFn: async () => await VehicleApi.deleteVehicle(selectedVehicleId!),
    onSuccess: () => {
      qq.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Kendaraan berhasil dihapus");
      (document.getElementById("detele-vehicle") as HTMLDialogElement).close();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus kendaraan";
      toast.error(errorMessage);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Kendaraan
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {vehicles.length}
                    </p>
                  </div>
                  <div className="p-3 bg-leaf-green-100 rounded-lg">
                    <Car className="w-6 h-6 text-leaf-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aktif</p>
                    <p className="text-2xl font-bold text-leaf-green-600">
                      {vehicles.filter((v) => v.isActive).length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setFormData(initialFormData);
                  (
                    document.getElementById(
                      "vehicle-modal"
                    ) as HTMLDialogElement
                  ).showModal();
                }}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:bg-teal-300"
              >
                <div className="flex items-center cursor-pointer justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tambah</p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <Plus className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari merk, nomor polisi, atau nama pengemudi..."
                      className="input input-bordered w-full pl-10 bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100"
                      value={filter.searchKey}
                      onChange={(e) =>
                        setFilter((f) => ({
                          ...f,
                          searchKey: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Car className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-sm max-w-md">
                    {filter.searchKey
                      ? "Coba ubah kata kunci pencarian atau filter yang digunakan"
                      : "Mulai dengan menambahkan kendaraan pertama Anda"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-leaf-green-50 border-b border-leaf-green-100">
                        <th className="font-semibold text-gray-700 py-4 px-4">
                          Merk & No. Polisi
                        </th>
                        <th className="font-semibold text-gray-700 py-4 px-4">
                          Jenis Kendaraan
                        </th>
                        <th className="font-semibold text-gray-700 py-4 px-4">
                          Durasi Bongkar
                        </th>
                        <th className="font-semibold text-gray-700 py-4 px-4">
                          Pengemudi
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
                      {vehicles?.length &&
                        vehicles.map((vehicle, index) => (
                          <tr
                            key={vehicle.id}
                            className={`hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? "bg-gray-25" : "bg-white"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Car className="w-4 h-4 text-leaf-green-500 flex-shrink-0" />
                                  <span className="font-semibold text-gray-800">
                                    {vehicle.brand}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {vehicle.vehicleType || "-"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-1 text-gray-700">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{vehicle.durasiBongkar} menit</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold  text-gray-700">
                              {vehicle?.drivers?.length || 0}
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    vehicle.isActive
                                      ? "bg-leaf-green-100 text-leaf-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                      vehicle.isActive
                                        ? "bg-leaf-green-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                  {vehicle.isActive ? "Aktif" : "Tidak Aktif"}
                                </span>
                                {vehicle.isReefer && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800">
                                    <Snowflake className="w-3 h-3 mr-1" />
                                    Reefer
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    const names = vehicle.drivers.map(
                                      (driver) => driver.username
                                    );
                                    const rest: IVehicle = {
                                      ...vehicle,
                                      driverNames: names,
                                    };
                                    setFormData(rest);
                                    (
                                      document.getElementById(
                                        "vehicle-modal"
                                      ) as HTMLDialogElement
                                    ).showModal();
                                  }}
                                  className="btn btn-sm btn-ghost hover:bg-leaf-green-50 hover:text-leaf-green-600 text-gray-500 transition-colors"
                                  title="Edit kendaraan"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedVehicleId(vehicle.id);
                                    (
                                      document.getElementById(
                                        "detele-vehicle"
                                      ) as HTMLDialogElement
                                    ).showModal();
                                  }}
                                  className="btn btn-sm btn-ghost hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors"
                                  title="Hapus kendaraan"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <VehilcleModalForm
        formData={formData}
        initialFormData={initialFormData}
        onCreate={handleCreateVehicle}
        onEdit={handleUpdateVehicle}
        setFormData={setFormData}
        key={"VehicleModalFormProps"}
      />
      <ConfirmationModal
        message="Konfirmasi Menghapus Kendaraan"
        modalId="detele-vehicle"
        onConfirm={handleDeleteVehicle}
        title="Apakah anda yakin menghapus template vehicle ini"
        key={"vehicle-delete"}
      />
    </div>
  );
}
