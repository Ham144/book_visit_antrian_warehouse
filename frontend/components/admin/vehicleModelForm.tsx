import { mockVehicleBrands } from "@/lib/mock-data";
import {
  Car,
  Truck,
  Clock,
  Users,
  User,
  Search,
  XCircle,
  Check,
  IdCard,
  X,
} from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { IVehicle } from "@/types/vehicle";
import { MutateFunction, useQuery } from "@tanstack/react-query";
import { AuthApi } from "@/api/auth";
import { DockRequirement, VehicleType } from "@/types/shared.type";
import { TokenPayload } from "@/types/tokenPayload";
import { Toaster } from "sonner";
import { UserInfo } from "@/types/auth";

interface VehicleModalFormProps {
  formData: IVehicle;
  setFormData: Dispatch<SetStateAction<IVehicle>>;
  onCreate: MutateFunction;
  onEdit: MutateFunction;
  initialFormData: IVehicle;
}

// Mapping VehicleType enum to display name and default unload minutes
const vehicleTypeConfig: Record<
  VehicleType,
  { label: string; defaultMinutes: number }
> = {
  [VehicleType.PICKUP]: { label: "Pick Up / Engkel", defaultMinutes: 20 },
  [VehicleType.CDD]: { label: "CDD (Colt Diesel Double)", defaultMinutes: 35 },
  [VehicleType.CDE]: { label: "CDE (Colt Diesel Engkel)", defaultMinutes: 30 },
  [VehicleType.FUSO]: { label: "Fuso", defaultMinutes: 45 },
  [VehicleType.TRONTON]: { label: "Tronton", defaultMinutes: 60 },
  [VehicleType.WINGBOX]: { label: "Wingbox", defaultMinutes: 50 },
  [VehicleType.CONTAINER20]: { label: "Container 20ft", defaultMinutes: 70 },
  [VehicleType.CONTAINER40]: { label: "Container 40ft", defaultMinutes: 90 },
};

const vehicleTypes = Object.values(VehicleType);

