import { WarehouseApi } from "@/api/warehouse.api";
import { UserApp } from "@/types/user.type";
import { GetWarehouseFilter } from "@/types/warehouse";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  IdCard,
  Warehouse,
  Lock,
  Eye,
  EyeOff,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast, Toaster } from "sonner";

export interface UserEditProps {
  formData: UserApp;
  setFormData: Dispatch<SetStateAction<UserApp>>;
  submitCreate: any;
  submitUpdate: any;
}

export default function UserEditModalForm({
  formData,
  setFormData,
  submitCreate,
  submitUpdate,
}: UserEditProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [warehouseFilter, setWarehouseFilter] = useState<GetWarehouseFilter>({
    page: 1,
    searchKey: "",
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => WarehouseApi.getWarehouses(warehouseFilter),
    enabled: warehouseFilter.searchKey.length > 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      toast.error("Password dan Konfirmasi Password harus sama");
      return;
    }

    if (formData.id) {
      submitUpdate();
    } else {
      submitCreate();
    }
  };

  const handleClose = () => {
    (document.getElementById("UserEditModalForm") as HTMLDialogElement).close();
  };

  return (
    <dialog id="UserEditModalForm" className="modal">
      <div className="modal-box w-full max-w-2xl p-0 overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-leaf-green-50 border-b border-leaf-green-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-leaf-green-100 rounded-lg">
                <User className="w-5 h-5 text-leaf-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">
                {formData.id ? "Edit User" : "Tambah User Baru"}
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
              {/* Username */}
              <div className="form-control md:col-span-2">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Username *
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="Username untuk login"
                  value={formData.username || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>

              {/* Display Name */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Nama Tampilan
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="Nama lengkap"
                  value={formData.displayName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                />
              </div>

              {/* Driver Phone */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Nomor Telepon
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="0812xxxx"
                  value={formData.driverPhone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, driverPhone: e.target.value })
                  }
                />
              </div>

              {/* Driver License */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <IdCard className="w-4 h-4 mr-2 text-leaf-green-500" />
                    SIM Pengemudi
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="SIM A, SIM B1, SIM B2"
                  value={formData.driverLicense || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, driverLicense: e.target.value })
                  }
                />
              </div>

              {/* Home Warehouse - Simple Version */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Warehouse className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Home Warehouse
                  </span>
                </label>

                <select
                  className="select select-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  value={formData.homeWarehouseId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homeWarehouseId: e.target.value || undefined,
                    })
                  }
                >
                  {warehouses?.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}{" "}
                      {warehouse.location ? `- ${warehouse.location}` : ""}
                    </option>
                  ))}
                </select>

                {/* Quick Search Input */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Cari warehouse..."
                    className="input input-bordered input-sm w-full bg-white border-gray-300"
                    value={warehouseFilter.searchKey || ""}
                    onChange={(e) =>
                      setWarehouseFilter((prev) => ({
                        ...prev,
                        searchKey: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Password - Only for new users */}
              {!formData.id && (
                <>
                  <div className="form-control">
                    <label className="label py-2">
                      <span className="label-text font-medium text-gray-700 flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-leaf-green-500" />
                        Password *
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors pr-10"
                        placeholder="Password"
                        value={formData.password || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required={!formData.id}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label py-2">
                      <span className="label-text font-medium text-gray-700 flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-leaf-green-500" />
                        Konfirmasi Password *
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors pr-10"
                        placeholder="Konfirmasi password"
                        value={formData.passwordConfirm || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passwordConfirm: e.target.value,
                          })
                        }
                        required={!formData.id}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              <div className="form-control md:col-span-2">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Deskripsi
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  rows={3}
                  placeholder="Deskripsi user"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Status */}
              <div className="form-control md:col-span-2">
                <label className="label cursor-pointer justify-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary border-gray-300 checked:border-leaf-green-500 checked:bg-leaf-green-500"
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

          {/* Actions */}
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
              className="btn btn-primary border-leaf-green-500 text-white hover:bg-leaf-green-600 hover:border-leaf-green-600 transition-colors px-8"
            >
              {formData.id ? "Perbarui" : "Tambah User"}
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </dialog>
  );
}
