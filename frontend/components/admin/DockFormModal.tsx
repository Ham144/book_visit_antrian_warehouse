import { IDock } from "@/types/dock.type";
import { MutateFunction } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Warehouse as WarehouseIcon,
  Ruler,
  Clock,
  Truck,
  Star,
  XCircle,
  Activity,
  MapPin,
  Image,
  Upload,
} from "lucide-react";
import { Toaster } from "sonner";

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

  const vehicleTypes = [
    "Pick Up / Engkel",
    "CDD Bak / Box",
    "CDD Wingbox",
    "CDE Bak / Box",
    "CDE Wingbox",
    "Fuso Bak / Box",
    "Tronton Bak / Box",
    "Trailer",
  ];

  const dockTypes = [
    { value: "forklift", label: "forklift" },
    { value: "manual", label: "manual" },
    { value: "side", label: "side" },
    { value: "reefer", label: "reefer" },
  ];

  const toggleVehicleType = (vehicleType: string) => {
    const currentTypes = formData.supportedVehicleTypes || [];
    const updatedTypes = currentTypes.includes(vehicleType)
      ? currentTypes.filter((type) => type !== vehicleType)
      : [...currentTypes, vehicleType];

    setFormData({ ...formData, supportedVehicleTypes: updatedTypes });
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

  if (!formData) {
    return null;
  }

  return (
    <dialog id="DockFormModal" className="modal">
      <div className="modal-box w-full max-w-2xl p-0  bg-white overflow-auto">
        {/* Header */}
        <div className="bg-leaf-green-50 border-b border-leaf-green-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-leaf-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-leaf-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">
                {formData?.id ? "Edit Dock" : "Tambah Dock Baru"}
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
                    Nama Dock *
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
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
                  className="select select-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData?.warehouseId || ""}
                  required
                >
                  <option value={formData?.warehouseId}>
                    {formData.warehouse?.name || ""}
                  </option>
                </select>
              </div>

              {/* Photos */}
              <div className="form-control md:col-span-2">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Image className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Foto Dock
                  </span>
                </label>

                {/* Photo URL Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="input input-bordered flex-1 bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                    placeholder="Masukkan URL foto"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handlePhotoAdd(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      if (input?.value) {
                        handlePhotoAdd(input.value);
                        input.value = "";
                      }
                    }}
                    className="btn btn-outline border-gray-300 hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected Photos Preview */}
                {formData?.photos && formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={photo}
                          alt={`Dock photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage not found%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handlePhotoRemove(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hapus foto"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(!formData?.photos || formData.photos.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Belum ada foto. Masukkan URL foto di atas.
                    </p>
                  </div>
                )}
              </div>

              {/* Dock Type */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <WarehouseIcon className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Tipe Dock *
                  </span>
                </label>
                <select
                  className="select select-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData?.dockType || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dockType: e.target.value })
                  }
                  required
                >
                  <option value="">Pilih Tipe Dock</option>
                  {dockTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Prioritas
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="1 (tertinggi) - 10 (terendah)"
                  value={formData?.priority || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* Maximum Dimensions */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Ruler className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Panjang Maks. (m)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="0.0"
                  value={formData?.maxLength || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxLength: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Lebar Maks. (m)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="0.0"
                  value={formData?.maxWidth || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxWidth: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Tinggi Maks. (m)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="0.0"
                  value={formData?.maxHeight || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxHeight: Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* Supported Vehicle Types */}
              <div className="form-control md:col-span-2">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Jenis Kendaraan yang Didukung
                  </span>
                </label>

                {/* Selected Types Preview */}
                {formData?.supportedVehicleTypes &&
                  formData.supportedVehicleTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData?.supportedVehicleTypes.map((type) => (
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
                    className="btn btn-outline w-full justify-between border-gray-300 hover:bg-gray-50"
                  >
                    <span>Pilih Jenis Kendaraan</span>
                    <Truck className="w-4 h-4" />
                  </button>

                  {showVehicleTypes && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {vehicleTypes.map((type) => (
                        <button
                          type="button"
                          onClick={() => toggleVehicleType(type)}
                          className={`w-full px-4 py-3 text-left hover:bg-leaf-green-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                            formData.supportedVehicleTypes?.includes(type)
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

              {/* Availability Times */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Tersedia Dari
                  </span>
                </label>
                <input
                  type="time"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={
                    formData?.availableFrom
                      ? new Date(formData.availableFrom)
                          .toTimeString()
                          .slice(0, 5)
                      : ""
                  }
                  onChange={(e) => {
                    const time = e.target.value;
                    if (time) {
                      const date = new Date();
                      const [hours, minutes] = time.split(":");
                      date.setHours(parseInt(hours), parseInt(minutes));
                      setFormData({ ...formData, availableFrom: date });
                    } else {
                      setFormData({ ...formData, availableFrom: undefined });
                    }
                  }}
                />
              </div>

              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Tersedia Sampai
                  </span>
                </label>
                <input
                  type="time"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={
                    formData?.availableUntil
                      ? new Date(formData.availableUntil)
                          .toTimeString()
                          .slice(0, 5)
                      : ""
                  }
                  onChange={(e) => {
                    const time = e.target.value;
                    if (time) {
                      const date = new Date();
                      const [hours, minutes] = time.split(":");
                      date.setHours(parseInt(hours), parseInt(minutes));
                      setFormData({ ...formData, availableUntil: date });
                    } else {
                      setFormData({ ...formData, availableUntil: undefined });
                    }
                  }}
                />
              </div>

              {/* Status */}
              <div className="form-control md:col-span-2">
                <label className="label cursor-pointer justify-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary border-gray-300 checked:border-leaf-green-500 checked:bg-leaf-green-500"
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
              {formData?.id ? "Perbarui Dock" : "Tambah Dock"}
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </dialog>
  );
};

export default DockFormModal;
