"use client";

import type React from "react";

import { Suspense, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  WarehouseIcon,
  MapPin,
  Users,
  Search,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WarehouseApi } from "@/api/warehouse.api";
import type { Warehouse, WarehouseFilter } from "@/types/warehouse";
import WarehouseModalForm from "@/components/admin/warehouseModalForm";
import PaginationFullTable from "@/components/shared-common/PaginationFullTable";
import Loading from "@/components/shared-common/Loading";

const initialFormData: Warehouse = {
  name: "",
  location: "",
  description: "",
  userWarehouseAccesses: [],
  isActive: true,
};

export default function AllWarehousePage() {
  const sanitizeString = (value?: string | null) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const [filter, setFilter] = useState<WarehouseFilter>({
    searchKey: "",
    page: 1,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Warehouse>(initialFormData);
  const queryClient = useQueryClient();

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ["all-warehouse", filter],
    queryFn: () => WarehouseApi.getWarehouses(filter),
    retry: 1,
    staleTime: 30000,
  });

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...initialFormData });
  };

  const createMutation = useMutation({
    mutationFn: async (body: Warehouse) =>
      await WarehouseApi.createWarehouse(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-warehouse"] });
      toast.success("Warehouse berhasil ditambahkan");
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menambahkan warehouse";
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Warehouse) =>
      await WarehouseApi.updateWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-warehouse"] });
      toast.success("Warehouse berhasil diperbarui");
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui warehouse";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await WarehouseApi.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-warehouse"] });
      toast.success("Warehouse berhasil dihapus");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus warehouse";
      toast.error(errorMessage);
    },
  });

  const handleOpenEdit = (warehouse?: Warehouse) => {
    if (warehouse && warehouse.id) {
      setFormData({
        name: warehouse.name || "",
        location: warehouse.location || "",
        description: warehouse.description || "",
        userWarehouseAccesses: warehouse.userWarehouseAccesses.map(
          (u: any) => u.username,
        ),
        isActive: warehouse.isActive ?? true,
      });
      setEditingId(warehouse.id);
    } else {
      setFormData({ ...initialFormData });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Nama warehouse harus diisi");
      return;
    }

    const payload: Warehouse = {
      name: formData.name.trim(),
      location: sanitizeString(formData.location),
      description: sanitizeString(formData.description),
      userWarehouseAccesses: formData.userWarehouseAccesses || [],
      isActive: formData.isActive ?? true,
    };

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus warehouse ini? Tindakan ini tidak dapat dibatalkan.",
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const getMembersCount = (warehouse: Warehouse) => {
    if (!warehouse.homeMembers) return 0;
    if (Array.isArray(warehouse.homeMembers)) {
      return warehouse.homeMembers?.length;
    }
    return 0;
  };

  const getAccessCount = (warehouse: Warehouse) => {
    if (!warehouse.userWarehouseAccesses) return 0;
    if (Array.isArray(warehouse?.userWarehouseAccesses)) {
      return warehouse.userWarehouseAccesses?.length;
    }
    return 0;
  };

  const getDocksCount = (warehouse: Warehouse) => {
    if (!warehouse.docks) return 0;
    if (Array.isArray(warehouse.docks)) {
      return warehouse.docks?.length;
    }
    return 0;
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col">
          <main className="flex-1 pb-12 flex-col">
            <div className="min-h-screen bg-gray-50 p-6">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Manajemen Warehouse
                      </h1>
                      <p className="text-gray-600">
                        Kelola warehouse dan informasi gudang
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenEdit()}
                      className="btn bg-primary text-primary-content px-4"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Tambah Warehouse
                    </button>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg border border-gray-200  mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Cari brand.."
                          className="input input-bordered w-full pl-10 bg-white border-gray-300 focus:border-leaf-green-300 focus:ring-2 focus:ring-leaf-green-100"
                          value={filter.searchKey}
                          onChange={(e) =>
                            setFilter({
                              searchKey: e.target.value,
                              page: 1,
                            })
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
                  ) : warehouses?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <WarehouseIcon className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-sm max-w-md">
                        {filter.searchKey
                          ? "Coba ubah kata kunci pencarian atau filter yang digunakan"
                          : "Mulai dengan menambahkan warehouse pertama Anda"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                      <table className="table w-full">
                        <thead className="sticky top-0 z-10 backdrop-blur">
                          <tr className="border-b border-leaf-green-100">
                            <th className="font-semibold text-gray-700 py-4 px-4">
                              Nama Warehouse
                            </th>
                            <th className="font-semibold text-gray-700 py-4 px-4">
                              Lokasi
                            </th>
                            <th className="font-semibold text-gray-700 py-4 px-4">
                              Deskripsi
                            </th>
                            <th className="font-semibold text-gray-700 py-4 px-4">
                              Jumlah Dock
                            </th>
                            <th className="font-semibold text-gray-700 py-4 px-4 ">
                              Home Members
                            </th>
                            <th className="font-semibold text-gray-700 py-4 px-4">
                              Access Warehouse
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
                          {warehouses.map((warehouse, index) => (
                            <tr
                              key={warehouse.id}
                              className={`hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? "bg-gray-25" : "bg-white"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <WarehouseIcon className="w-4 h-4 text-leaf-green-500 flex-shrink-0" />
                                  <span className="font-semibold text-gray-800">
                                    {warehouse.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {warehouse.location ? (
                                  <div className="flex items-center space-x-1 text-gray-700">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">
                                      {warehouse.location}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700 max-w-xs">
                                {warehouse.description ? (
                                  <span className="text-sm line-clamp-2">
                                    {warehouse.description}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-1 text-gray-700">
                                  <span className="font-medium text-sm">
                                    {getDocksCount(warehouse)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-1 text-gray-700">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-sm">
                                    {getMembersCount(warehouse)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-1 text-gray-700">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-sm">
                                    {getAccessCount(warehouse)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    warehouse.isActive
                                      ? "bg-leaf-green-100 text-leaf-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                      warehouse.isActive
                                        ? "bg-leaf-green-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                  {warehouse.isActive ? "Aktif" : "Tidak Aktif"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleOpenEdit(warehouse)}
                                    className="btn btn-sm btn-ghost hover:bg-leaf-green-50 hover:text-leaf-green-600 text-gray-500 transition-colors"
                                    title="Edit warehouse"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(warehouse.id)}
                                    className="btn btn-sm btn-ghost hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors"
                                    title="Hapus warehouse"
                                  >
                                    <Trash2 size={16} />
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

                {/* Pagination */}
                <PaginationFullTable
                  data={warehouses}
                  filter={filter}
                  isLoading={isLoading}
                  setFilter={setFilter}
                  key={"PaginationFullTable"}
                />
              </div>
            </div>
          </main>
        </div>

        <WarehouseModalForm
          createMutation={createMutation}
          editingId={editingId}
          formData={formData}
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          isModalOpen={isModalOpen}
          setFormData={setFormData}
          updateMutation={updateMutation}
          key={"warehouse-modal"}
        />
      </div>
    </Suspense>
  );
}
