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
import { BookingApi } from "@/api/booking.api";

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

  const { data: myWarehouse, isLoading } = useQuery({
    queryKey: ["my-warehouse", userInfo, filter],
    queryFn: async () => {
      if (!filter.warehouseId) return null;
      return await WarehouseApi.getWarehouse(filter);
    },
    enabled: !!userInfo?.homeWarehouse.id,
  });

  const { data: bookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      return await BookingApi.getAllBookingsList(filter);
    },
    enabled: !!userInfo,
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
      if (!filter.warehouseId) throw new Error("Warehouse ID tidak ditemukan");
      return await WarehouseApi.updateWarehouse({
        id: filter.warehouseId,
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

  return (
    <div className="flex ">
      <main className="flex-1 p-6">
        <div className="min-h-screen bg-gray-50 ">
          <div className="max-w-7xl mx-auto">
            {/* Header */}

            {/* Warehouse Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-leaf-green-100 rounded-lg">
                    <WarehouseIcon className="w-6 h-6 text-leaf-green-600" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {myWarehouse?.name}
                    </h2>
                    {myWarehouse?.location && (
                      <p className="text-sm text-gray-500">
                        {myWarehouse?.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-x-2">
                  <button
                    onClick={handleOpenEdit}
                    className="btn btn-primary px-3"
                  >
                    <Edit size={16} className="mr-2" /> Edit Warehouse
                  </button>
                </div>
              </div>
              {myWarehouse.description && (
                <p className="text-gray-600 mt-4">{myWarehouse.description}</p>
              )}
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
              <div className="overflow-x-auto  max-h-[70vh] overflow-y-auto">
                {bookings.length > 0 ? (
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Code</th>
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
                                {booking?.code || booking.code}
                              </p>
                            </div>
                          </td>
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
        editingId={filter.warehouseId || null}
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
