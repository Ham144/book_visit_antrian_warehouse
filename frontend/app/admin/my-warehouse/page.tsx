"use client";
import React, { useEffect, useState } from "react";
import {
  Edit,
  Filter,
  WarehouseIcon,
  Users,
  Calendar,
  UserCheck,
  Search,
  X,
  PanelLeftDashedIcon,
  LucideSettings2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WarehouseApi } from "@/api/warehouse.api";
import { toast } from "sonner";
import { useUserInfo } from "@/components/UserContext";
import WarehouseModalForm from "@/components/admin/warehouseModalForm";
import { Warehouse } from "@/types/warehouse";
import { Booking, BookingFilter } from "@/types/booking.type";
import { BookingApi } from "@/api/booking.api";
import { BookingStatus } from "@/types/shared.type";
import QueueDetailModal, {
  getStatusBadgeColor,
  getStatusIcon,
  getStatusLabel,
} from "@/components/admin/QueueDetailModal";
import PaginationFullTable from "@/components/shared-common/PaginationFullTable";
import MyWarehouseActionModal from "@/components/admin/my-warehouse-action-modal";

const MyWarehousePage = () => {
  const { userInfo, socket } = useUserInfo();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [now, setNow] = useState(() => new Date());

  const bookingFilterQueueInit: BookingFilter = {
    date: null,
    page: 1,
    searchKey: "",
    warehouseId: userInfo?.homeWarehouse?.id,
    status: "PENDING",
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
    enabled: !!userInfo?.homeWarehouse?.id,
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings", filter],
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

  const [showFilters, setShowFilters] = useState(false);

  const statusDisplayMap: Record<string, string> = {
    all: "Semua",
    PENDING: "PENDING",
    CANCELED: "CANCELED",
    FINISHED: "FINISHED",
    IN_PROGRESS: "IN_PROGRESS",
    UNLOADING: "UNLOADING",
  };

  const statusOptions = [
    { value: "all", label: "Semua" },
    { value: "PENDING", label: "PENDING" },
    { value: "IN_PROGRESS", label: "IN_PROGRESS" },
    { value: "UNLOADING", label: "UNLOADING" },
    { value: "FINISHED", label: "FINISHED" },
    { value: "CANCELED", label: "CANCELED" },
  ];

  const sortOptions = [
    { value: "createdAt-desc", label: "Terbaru" },
    { value: "createdAt-asc", label: "Terlama" },
    { value: "bookingDate-desc", label: "Tanggal Booking (Terbaru)" },
    { value: "bookingDate-asc", label: "Tanggal Booking (Terlama)" },
    { value: "updatedAt-desc", label: "Update Terbaru" },
  ];

  const handleStatusChange = (status: string) => {
    setFilter({
      ...filter,
      status: status as BookingFilter["status"],
      page: 1,
    });
  };

  const handleSearchChange = (value: string) => {
    setFilter({
      ...filter,
      searchKey: value || null,
      page: 1,
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-") as [
      BookingFilter["sortBy"],
      BookingFilter["sortOrder"]
    ];
    setFilter({ ...filter, sortBy, sortOrder });
  };

  const handleDateChange = (type: "weekStart" | "weekEnd", value: string) => {
    setFilter({
      ...filter,
      [type]: value,
      page: 1,
    });
  };

  const clearDateFilter = () => {
    setFilter({
      ...filter,
      weekStart: undefined,
      weekEnd: undefined,
      page: 1,
    });
  };

  const clearSearchFilter = () => {
    setFilter({
      ...filter,
      searchKey: null,
      page: 1,
    });
  };

  const hasActiveFilters =
    filter.searchKey ||
    (filter.status && filter.status !== "all") ||
    filter.weekStart ||
    filter.weekEnd ||
    filter.sortBy !== "createdAt" ||
    filter.sortOrder !== "desc";
  //socket
  useEffect(() => {
    if (!socket || !userInfo?.homeWarehouse?.id) return;

    const warehouseId = userInfo.homeWarehouse.id;

    const handleConnect = () => {
      socket.emit("join_warehouse", {
        warehouseId,
      });
    };

    const handleFindAllRefetch = () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
    };

    if (socket.connected) {
      socket.emit("join_warehouse", {
        warehouseId,
      });
    }

    socket.on("connect", handleConnect);
    socket.on("find-all", handleFindAllRefetch);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("find-all", handleFindAllRefetch);
      if (socket.connected) {
        socket.emit("leave_warehouse", {
          warehouseId,
        });
      }
    };
  }, [socket, queryClient, userInfo?.homeWarehouse?.id]);

  if (isLoading || isLoadingBookings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex ">
      <main className="flex-1 container p-3 ">
        <div className=" min-h-screen bg-gray-50 ">
          <div className=" mx-auto">
            {/* FILTER section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Bookings
                  </h2>
                  <p className="text-sm text-gray-500">
                    Total:{" "}
                    <span className="font-medium text-gray-900">
                      {bookings?.length ?? 0}
                    </span>{" "}
                    booking
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors border ${
                    showFilters
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                  }`}
                >
                  <Filter size={14} />
                  {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                </button>

                {myWarehouse && (
                  <button
                    onClick={handleOpenEdit}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Warehouse
                  </button>
                )}
              </div>
            </div>

            {/* Status Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto pb-1 hide-scrollbar">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`flex-shrink-0 px-4 py-2 text-xs font-medium rounded-t-lg transition-all duration-200 relative ${
                      filter.status === option.value
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {option.label}
                    {filter.status === option.value && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 "></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Quick Actions Row */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan code atau Driver Username..."
                  value={filter.searchKey || ""}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {filter.searchKey && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={`${filter.sortBy || "createdAt"}-${
                    filter.sortOrder || "desc"
                  }`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[160px]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Rentang Tanggal
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <input
                        type="date"
                        value={filter.weekStart || ""}
                        onChange={(e) =>
                          handleDateChange("weekStart", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500 block">Mulai</span>
                    </div>
                    <div className="space-y-1">
                      <input
                        type="date"
                        value={filter.weekEnd || ""}
                        onChange={(e) =>
                          handleDateChange("weekEnd", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500 block">
                        Sampai
                      </span>
                    </div>
                  </div>
                  {(filter.weekStart || filter.weekEnd) && (
                    <button
                      onClick={clearDateFilter}
                      className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <X size={12} />
                      Hapus filter tanggal
                    </button>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status Saat Ini
                  </label>
                  <div className="p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Filter aktif:
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          hasActiveFilters
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {hasActiveFilters ? "Aktif" : "Tidak aktif"}
                      </span>
                    </div>
                    {filter.status && filter.status !== "all" && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Status terpilih:
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {statusDisplayMap[filter.status]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Filter Terpakai
                  </label>
                  <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-white rounded-md border border-gray-200">
                    {filter.status && filter.status !== "all" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {statusDisplayMap[filter.status]}
                        <button
                          onClick={() => handleStatusChange("all")}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )}
                    {filter.searchKey && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {filter.searchKey}
                        <button
                          onClick={clearSearchFilter}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )}
                    {filter.weekStart && filter.weekEnd && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {filter.weekStart} → {filter.weekEnd}
                        <button
                          onClick={clearDateFilter}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )}
                    {!hasActiveFilters && (
                      <span className="text-sm text-gray-500 italic self-center">
                        Tidak ada filter yang aktif
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TABLE Section */}
            <div className="rounded-lg border border-gray-200">
              {bookings?.length > 0 ? (
                <div>
                  {/* Header Table (Fixed) */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Booking Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Vehicle & Driver
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Schedule
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Dock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  {/* Body Table (Scrollable) */}
                  <div className="overflow-x-auto max-h-[60vh] min-h-[60vh] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="bg-white divide-y divide-gray-100">
                        {bookings.map((booking: any) => (
                          <tr
                            key={booking.id}
                            className="hover:bg-gray-50 transition-colors duration-150 relative"
                          >
                            {/* Booking Code */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-bold text-gray-900">
                                  {booking.code}
                                  {booking.notes && (
                                    <div
                                      className="text-xs text-gray-500 mt-1 truncate max-w-[150px]"
                                      title={booking.notes}
                                    >
                                      <div className="flex items-center gap-x-1">
                                        <PanelLeftDashedIcon size={12} />{" "}
                                        {booking.notes}
                                      </div>
                                    </div>
                                  )}
                                  {booking.canceledReason && (
                                    <div className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded mt-1 absolute">
                                      ❗ {booking.canceledReason}
                                    </div>
                                  )}
                                </p>
                              </div>
                            </td>

                            {/* Vehicle & Driver */}
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-blue-600 font-bold">
                                    {booking.Vehicle?.brand?.charAt(0) || "V"}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.Vehicle?.brand || "N/A"}
                                    <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      {booking.Vehicle?.vehicleType || "N/A"}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    <span className="flex items-center mt-1">
                                      <span className="mr-1">👤</span>
                                      {booking.driver?.displayName ||
                                        booking.driverUsername ||
                                        "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Schedule */}
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  Arrival:{" "}
                                  {new Date(
                                    booking.arrivalTime
                                  ).toLocaleDateString("id-ID", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  {new Date(
                                    booking.arrivalTime
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {booking.estimatedFinishTime && (
                                    <>
                                      <span className="mx-1">→</span>
                                      {new Date(
                                        booking.estimatedFinishTime
                                      ).toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </>
                                  )}
                                </div>
                                {booking.actualArrivalTime && (
                                  <div className="text-green-600 text-xs mt-1 font-medium">
                                    ✅ Actual:{" "}
                                    {new Date(
                                      booking.actualArrivalTime
                                    ).toLocaleTimeString("id-ID")}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Duration */}
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                {booking.Vehicle?.durasiBongkar ? (
                                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                                    ⏱️ {booking.Vehicle.durasiBongkar} min
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </td>

                            {/* Dock */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium">
                                  🏗️ {booking.Dock?.name || "N/A"}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap ">
                              <div className="flex w-28 flex-col gap-1">
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeColor(
                                    booking.status
                                  )}`}
                                >
                                  <span>{getStatusIcon(booking.status)}</span>
                                  <span>{getStatusLabel(booking.status)}</span>
                                </div>
                              </div>
                            </td>

                            {/* Organization */}
                            <td className="px-6 py-4 ">
                              <div className="text-sm w-24">
                                <button
                                  onClick={() => {
                                    setSelectedBookingId(booking.id);
                                    (
                                      document.getElementById(
                                        "my-warehouse-action-modal"
                                      ) as HTMLDialogElement
                                    )?.showModal();
                                  }}
                                  className="btn "
                                >
                                  <LucideSettings2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-3">📅</div>
                  <p className="text-gray-500 font-medium">
                    No bookings available
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Start by creating a new booking
                  </p>
                </div>
              )}
            </div>
            <PaginationFullTable
              data={bookings}
              filter={filter}
              isLoading={isLoadingBookings}
              setFilter={setFilter}
              key={"my-warehouse-pagination"}
            />
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
      <MyWarehouseActionModal
        selectedBooking={
          bookings && selectedBookingId
            ? (bookings as Booking[]).find((b) => b.id === selectedBookingId)
            : undefined
        }
        onModifyAndConfirm={() => {
          if (!selectedBookingId) return;
          (document.getElementById("create") as HTMLDialogElement)?.showModal();
        }}
      />
      <QueueDetailModal
        selectedBookingId={selectedBookingId || ""}
        setSelectedBookingId={setSelectedBookingId}
        setNow={setNow}
        key={"QueueDetailModalCreate"}
        mode="create"
      />
    </div>
  );
};

export default MyWarehousePage;
