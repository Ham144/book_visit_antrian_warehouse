import { mockVehicleBrands, mockVehicleTypes } from "@/lib/mock-data";
import { X, Car, Truck, Clock, User, Phone, IdCard } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { IVehicle } from "@/types/vehicle";

type MutationSnapshot = {
  isPending: boolean;
};

interface VehicleModalFormProps {
  isModalOpen: boolean;
  editingId: string | null;
  handleClose: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  formData: IVehicle;
  setFormData: Dispatch<SetStateAction<IVehicle>>;
  createMutation: MutationSnapshot;
  updateMutation: MutationSnapshot;
}

export default function VehilcleModalForm({
  isModalOpen,
  editingId,
  handleClose,
  handleSubmit,
  formData,
  setFormData,
  createMutation,
  updateMutation,
}: VehicleModalFormProps) {
  if (!isModalOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-3xl p-0 overflow-auto bg-white">
        {/* Header with leaf green accent */}
        <div className="bg-leaf-green-50 border-b border-leaf-green-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-leaf-green-100 rounded-lg">
                <Car className="w-5 h-5 text-leaf-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="btn btn-sm btn-circle btn-ghost hover:bg-leaf-green-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
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
                    Merk Kendaraan *
                  </span>
                </label>
                <select
                  className="select select-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
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
                  className="select select-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData.jenisKendaraan || ""}
                  onChange={(e) => {
                    const selected = e.target.value;
                    const typeObj = mockVehicleTypes.find(
                      (vt) => vt.name === selected
                    );
                    setFormData({
                      ...formData,
                      jenisKendaraan: selected,
                      durasiBongkar:
                        typeObj?.defaultUnloadMinutes ||
                        formData.durasiBongkar ||
                        30,
                    });
                  }}
                  required
                >
                  <option className="border-b border" value="">
                    Pilih Jenis Kendaraan
                  </option>
                  {mockVehicleTypes.map((vehicle) => (
                    <option
                      className=""
                      key={vehicle.name}
                      value={vehicle.name}
                    >
                      {`${vehicle.name} - ${vehicle.defaultUnloadMinutes} menit`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plate Number */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Nomor Polisi *
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="B 1234 XY"
                  value={formData.plateNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      plateNumber: e.target.value,
                    })
                  }
                  required
                />
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
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
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
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
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

              {/* Max Capacity */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Kapasitas Maksimum (opsional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="10 ton, 5000 kg"
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData.maxCapacity || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxCapacity: e.target.value || undefined,
                    })
                  }
                />
              </div>

              {/* Dimensions */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Panjang (meter)
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  step="0.01"
                  value={formData.dimensionLength || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimensionLength: Number(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Lebar (meter)
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  step="0.01"
                  value={formData.dimensionWidth || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimensionWidth: Number(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Tinggi (meter)
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  step="0.01"
                  value={formData.dimensionHeight || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimensionHeight: Number(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              {/* Reefer */}
              <div className="form-control mt-2">
                <label className="label cursor-pointer justify-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary border-b checked:border-leaf-green-500 checked:bg-leaf-green-500"
                    checked={formData.isReefer || false}
                    onChange={(e) =>
                      setFormData({ ...formData, isReefer: e.target.checked })
                    }
                  />
                  <span className="label-text font-medium text-gray-700">
                    Kendaraan Reefer (Pendingin)
                  </span>
                </label>
              </div>

              {/* Requires Dock */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Butuh Dock Khusus (opsional)
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="forklift, side, manual"
                  value={formData.requiresDock || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresDock: e.target.value || undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* ============================= */}
          {/* B. DRIVER INFO                */}
          {/* ============================= */}

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-4 bg-leaf-green-400 rounded-full"></div>
              <h4 className="font-semibold text-md text-gray-700">
                Informasi Pengemudi
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Nama Pengemudi
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData.driverName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      driverName: e.target.value || undefined,
                    })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Nomor HP Pengemudi
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="0812xxxx"
                  value={formData.driverPhone || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      driverPhone: e.target.value || undefined,
                    })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <IdCard className="w-4 h-4 mr-2 text-leaf-green-500" />
                    SIM Pengemudi
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="SIM B1, SIM B2"
                  value={formData.driverLicense || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      driverLicense: e.target.value || undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* ============================= */}
          {/* C. EXTRA                      */}
          {/* ============================= */}

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-4 bg-leaf-green-400 rounded-full"></div>
              <h4 className="font-semibold text-md text-gray-700">
                Informasi Tambahan
              </h4>
            </div>

            <div className="form-control">
              <label className="label py-2">
                <span className="label-text font-medium text-gray-700">
                  Deskripsi (opsional)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full bg-white border-b focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
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
                  className="checkbox checkbox-primary border-b checked:border-leaf-green-500 checked:bg-leaf-green-500"
                  checked={formData.isActive ?? true}
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

          {/* ACTIONS */}
          <div className="modal-action pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="btn btn-primary px-3"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : editingId ? (
                "Perbarui"
              ) : (
                "Tambah Kendaraan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
