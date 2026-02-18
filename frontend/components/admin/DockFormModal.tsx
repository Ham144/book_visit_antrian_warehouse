import { IDock } from "@/types/dock.type";
import { MutateFunction, useQuery } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Warehouse as WarehouseIcon,
  Truck,
  Star,
  XCircle,
  Activity,
  MapPin,
  Calendar,
} from "lucide-react";
import { Toaster } from "sonner";
import { DockApi } from "@/api/dock.api";
import { VehicleType } from "@/types/shared.type";

interface DockFormModalProps {
  formData: IDock;
  setFormData: Dispatch<SetStateAction<IDock>>;
  onCreate: MutateFunction;
  onEdit: MutateFunction;
}

const DockFormModal = ({
  formData,
  setFormData,
  onCreate,
  onEdit,
}: DockFormModalProps) => {
  const [showVehicleTypes, setShowVehicleTypes] = useState(false);

  useQuery({
    queryKey: ["warehouse", formData?.id],
    queryFn: async () => {
      const res = await DockApi.getDockDetail(formData?.id);
      setFormData(res);
    },
    enabled: !!formData?.id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      onEdit();
    } else {
      onCreate();
    }
  };

  const handleClose = () => {
    (document.getElementById("DockFormModal") as HTMLDialogElement).close();
  };

  const vehicleTypes = Object.values(VehicleType);

  const toggleVehicleType = (vehicleType: VehicleType) => {
    const currentTypes = formData.allowedTypes || [];
    const updatedTypes = currentTypes.includes(vehicleType)
      ? currentTypes.filter((type) => type !== vehicleType)
      : [...currentTypes, vehicleType];

    setFormData({ ...formData, allowedTypes: updatedTypes });
  };

  const handlePhotoAdd = (url: string) => {
    if (url.trim()) {
      const currentPhotos = formData.photos || [];
      if (!currentPhotos.includes(url.trim())) {
        setFormData({
          ...formData,
          photos: [...currentPhotos, url.trim()],
        });
      }
    }
  };

  const handlePhotoRemove = (index: number) => {
    const currentPhotos = formData.photos || [];
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: updatedPhotos });
  };

  return (
    <dialog id="DockFormModal" className="modal">
      <div className="modal-box w-full max-w-4xl p-0  bg-white overflow-auto">
        {/* Header */}
        <div className="bg-leaf-green-50 border-b border-leaf-green-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-leaf-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-leaf-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">
                {formData?.id ? "Edit Gate" : "Tambah Gate Baru"}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="btn btn-sm btn-circle btn-ghost hover:bg-leaf-green-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dock Name */}
              <div className="form-control md:col-span-2">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Nama Gate *
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border px-2  focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="Dock A, Gate 1, Ramp B, etc."
                  value={formData?.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Warehouse */}
              <div className="form-control md:col-span-2">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <WarehouseIcon className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Warehouse *
                  </span>
                </label>
                <select
                  disabled
                  className="select select-bordered w-full bg-white border px-2  focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData?.warehouseId || ""}
                  required
                >
                  <option value={formData?.warehouseId}>
                    {formData?.warehouse?.name || ""}
                  </option>
                </select>
              </div>

              {/* Priority */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Prioritas (untuk di dahulukan)
                  </span>
                </label>
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-1 mb-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            priority:
                              formData?.priority === star ? undefined : star,
                          })
                        }
                        className="p-1 transition-all hover:scale-110 focus:outline-none"
                        title={`Prioritas ${star}`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            formData?.priority && star <= formData.priority
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between w-full text-xs text-gray-500 mt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <span
                        key={num}
                        className={`w-7 text-center ${
                          formData?.priority === num
                            ? "font-bold text-leaf-green-600"
                            : ""
                        }`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  Klik bintang untuk memilih prioritas (1 = tertinggi, 10 =
                  terendah)
                </div>
              </div>

              {/* Allowed Vehicle Types */}
              <div className="form-control md:col-span-2">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Jenis Kendaraan yang Didukung
                  </span>
                </label>

                {/* Selected Types Preview */}
                {formData?.allowedTypes && formData.allowedTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData?.allowedTypes.map((type) => (
                      <div
                        key={type}
                        className="flex items-center gap-2 px-3 py-1.5 bg-leaf-green-50 border border-leaf-green-200 rounded-lg"
                      >
                        <span className="text-sm font-medium text-leaf-green-800">
                          {type}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleVehicleType(type)}
                          className="p-0.5 hover:bg-leaf-green-100 rounded-full transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-leaf-green-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Vehicle Types Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVehicleTypes(!showVehicleTypes)}
                    className="btn btn-outline w-full justify-between border px-2  hover:bg-gray-50"
                  >
                    <span>Pilih Jenis Kendaraan</span>
                    <Truck className="w-4 h-4" />
                  </button>

                  {showVehicleTypes && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {vehicleTypes
                        .filter((type) => !formData.allowedTypes.includes(type))
                        .map((type) => (
                          <button
                            type="button"
                            onClick={() => toggleVehicleType(type)}
                            className={`w-full px-4 py-3 text-left hover:bg-leaf-green-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                              formData.allowedTypes?.includes(type)
                                ? "bg-leaf-green-50"
                                : ""
                            }`}
                            key={type}
                          >
                            <div className="font-medium text-gray-800">
                              {type}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="form-control md:col-span-2">
                <label className="label cursor-pointer justify-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary border px-2  checked:border-leaf-green-500 checked:bg-leaf-green-500 text-white"
                    checked={formData?.isActive ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <span className="label-text font-medium text-gray-700">
                    Status Aktif
                  </span>
                </label>
              </div>
            </div>

            {/* Days */}
            <label>
              <span className="my-2 label-text font-medium text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-leaf-green-500" />
                Hari
              </span>
              <div className="grid grid-cols-7 w-full flex-1 space-x-1 gap-4">
                {formData?.vacants?.length &&
                  formData?.vacants?.map((vacant, index) => (
                    <div key={vacant.day} className="flex flex-col gap-3">
                      <label
                        htmlFor={vacant.day}
                        className="btn border w-full justify-center"
                      >
                        {vacant.day}
                      </label>
                      <div id={vacant.day} className="flex flex-col gap-2">
                        {/* Availability From */}
                        <div className="form-control">
                          <label className="label py-1">
                            <span className="label-text text-xs">Dari</span>
                          </label>
                          <input
                            type="time"
                            className="input input-bordered input-sm w-full bg-white border px-2  focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                            value={String(vacant.availableFrom) || null}
                            onChange={(e) => {
                              const time = e.target.value;
                              const updatedVacants = [
                                ...(formData.vacants || []),
                              ];
                              updatedVacants[index] = {
                                ...updatedVacants[index],
                                availableFrom: time || null,
                              };
                              setFormData({
                                ...formData,
                                vacants: updatedVacants,
                              });
                            }}
                          />
                        </div>

                        {/* Availability Until */}
                        <div className="form-control">
                          <label className="label py-1">
                            <span className="label-text text-xs">Sampai</span>
                          </label>
                          <input
                            type="time"
                            className="input input-bordered input-sm w-full bg-white border px-2 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                            value={vacant?.availableUntil?.toString() || ""}
                            onChange={(e) => {
                              const time = e.target.value;
                              const updatedVacants = [
                                ...(formData.vacants || []),
                              ];
                              updatedVacants[index] = {
                                ...updatedVacants[index],
                                availableUntil: time || null,
                              };
                              setFormData({
                                ...formData,
                                vacants: updatedVacants,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="modal-action gap-x-6 flex pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="btn btn-primary hover:bg-leaf-green-600 hover:border-leaf-green-600 transition-colors px-8"
            >
              {formData?.id ? "Perbarui Gate" : "Tambah Gate"}
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </dialog>
  );
};

export default DockFormModal;