export default function VehilcleModalForm({
  formData,
  onCreate,
  onEdit,
  setFormData,
  initialFormData,
}: VehicleModalFormProps) {
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

  const onSubmit = (e: Event) => {
    e.preventDefault();
    if (formData.id) {
      onEdit();
    } else {
      onCreate();
    }
  };
  // Handle add driver
  const handleAddDriver = (driver: TokenPayload) => {
    const driverUsername = driver.username;
    const currentDrivers = formData.driverNames || [];

    // Check if already exists
    // Normalize currentDrivers menjadi array username string
    const usernames = currentDrivers.map((d: UserInfo | string) =>
      typeof d === "string" ? d : d.username
    );

    // Cek apakah sudah ada
    const exists = usernames.includes(driverUsername);

    if (!exists) {
      setFormData({
        ...formData,
        driverNames: [...currentDrivers, driverUsername],
      });
    }
    setSearchKeyDriver("");
  };

  // Handle remove driver
  const handleRemoveDriver = (index: number) => {
    const newDrivers = [...(formData.driverNames || [])];
    newDrivers.splice(index, 1);
    setFormData({
      ...formData,
      driverNames: newDrivers,
    });
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

        <form onSubmit={onSubmit} className="space-y-6 px-6 py-4">
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
                    const config = vehicleTypeConfig[selected];
                    setFormData({
                      ...formData,
                      vehicleType: selected,
                      durasiBongkar:
                        config?.defaultMinutes || formData.durasiBongkar || 30,
                    });
                  }}
                  required
                >
                  <option value="">Pilih Jenis Kendaraan</option>
                  {vehicleTypes.map((type) => {
                    const config = vehicleTypeConfig[type];
                    return (
                      <option key={type} value={type}>
                        {`${config.label} - ${config.defaultMinutes} menit`}
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

              {/* Max Capacity */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Kapasitas Maksimum (opsional)
                  </span>
                </label>
                <div className="flex items-center gap-x-2">
                  <input
                    type="number"
                    placeholder="5000"
                    className="input px-2 input-bordered border w-full bg-white border-gray-300 focus:border-leaf-green-500 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                    value={formData.maxCapacity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxCapacity: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                  <span className="font-bold"> KG</span>
                </div>
              </div>

              {/* Requires Dock */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Butuh Dock Khusus (opsional)
                  </span>
                </label>
                <select
                  className="select px-2 select-bordered w-full bg-white border-gray-300 focus:border-leaf-green-500 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  defaultValue={formData.requiresDock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresDock: e.target.value
                        ? (e.target.value as DockRequirement)
                        : undefined,
                    })
                  }
                >
                  {Object.values(DockRequirement).map((req) => (
                    <option key={req} value={req}>
                      {req}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ============================= */}
          {/* B. MULTI DRIVER SELECTION    */}
          {/* ============================= */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-4 bg-leaf-green-400 rounded-full"></div>
              <h4 className="font-semibold text-md text-gray-700">
                Pilih Pengemudi
              </h4>
            </div>

            <div className="form-control">
              <label className="label py-2">
                <span className="label-text font-medium text-gray-700 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-leaf-green-500" />
                  Daftar Pengemudi (Multi-select)
                </span>
                <span className="label-text-alt text-gray-500">
                  Pilih satu atau lebih pengemudi untuk kendaraan ini
                </span>
              </label>

              {/* Selected Drivers Preview */}
              {formData.driverNames?.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.driverNames?.map((driverName, index) => (
                      <div
                        key={index}
                        className="flex  items-center gap-2 px-3 py-2 bg-leaf-green-50 border border-leaf-green-200 rounded-lg"
                      >
                        <User className="w-4 h-4 text-leaf-green-500" />
                        <span className="text-sm font-medium text-leaf-green-800">
                          {driverName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDriver(index)}
                          className="p-1 hover:bg-leaf-green-100 rounded-full transition-colors"
                          title="Hapus pengemudi"
                        >
                          <XCircle className="w-4 h-4 text-leaf-green-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.driverNames?.length} pengemudi dipilih
                  </p>
                </div>
              )}

              {/* Driver Search and Selection */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama pengemudi..."
                  className="input px-2  input-bordered w-full bg-white border  focus:border-leaf-green-500 focus:ring-2 focus:ring-leaf-green-100 transition-colors pr-10"
                  value={searchKeyDriver || ""}
                  onChange={(e) => setSearchKeyDriver(e.target.value)}
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />

                {/* Search Results Dropdown */}
                {searchKeyDriver && drivers && drivers.length > 0 && (
                  <div className="absolute top-full px-2 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {drivers.map((driver: TokenPayload) => {
                      const isSelected = formData.driverNames?.some((d) =>
                        typeof d === "string"
                          ? d === driver.username
                          : d === driver.username
                      );
                      return (
                        <button
                          type="button"
                          onClick={() => handleAddDriver(driver)}
                          className={`w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-leaf-green-50"
                              : "hover:bg-leaf-green-50"
                          }`}
                          key={driver.username}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isSelected
                                  ? "bg-leaf-green-500 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {driver.username}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <IdCard className="w-3 h-3" />
                                {driver.description || "Pengemudi"}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-leaf-green-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Empty State */}
                {searchKeyDriver && drivers && drivers.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                    <div className="text-center text-gray-500">
                      <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Pengemudi tidak ditemukan</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Add Suggestions */}
              {!searchKeyDriver && drivers && drivers.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">
                    Pengemudi tersedia:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {drivers.slice(0, 5).map((driver: TokenPayload) => {
                      const isSelected = formData.driverNames?.some(
                        (d) => d === driver.username
                      );
                      return (
                        <button
                          type="button"
                          onClick={() => handleAddDriver(driver)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            isSelected
                              ? "bg-leaf-green-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          key={driver.username}
                        >
                          {driver.username}
                        </button>
                      );
                    })}
                    {drivers.length > 5 && (
                      <span className="text-xs text-gray-500 self-center">
                        +{drivers.length - 5} lainnya
                      </span>
                    )}
                  </div>
                </div>
              )}
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
                  className="checkbox checkbox-primary border-gray-300 checked:border-leaf-green-500 checked:bg-leaf-green-500"
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
