"use client";
import { AuthApi } from "@/api/auth";
import UserEditModalForm from "@/components/admin/UserEditModalForm";
import { UserInfo } from "@/types/auth";
import { UserApp } from "@/types/user.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Edit,
  IdCardIcon,
  Plus,
  Search,
  Trash2,
  User,
  User2,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface MemberManagementFilter {
  searchKey: string;
  page: number;
}

const MemberManagementPage = () => {
  const [formData, setFormData] = useState<UserApp>({
    username: "",
    password: "",
    passwordConfirm: "",
    description: "",
    homeWarehouseId: "",
    displayName: "",
    driverLicense: "",
    driverPhone: "",
    isActive: true,
  });
  const [filter, setFilter] = useState<MemberManagementFilter>({
    searchKey: "",
    page: 1,
  });

  const qc = useQueryClient();
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["member-management", filter],
    queryFn: () =>
      AuthApi.getAllAccountForMemberManagement(filter.page, filter.searchKey),
  });

  const { mutateAsync: handleCreateAppUser } = useMutation({
    mutationKey: ["member-management"],
    mutationFn: async () => {
      const { passwordConfirm, ...res } = formData;
      const data = AuthApi.createAppUser(res);
      return data;
    },
    onSuccess: () => {
      (document.getElementById("UserEditModalForm") as any)?.close();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message);
    },
  });

  const handleUpdateUser = () => {};

  const handleOpenEdit = (user?: UserInfo) => {
    setFormData({
      id: user?.id || "",
      username: user?.username || "",
      password: "",
      passwordConfirm: "",
      description: user?.description || "",
      homeWarehouseId: user?.homeWarehouse.id || "",
      displayName: user?.displayName || "",
      driverLicense: user?.driverLicense || "",
      driverPhone: user?.driverPhone || "",
      isActive: user?.isActive || false,
    });
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
                      Manajemen Member and access
                    </h1>
                    <p className="text-gray-600">
                      Kelola member dan hak akses warehouse disini
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      (
                        document.getElementById(
                          "UserEditModalForm"
                        ) as HTMLDialogElement
                      )?.showModal()
                    }
                    className="btn  btn-primary px-3 "
                  >
                    <Plus /> Buat Baru
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
                ) : accounts.length === 0 ? (
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
                            Nama Warehouse
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Deskripsi
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Warehouse
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4 ">
                            Home
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Access User
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Status
                          </th>
                          <th className="font-semibold text-gray-700 py-4 px-4">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((account: UserInfo, index) => (
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
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-700 max-w-xs">
                              {account.homeWarehouse ? (
                                <span className="text-sm line-clamp-2">
                                  {account.homeWarehouse.name}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-1 text-gray-700">
                                <span className="font-medium text-sm">
                                  {account.warehouseAccess.length}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-1 text-gray-700">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-sm">
                                  {account.warehouseAccess.length}
                                </span>
                              </div>
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
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleOpenEdit(account)}
                                  className="btn btn-sm btn-ghost hover:bg-leaf-green-50 hover:text-leaf-green-600 text-gray-500 transition-colors"
                                  title="Edit user"
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
        submitUpdate={handleUpdateUser}
        key={"UserEditModalForm"}
      />
    </div>
  );
};

export default MemberManagementPage;
