import { mockVehicleBrands, mockVehicleTypes } from "@/lib/mock-data";
import { X, Car, Truck, Clock, User, Search, XCircle } from "lucide-react";
import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import type { IVehicle } from "@/types/vehicle";
import { useQuery } from "@tanstack/react-query";
import { AuthApi } from "@/api/auth";

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

  const [searchKeyDriver, setSearchKeyDriver] = useState<string | null>(null);

  const { data: drivers } = useQuery({
    queryKey: ["vehicles", searchKeyDriver],
    queryFn: () =>
      AuthApi.getAllAccount({
        page: 1,
        searchKey: searchKeyDriver,
      }),
    enabled: searchKeyDriver?.length > 1,
  });

  return (
    <div className="modal modal-open max-md:w-screen max-md:px-3 max-md:h-screen max-md:">
      <div className="modal-box w-full max-w-3xl p-0 overflow-auto bg-white ">
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
              <div className="form-control relative">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Akun Pengemudi
                  </span>
                </label>

                {formData.driverName ? (
                  // Preview mode - ketika driver sudah dipilih
                  <div className="flex items-center gap-3 p-3 bg-leaf-green-50 border border-leaf-green-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-leaf-green-800">
                        {formData.driverName}
                      </div>
                      <div className="text-sm text-leaf-green-600">
                        Driver terpilih
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, driverName: undefined });
                        setSearchKeyDriver("");
                      }}
                      className="p-1 hover:bg-leaf-green-100 rounded-full transition-colors group"
                      title="Hapus driver"
                    >
                      <XCircle className="w-5 h-5 text-leaf-green-500 group-hover:text-leaf-green-700" />
                    </button>
                  </div>
                ) : (
                  // Search mode - ketika belum memilih driver
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama driver..."
                      className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors pr-10"
                      value={searchKeyDriver}
                      onChange={(e) => setSearchKeyDriver(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />

                    {/* Dropdown results */}
                    {searchKeyDriver && drivers?.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {drivers.map((driver: TokenPayload) => (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                driverName: driver.username,
                              });
                              setSearchKeyDriver("");
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-leaf-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            key={driver.username}
                          >
                            <div className="font-medium text-gray-800">
                              {driver.username}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {driver.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty state */}
                    {searchKeyDriver && drivers?.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                        <div className="text-center text-gray-500">
                          <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Driver tidak ditemukan</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="w-full flex-">
              <div className="space-y-4 wf">
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
