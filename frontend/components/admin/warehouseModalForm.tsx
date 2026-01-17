import {
  X,
  WarehouseIcon,
  MapPin,
  Search,
  XCircle,
  Stamp,
  User,
} from "lucide-react";
import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthApi } from "@/api/auth";
import { Warehouse } from "@/types/warehouse";
import { useUserInfo } from "../UserContext";
import { ROLE } from "@/types/shared.type";

type MutationSnapshot = {
  isPending: boolean;
};

interface WarehouseModalFormProps {
  isModalOpen: boolean;
  editingId: string | null;
  handleClose: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  formData: Warehouse;
  setFormData: Dispatch<SetStateAction<Warehouse>>;
  createMutation: MutationSnapshot;
  updateMutation: MutationSnapshot;
}

interface TokenPayload {
  username: string;
  description: string;
  isOperator: boolean;
  homeWarehouseId: string;
  organizationName: string;
}

export default function WarehouseModalForm({
  isModalOpen,
  editingId,
  handleClose,
  handleSubmit,
  formData,
  setFormData,
  createMutation,
  updateMutation,
}: WarehouseModalFormProps) {
  if (!isModalOpen) return null;

  const { userInfo } = useUserInfo();

  const [searchKeyAccess, setSearchKeyAccess] = useState<string>("");
  const selectedAccess = formData.userWarehouseAccesses ?? [];

  const { data: accounts } = useQuery({
    queryKey: ["warehouse-members", searchKeyAccess],
    queryFn: () =>
      AuthApi.getAllAccountForMemberManagement({
        page: 1,
        searchKey: searchKeyAccess || "",
      }),
    enabled: searchKeyAccess.length > 1,
  });

  const handleAddAccessWarehouse = (username: string) => {
    if (!selectedAccess.includes(username)) {
      const newAccess = [...selectedAccess, username];
      setFormData({ ...formData, userWarehouseAccesses: newAccess });
      setSearchKeyAccess("");
    }
  };

  const handleRemoveAccessWarehouse = (username: string) => {
    const newAccess = selectedAccess.filter((m) => m !== username);
    setFormData({ ...formData, userWarehouseAccesses: newAccess });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-3xl p-0 overflow-auto bg-white">
        {/* Header with leaf green accent */}
        <div className="bg-leaf-green-50 border-b border-leaf-green-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-leaf-green-100 rounded-lg">
                <WarehouseIcon className="w-5 h-5 text-leaf-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? "Edit Warehouse" : "Tambah Warehouse Baru"}
              </h3>
            </div>
            {userInfo.role != ROLE.ADMIN_ORGANIZATION && (
              <div className="flex items-center space-x-3">
                <div className="badge badge-ghost text-xs text-gray-600">
                  Akses Terbatas, hanya field berikut ini yang bisa role anda
                  ubah
                </div>
              </div>
            )}
            <button
              onClick={handleClose}
              className="btn btn-sm btn-circle btn-ghost hover:bg-leaf-green-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="form-control md:col-span-2">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <WarehouseIcon className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Nama Warehouse *
                  </span>
                </label>
                <input
                  type="text"
                  disabled={editingId !== null}
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="Nama warehouse"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Location */}
              <div className="form-control">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-leaf-green-500" />
                    Lokasi (opsional)
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  placeholder="Alamat warehouse"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value || undefined,
                    })
                  }
                />
              </div>

              {/* Description */}
              <div className="form-control md:col-span-2">
                <label className="label py-2">
                  <span className="label-text font-medium text-gray-700">
                    Deskripsi (opsional)
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors"
                  rows={3}
                  placeholder="Deskripsi warehouse"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value || undefined,
                    })
                  }
                />
              </div>

              {/* Warehouse Access */}
              {userInfo.role == ROLE.ADMIN_ORGANIZATION && (
                <>
                  <div className="form-control md:col-span-2">
                    <label className="label py-2">
                      <div className="flex flex-col space-y-1">
                        <span className="label-text font-medium text-gray-700 flex items-center">
                          <Stamp className="w-4 h-4 mr-2 text-leaf-green-500" />
                          Warehouse Access
                        </span>
                        <p className="text-xs text-gray-500">
                          (member pasti bisa login ke warehousenya sendiri tapi
                          tidak dengan warehouse lain kecuali termasuk ke
                          warehouse akses)
                        </p>
                      </div>
                    </label>

                    {/* Selected access  */}
                    {selectedAccess.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedAccess.map((username) => (
                          <div
                            key={username}
                            className="flex items-center gap-2 px-3 py-1.5 bg-leaf-green-50 border border-leaf-green-200 rounded-lg"
                          >
                            <span className="text-sm font-medium text-leaf-green-800">
                              {username}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveAccessWarehouse(username)
                              }
                              className="p-0.5 hover:bg-leaf-green-100 rounded-full transition-colors"
                              title="Hapus anggota"
                            >
                              <XCircle className="w-4 h-4 text-leaf-green-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Search Input for Adding Members */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari user untuk ditambahkan..."
                        className="input input-bordered w-full bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100 transition-colors pr-10"
                        value={searchKeyAccess || ""}
                        onChange={(e) => setSearchKeyAccess(e.target.value)}
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />

                      {/* Dropdown results */}
                      {searchKeyAccess && accounts && accounts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {accounts
                            .filter(
                              (account: TokenPayload) =>
                                !selectedAccess.includes(account.username)
                            )
                            .map((account: TokenPayload) => (
                              <button
                                type="button"
                                onClick={() => {
                                  handleAddAccessWarehouse(account.username);
                                  setSearchKeyAccess("");
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-leaf-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                key={account.username}
                              >
                                <div className="font-medium text-gray-800">
                                  {account.username}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  User
                                </div>
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Empty state */}
                      {searchKeyAccess && accounts && accounts.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                          <div className="text-center text-gray-500">
                            <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">User tidak ditemukan</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Status */}
                  <div className="form-control md:col-span-2">
                    <label className="label cursor-pointer  text-white ">
                      <input
                        type="checkbox"
                        className="checkbox bg-teal-300 border-gray-300 checked:border-leaf-green-500 checked:bg-leaf-green-500"
                        checked={formData.isActive ?? true}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                      />
                      <span className="label-text font-medium text-teal-700 ">
                        Status Aktif
                      </span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="modal-action pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors px-4"
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
                "Tambah Warehouse"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
