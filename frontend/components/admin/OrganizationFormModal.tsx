import { AuthApi } from "@/api/auth";
import { UserInfo } from "@/types/auth";
import { Organization } from "@/types/organization";
import { BaseProps } from "@/types/shared.type";
import { MutateFunction, useQuery } from "@tanstack/react-query";
import { Search, X, Users, Building, Server, Network } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast, Toaster } from "sonner";

interface OrganizationFormModalProps {
  formData: Organization;
  setFormData: Dispatch<SetStateAction<Organization>>;
  onEdit: MutateFunction;
  onCreate: MutateFunction;
  //state
  isPendingEdit: boolean;
  isPendingCreate: boolean;
}

const OrganizationFormModal = ({
  formData,
  setFormData,
  onCreate,
  onEdit,
  //state
  isPendingCreate,
  isPendingEdit,
}: OrganizationFormModalProps) => {
  const [accountsFilter, setAccountsFilter] = useState<BaseProps>({
    page: 1,
    searchKey: "",
  });

  const { data: filteredUsers } = useQuery({
    queryKey: ["accounts", accountsFilter],
    queryFn: async () =>
      await AuthApi.getAllAccountForMemberManagement(accountsFilter),
    enabled: accountsFilter.searchKey !== "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.isEditing) {
      onEdit();
    } else {
      onCreate();
    }
  };

  const handleAddAccount = (user: UserInfo) => {
    if (!formData.accounts.find((acc) => acc.username === user.username)) {
      setFormData((prev) => ({
        ...prev,
        accounts: [...prev.accounts, user],
      }));
    } else toast("user sudah ditambahkan");
    setAccountsFilter((prev) => ({
      ...prev,
      searchKey: "",
    }));
  };

  const handleRemoveAccount = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((acc) => acc.username !== userId),
    }));
  };

  return (
    <dialog id="OrganizationFormModal" className="modal">
      <div className="modal-box w-full max-w-2xl p-0 overflow-hidden bg-white overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white">
                {formData.isEditing
                  ? "Edit Organization"
                  : "Tambah Organization Baru"}
              </h3>
            </div>
            <button
              onClick={() =>
                (
                  document.getElementById(
                    "OrganizationFormModal",
                  ) as HTMLDialogElement
                ).close()
              }
              className="btn btn-sm btn-circle btn-ghost hover:bg-white/20 text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4 ">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-800">Informasi Dasar</h4>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-teal-500" />
                  Nama Organization *
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full bg-white border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                placeholder="Nama organization"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Active Directory Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-800">
                Active Directory{" "}
                <span className="text-xs">
                  (lewati untuk mempertahankan nilai sebelumnya)
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Server className="w-4 h-4 mr-2 text-purple-500" />
                    AD Host
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  placeholder="ldap.example.com"
                  value={formData.AD_HOST || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AD_HOST: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">
                    AD Port
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  placeholder="389"
                  value={formData.AD_PORT || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AD_PORT: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">
                    AD Domain
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  placeholder="example.com"
                  value={formData.AD_DOMAIN || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AD_DOMAIN: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700 flex items-center">
                    <Network className="w-4 h-4 mr-2 text-purple-500" />
                    AD Base DN
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  placeholder="DC=example,DC=com"
                  value={formData.AD_BASE_DN || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AD_BASE_DN: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Accounts Management */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-4 bg-green-500 rounded-full"></div>
              <h4 className="font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-500" />
                Akun Member
              </h4>
            </div>

            {/* Selected Accounts Preview */}
            {formData.accounts?.length > 0 && (
              <div className="grid grid-cols-3 gap-1 ">
                {formData.accounts.map((account) => (
                  <div
                    key={account.username}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg justify-between"
                  >
                    <span className="text-sm font-medium text-green-800">
                      {account.displayName || account.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(account.username!)}
                      className="p-1 hover:bg-green-100 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-green-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search and Add Accounts */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">
                  Tambah User
                </span>
              </label>
              <div className="relative border px-2 font-bold">
                <input
                  type="text"
                  placeholder="Cari username atau nama..."
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 pr-10"
                  value={accountsFilter.searchKey}
                  onChange={(e) =>
                    setAccountsFilter((prev) => ({
                      ...prev,
                      searchKey: e.target.value,
                    }))
                  }
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                {/* Search Results Dropdown */}
                {accountsFilter.searchKey && filteredUsers?.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {filteredUsers.map((user: UserInfo) => (
                      <button
                        type="button"
                        onClick={() => handleAddAccount(user)}
                        className="w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                        key={user.username}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm font-medium">
                            {(user.displayName || user.username)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {user.displayName || user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.username}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                (
                  document.getElementById(
                    "OrganizationFormModal",
                  ) as HTMLDialogElement
                ).close()
              }
              className="btn btn-ghost text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              disabled={isPendingCreate || isPendingEdit}
              type="submit"
              className="btn bg-teal-600 border-teal-600 text-white hover:bg-teal-700 hover:border-teal-700 px-3"
            >
              {formData.isEditing ? "Perbarui" : "Simpan"} Organization
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </dialog>
  );
};

export default OrganizationFormModal;
