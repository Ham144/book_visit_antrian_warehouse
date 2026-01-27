"use client";
import { AuthApi } from "@/api/auth";
import ConfirmationModal from "@/components/shared-common/confirmationModal";
import UserEditModalForm from "@/components/shared-common/UserEditModalForm";
import { useUserInfo } from "@/components/UserContext";
import { UserApp } from "@/types/auth";
import { ROLE } from "@/types/shared.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  IdCardIcon,
  Plus,
  Search,
  Trash2,
  User,
  User2,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface MemberManagementFilter {
  searchKey: string;
  page: number;
}

const MemberManagementPage = () => {
  const { userInfo } = useUserInfo();

  if (userInfo?.homeWarehouse) redirect("/admin/member-management");

  const initialUserAPP: UserApp = {
    username: "",
    password: "",
    passwordConfirm: "",
    description: "",
    displayName: "",
    homeWarehouseId: "",
    isActive: true,
    organizationName: "",
    warehouseAccess: [],
    driverLicense: "",
    accountType: "APP",
    driverPhone: "",
    role: ROLE.DRIVER_VENDOR,
    vendorName: userInfo?.vendorName,
  };
  const [formData, setFormData] = useState<UserApp>(initialUserAPP);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<MemberManagementFilter>({
    searchKey: "",
    page: 1,
  });

  const router = useRouter();

  const qc = useQueryClient();
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["users", filter],
    queryFn: () =>
      AuthApi.getVendorMemberOnly({
        page: filter.page,
        searchKey: filter.searchKey,
      }),
  });

  const { mutateAsync: handleCreateAppUser } = useMutation({
    mutationKey: ["users"],
    mutationFn: async () => {
      const { passwordConfirm, ...res } = formData;
      const data = AuthApi.createAppUser(res);
      return data;
    },
    onSuccess: () => {
      (document.getElementById("UserEditModalForm") as any)?.close();
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message);
    },
  });

  const { mutateAsync: handleUpdateUser } = useMutation({
    mutationKey: ["users"],
    mutationFn: async () => await AuthApi.updateAccount(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      (document.getElementById("UserEditModalForm") as any)?.close();
    },
    onError: (er: any) => {
      toast.error(
        er?.response?.data?.message || "gagal mengupdate data member"
      );
    },
  });

  const [selectedUser, setSelectedUser] = useState<UserApp | undefined>();

  const { mutateAsync: handleDeleteAppUser } = useMutation({
    mutationKey: ["delete-app-user", "users"],
    mutationFn: async () => await AuthApi.deleteAppUser(selectedUser?.username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      (document.getElementById("delete-app-user") as any)?.close();
    },
    onError: async (er: any) => {
      toast.error(er?.response?.data?.message || "gagal menghapus data member");
      (document.getElementById("delete-app-user") as any)?.close();
    },
  });

  const handleOpenEdit = (user?: UserApp) => {
    setFormData(user);
    (document.getElementById("UserEditModalForm") as any)?.showModal();
  };

  return (
    <div className="min-h-screen ">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Manajemen Member Saya
                    </h1>
                    <p className="text-gray-600">
                      Kelola member dan driver disini
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreating(true);
                      setFormData(initialUserAPP);
                      (
                        document.getElementById(
                          "UserEditModalForm"
                        ) as HTMLDialogElement
                      )?.showModal();
                    }}
                    className="btn  btn-primary px-3 "
                  >
                    <Plus /> Buat Member
                  </button>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari username user"
                        className="input input-bordered w-full pl-10 bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100"
                        value={filter.searchKey}
                        onChange={(e) =>
                          setFilter((f) => ({
                            ...f,
                            searchKey: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <span className="loading loading-spinner loading-lg text-leaf-green-500"></span>
                      <p className="text-gray-500 text-sm">
                        Memuat data warehouse...
                      </p>
                    </div>
                  </div>
                ) : accounts?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <User className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-sm max-w-md">
                      {filter.searchKey
                        ? "Coba ubah kata kunci pencarian atau filter yang digunakan"
                        : "Mulai dengan menambahkan warehouse pertama Anda"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr className="bg-leaf-green-50 border-b border-leaf-green-100">
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Username
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Deskripsi
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Account Type
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Active
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts?.length ? (
                          accounts?.map((account: UserApp, index) => (
                            <tr
                              key={index}
                              className={`hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? "bg-gray-25" : "bg-white"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <User2 className="w-4 h-4 text-leaf-green-500 flex-shrink-0" />
                                  <span className="font-semibold text-gray-800">
                                    {account.username}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {account.description ? (
                                  <div className="flex items-center space-x-1 text-gray-700">
                                    <IdCardIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">
                                      {account.description}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700 max-w-xs">
                                {account.accountType ? (
                                  <span className="text-sm line-clamp-2">
                                    {account.accountType || "-"}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    bagian vendor
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    account.isActive
                                      ? "bg-leaf-green-100 text-leaf-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                      account.isActive
                                        ? "bg-leaf-green-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                  {account.isActive ? "Aktif" : "Tidak Aktif"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1 items-center gap-x-2">
                                  <button
                                    onClick={() => {
                                      handleOpenEdit(account);
                                    }}
                                    className="btn btn-sm btn-ghost hover:bg-leaf-green-50 hover:text-leaf-green-600 text-gray-500 transition-colors"
                                    title="Edit user"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(account);
                                      (
                                        document.getElementById(
                                          "delete-app-user"
                                        ) as HTMLDialogElement
                                      )?.showModal();
                                    }}
                                    className={`btn text-red-400 font-bold  ${
                                      account.homeWarehouse ? "" : ""
                                    } hover:bg-red-50 hover:text-red-600 transition-colors`}
                                  >
                                    <Trash2 className="w-4 h-4 " />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-4">
                              Tidak ada data
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <UserEditModalForm
        formData={formData}
        setFormData={setFormData}
        submitCreate={handleCreateAppUser}
        isCreating={isCreating}
        submitUpdate={handleUpdateUser}
        key={"UserEditModalForm"}
      />
      <ConfirmationModal
        message="Apakah anda yakin ingin menghapus user ini ?"
        modalId="delete-app-user"
        onConfirm={handleDeleteAppUser}
        title="konfirmasi delete-app-user?"
        key={"delete-app-user"}
      />
    </div>
  );
};

export default MemberManagementPage;
