"use client";

import type React from "react";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Snowflake,
  IdCard,
  Car,
  Search,
  Filter,
  Phone,
  Clock,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VehicleApi } from "@/api/vehicle.api";
import type { IVehicle } from "@/types/vehicle";
import VehilcleModalForm from "@/components/admin/vehicleModelForm";
import { AuthApi } from "@/api/auth";

const initialFormData: IVehicle = {
  brand: "",
  jenisKendaraan: "",
  plateNumber: "",
  productionYear: undefined,
  durasiBongkar: 30,
  description: "",
  maxCapacity: "",
  dimensionLength: undefined,
  dimensionWidth: undefined,
  dimensionHeight: undefined,
  isReefer: false,
  requiresDock: "",
  driverName: "",
  driverPhone: "",
  driverLicense: "",
  isActive: true,
};

export interface FilterVehicle {
  searchKey?: string;
  page?: number;
}

export default function VehiclesPage() {
  const sanitizeString = (value?: string | null) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };
  const [filter, setFilter] = useState<FilterVehicle>({
    searchKey: "",
    page: 1,
  });

  const sanitizeNumber = (value?: number | null) =>
    typeof value === "number" && !Number.isNaN(value) ? value : undefined;

  const formatDimension = (vehicle: IVehicle) => {
    const length = sanitizeNumber(vehicle.dimensionLength);
    const width = sanitizeNumber(vehicle.dimensionWidth);
    const height = sanitizeNumber(vehicle.dimensionHeight);

    if (length === undefined && width === undefined && height === undefined) {
      return "-";
    }

    const formatPart = (val?: number) =>
      val === undefined ? "-" : `${val}`.replace(/\.0+$/, "");

    return `${formatPart(length)} x ${formatPart(width)} x ${formatPart(
      height
    )} m`;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<IVehicle>(initialFormData);
  const queryClient = useQueryClient();

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles", filter],
    queryFn: () => VehicleApi.getVehicles(filter),
    retry: 1,
    staleTime: 30000,
  });

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...initialFormData });
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
        plateNumber: vehicle.plateNumber || "",
        productionYear: vehicle.productionYear,
        durasiBongkar: vehicle.durasiBongkar,
        maxCapacity: vehicle.maxCapacity || "",
        dimensionLength: vehicle.dimensionLength ?? undefined,
        dimensionWidth: vehicle.dimensionWidth ?? undefined,
        dimensionHeight: vehicle.dimensionHeight ?? undefined,
        isReefer: vehicle.isReefer ?? false,
        requiresDock: vehicle.requiresDock || "",
        driverName: vehicle.driverName || "",
        driverPhone: vehicle.driverPhone || "",
        driverLicense: vehicle.driverLicense || "",
        description: vehicle.description || "",
        isActive: vehicle.isActive ?? true,
      });
      setEditingId(vehicle.id);
    } else {
      setFormData({ ...initialFormData });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.brand) {
      toast.error("Merk kendaraan harus diisi");
      return;
    }

    if (!formData.jenisKendaraan) {
      toast.error("Jenis kendaraan harus diisi");
      return;
    }

    const plateNumber = formData.plateNumber?.trim();

    if (!plateNumber) {
      toast.error("Nomor polisi harus diisi");
      return;
    }

    if (!formData.durasiBongkar) {
      toast.error("Durasi bongkar muat harus diisi");
      return;
    }

    const payload = {
      brand: formData.brand.trim(),
      jenisKendaraan: formData.jenisKendaraan.trim(),
      plateNumber: plateNumber.toUpperCase(),
      productionYear: sanitizeNumber(formData.productionYear),
      maxCapacity: sanitizeString(formData.maxCapacity),
      dimensionLength: sanitizeNumber(formData.dimensionLength),
      dimensionWidth: sanitizeNumber(formData.dimensionWidth),
      dimensionHeight: sanitizeNumber(formData.dimensionHeight),
      durasiBongkar: formData.durasiBongkar,
      isReefer: Boolean(formData.isReefer),
      requiresDock: sanitizeString(formData.requiresDock),
      driverName: sanitizeString(formData.driverName),
      driverPhone: sanitizeString(formData.driverPhone),
      driverLicense: sanitizeString(formData.driverLicense),
      description: sanitizeString(formData.description),
      isActive: formData.isActive ?? true,
    };

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
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
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Manajemen Kendaraan
                    </h1>
                    <p className="text-gray-600">
                      Kelola armada kendaraan dan informasi pengemudi
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 sm:mt-0 btn bg-leaf-green-500 border-leaf-green-500 text-white hover:bg-leaf-green-600 hover:border-leaf-green-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Kendaraan
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-center">
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

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Kendaraan Reefer
                      </p>
                      <p className="text-2xl font-bold text-cyan-600">
                        {vehicles.filter((v) => v.isReefer).length}
                      </p>
                    </div>
                    <div className="p-3 bg-cyan-100 rounded-lg">
                      <Snowflake className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:bg-teal-300"
                >
                  <div className="flex items-center cursor-pointer justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Tambah
                      </p>
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
                            Kapasitas & Dimensi
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
                                  {vehicle.plateNumber && (
                                    <div className="text-sm text-gray-600">
                                      {vehicle.plateNumber}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {vehicle.jenisKendaraan}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-1 text-gray-700">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle.durasiBongkar} menit</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  {vehicle.maxCapacity && (
                                    <div className="text-sm text-gray-700">
                                      {vehicle.maxCapacity}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 font-mono">
                                    {formatDimension(vehicle)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  {vehicle.driverName ? (
                                    <>
                                      <div className="text-sm font-medium text-gray-800">
                                        {vehicle.driverName}
                                      </div>
                                      {vehicle.driverPhone && (
                                        <div className="text-xs text-gray-500 flex items-center">
                                          <Phone className="w-3 h-3 mr-1" />
                                          {vehicle.driverPhone}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      -
                                    </span>
                                  )}
                                </div>
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
                                    onClick={() => handleOpenEdit(vehicle)}
                                    className="btn btn-sm btn-ghost hover:bg-leaf-green-50 hover:text-leaf-green-600 text-gray-500 transition-colors"
                                    title="Edit kendaraan"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(vehicle.id)}
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
      </div>
      <VehilcleModalForm
        createMutation={createMutation}
        editingId={editingId}
        formData={formData}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        isModalOpen={isModalOpen}
        setFormData={setFormData}
        updateMutation={updateMutation}
        key={"vehicle-modal"}
      />
    </div>
  );
}
