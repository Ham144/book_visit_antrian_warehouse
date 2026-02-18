import { mockVehicleBrands } from "@/lib/mock-data";
import { Car, Truck, Clock, X } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import type { IVehicle } from "@/types/vehicle";
import { MutateFunction } from "@tanstack/react-query";
import { VehicleType } from "@/types/shared.type";
import { Toaster } from "sonner";

interface VehicleModalFormProps {
  formData: IVehicle;
  setFormData: Dispatch<SetStateAction<IVehicle>>;
  onCreate: MutateFunction;
  onEdit: MutateFunction;
  initialFormData: IVehicle;
}

const vehicleTypes = Object.values(VehicleType);

export default function VehilcleModalForm({
  formData,
  onCreate,
  onEdit,
  setFormData,
  initialFormData,
}: VehicleModalFormProps) {
  const onSubmit = () => {
    if (formData.id) {
      onEdit();
    } else {
      onCreate();
    }
  };

  return (
    <dialog id="vehicle-modal" className="modal">
      <div className="modal-box w-full max-w-3xl p-0 overflow-hidden bg-white overflow-y-auto">
        {/* Header with leaf green accent */}
        <div className="bg-leaf-green-50 border-b border-leaf-green-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-leaf-green-100 rounded-lg">
                <Car className="w-5 h-5 text-leaf-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">
                {formData.id ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
              </h3>
            </div>
            <button
              onClick={() => {
                (
                  document.getElementById("vehicle-modal") as HTMLDialogElement
                ).close();
                setFormData(initialFormData);
              }}
              className="btn btn-sm btn-circle btn-ghost hover:bg-leaf-green-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6 px-6 py-4"
        >
          {/* ============================= */}
          {/* A. INFORMASI KENDARAAN       */}
          {/* ============================= */}

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-4 bg-leaf-green-400 rounded-full"></div>
              <h4 className="font-semibold text-md text-gray-700">
                Informasi Kendaraan
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Car className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Brand *
                  </span>
                </label>
                <select
                  className="select select-bordered w-full bg-white border-gray-300 px-2 focus:border-leaf-green-500 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData.brand || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  required
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
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Jenis Kendaraan *
                  </span>
                </label>
                <select
                  className="select px-2 select-bordered w-full bg-white border-gray-300 focus:border-leaf-green-500 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData.vehicleType || ""}
                  onChange={(e) => {
                    const selected = e.target.value as VehicleType;
                    setFormData({
                      ...formData,
                      vehicleType: selected,
                      durasiBongkar: 90,
                    });
                  }}
                  required
                >
                  <option value="">Pilih Jenis Kendaraan</option>
                  {vehicleTypes.map((type) => {
                    return (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Production Year */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Tahun Produksi (opsional)
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="YYYY"
                  className="input border px-2 input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-500 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  min={1980}
                  max={new Date().getFullYear()}
                  value={formData.productionYear || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productionYear: Number(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              {/* Durasi Bongkar */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Durasi Bongkar Muat (menit) *
                  </span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  className="input px-2 input-bordered w-full bg-white border focus:border-leaf-green-500 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData.durasiBongkar || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durasiBongkar: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* ============================= */}
          {/* C. EXTRA INFO                */}
          {/* ============================= */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label py-2">
                <span className="label-text font-medium text-gray-700">
                  Deskripsi (opsional)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered px-2 border w-full bg-white border-gray-300 focus:border-leaf-green-500 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                rows={3}
                placeholder="Tambahan informasi tentang kendaraan"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value || undefined,
                  })
                }
              />
            </div>

            {/* Status */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox border-dashed border-gray-300 checked:border-leaf-green-500 checked:bg-leaf-green-500"
                  checked={formData.isActive ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.checked,
                    })
                  }
                />
                <span className="label-text font-medium text-gray-700">
                  Status Aktif
                </span>
              </label>{" "}
              <label className="label cursor-pointer justify-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox border-dashed border-gray-300 checked:border-leaf-green-500 checked:bg-leaf-green-500"
                  checked={formData.isGlobalWarehouse ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isGlobalWarehouse: e.target.checked,
                    })
                  }
                />
                <span className="label-text font-medium text-gray-700">
                  Apakah ini untuk seluruh warehouse
                </span>
              </label>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="modal-action pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                (
                  document.getElementById("vehicle-modal") as HTMLDialogElement
                ).close();
                setFormData(initialFormData);
              }}
              className="btn btn-ghost text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="btn bg-leaf-green-500 border-leaf-green-500  text-primary-content
              bg-primary  hover:bg-leaf-green-600 hover:border-leaf-green-600 px-4 transition-colors"
            >
              {formData.id ? "Perbarui Kendaraan" : "Tambah Kendaraan"}
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </dialog>
  );
}
