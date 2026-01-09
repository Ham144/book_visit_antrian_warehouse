"use client";
import React, { useState } from "react";
import {
  Edit,
  WarehouseIcon,
  Users,
  Calendar,
  UserCheck,
  Search,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WarehouseApi } from "@/api/warehouse.api";
import { toast } from "sonner";
import { useUserInfo } from "@/components/UserContext";
import WarehouseModalForm from "@/components/admin/warehouseModalForm";
import { Warehouse } from "@/types/warehouse";
import { BookingFilter } from "@/types/booking.type";

const MyWarehousePage = () => {
  const { userInfo } = useUserInfo();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const bookingFilterQueueInit: BookingFilter = {
    date: null,
    page: 1,
    searchKey: "",
    warehouseId: userInfo?.homeWarehouse?.id,
  };

  const [filter, setFilter] = useState<BookingFilter>(bookingFilterQueueInit);

  const [formData, setFormData] = React.useState<Warehouse>({
    name: "",
    location: "",
    description: "",
    userWarehouseAccesses: [],
    isActive: true,
  });

  const warehouseId = userInfo?.homeWarehouse?.id;

  const { data: myWarehouse, isLoading } = useQuery({
    queryKey: ["my-warehouse", warehouseId],
    queryFn: async () => {
      if (!warehouseId) return null;
      return await WarehouseApi.getWarehouse(warehouseId);
    },
    enabled: !!warehouseId,
  });

  const handleClose = () => {
    setIsModalOpen(false);
    if (myWarehouse) {
      setFormData({
        name: myWarehouse.name || "",
        location: myWarehouse.location || "",
        description: myWarehouse.description || "",
        userWarehouseAccesses: myWarehouse.userWarehouseAccesses || [],
        isActive: myWarehouse.isActive ?? true,
      });
    }
  };

  const handleOpenEdit = () => {
    if (myWarehouse) {
      setFormData({
        name: myWarehouse.name || "",
        location: myWarehouse.location || "",
        description: myWarehouse.description || "",
        userWarehouseAccesses: myWarehouse.userWarehouseAccesses || [],
        isActive: myWarehouse.isActive ?? true,
      });
      setIsModalOpen(true);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Warehouse) => {
      if (!warehouseId) throw new Error("Warehouse ID tidak ditemukan");
      return await WarehouseApi.updateWarehouse({
        id: warehouseId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-warehouse"] });
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

  const createMutation = {
    isPending: false,
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!myWarehouse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Warehouse tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const userWarehouseAccesses =
    (myWarehouse as any).userWarehouseAccesses || [];
  const bookings = myWarehouse.bookings || [];
  const members = myWarehouse.userWarehouseAccesses || [];

  return (
    <div className="flex ">
      <main className="flex-1 p-6">
        <div className="min-h-screen bg-gray-50 ">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    My warehouse Record
                  </h1>
                  <p className="text-gray-600">
                    Kelola data terkait warehouse saat ini
                  </p>
                </div>
                <button
                  onClick={handleOpenEdit}
                  className="btn btn-primary px-3"
                >
                  <Edit size={16} className="mr-2" /> Edit Warehouse
                </button>
              </div>
            </div>

            {/* Warehouse Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-leaf-green-100 rounded-lg">
                    <WarehouseIcon className="w-6 h-6 text-leaf-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {myWarehouse.name}
                    </h2>
                    {myWarehouse.location && (
                      <p className="text-sm text-gray-500">
                        {myWarehouse.location}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`badge ${
                    myWarehouse.isActive ? "badge-success" : "badge-error"
                  }`}
                >
                  {myWarehouse.isActive ? "Aktif" : "Tidak Aktif"}
                </div>
              </div>
              {myWarehouse.description && (
                <p className="text-gray-600 mt-4">{myWarehouse.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Members Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-leaf-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Members
                  </h3>
                  <span className="badge badge-primary">{members.length}</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {members.length > 0 ? (
                    members.map((member: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.displayName || member.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {member.username}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Tidak ada members</p>
                  )}
                </div>
              </div>

              {/* Warehouse Access Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <UserCheck className="w-5 h-5 text-leaf-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Warehouse Access
                  </h3>
                  <span className="badge badge-primary">
                    {userWarehouseAccesses.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userWarehouseAccesses.length > 0 ? (
                    userWarehouseAccesses.map((access: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {access.displayName || access.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {access.username}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Tidak ada user dengan akses
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bookings Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-leaf-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Bookings
                </h3>
                <span className="badge badge-primary">{bookings.length}</span>
              </div>
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filter.searchKey || ""}
                  onChange={(e) =>
                    setFilter({ ...filter, searchKey: e.target.value })
                  }
                  className="w-full pl-8 pr-6 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="overflow-x-auto">
                {bookings.length > 0 ? (
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Dock</th>
                        <th>Arrival Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <p className="font-medium">
                                {booking.Vehicle?.brand ||
                                  booking.Vehicle?.jenisKendaraan ||
                                  "N/A"}
                              </p>
                            </div>
                          </td>
                          <td>{booking.Dock?.name || "N/A"}</td>
                          <td>
                            {booking.arrivalTime
                              ? new Date(booking.arrivalTime).toLocaleString(
                                  "id-ID"
                                )
                              : "N/A"}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                booking.status === "finished"
                                  ? "badge-success"
                                  : booking.status === "in_progress"
                                  ? "badge-warning"
                                  : booking.status === "waiting"
                                  ? "badge-info"
                                  : "badge-error"
                              }`}
                            >
                              {booking.status || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-sm">Tidak ada bookings</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <WarehouseModalForm
        createMutation={createMutation}
        editingId={warehouseId || null}
        formData={formData}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        isModalOpen={isModalOpen}
        setFormData={setFormData}
        updateMutation={updateMutation}
        key={"my-warehouse-modal"}
      />
    </div>
  );
};

export default MyWarehousePage;
