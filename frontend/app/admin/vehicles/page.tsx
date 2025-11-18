"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VehicleApi } from "@/api/vehicle";
import type { IVehicle } from "@/types/vehicle";
import { mockVehicleBrands, mockVehicleTypes } from "@/lib/mock-data";
import VehilcleModalForm from "@/components/admin/vehicleModelForm";

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

export default function VehiclesPage() {
  const sanitizeString = (value?: string | null) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

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
                className="btn btn-primary gap-2 px-3"
              >
                <Plus size={20} />
                Tambah Kendaraan
              </button>
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

            {/* here */}
          </div>
        </main>
      </div>
    </div>
  );
}
