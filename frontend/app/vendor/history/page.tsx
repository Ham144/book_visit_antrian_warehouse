"use client";

import { QrCode, Edit, X, Truck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ConfirmationModal from "@/components/shared-common/confirmationModal";
import { BookingFilter } from "@/types/booking.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookingApi } from "@/api/booking.api";

const mockBookings = [
  {
    id: "BK-001234",
    date: "2025-11-12",
    time: "09:00",
    warehouse: "Gudang Jakarta Barat",
    slot: "Dock A",
    status: "completed" as const,
    plate: "B1234CD",
    duration: "45 menit",
  },
  {
    id: "BK-005678",
    date: "2025-11-15",
    time: "10:30",
    warehouse: "Gudang Jakarta Barat",
    slot: "Dock B",
    status: "confirmed" as const,
    plate: "B5678EF",
    duration: "60 menit",
  },
  {
    id: "BK-009012",
    date: "2025-11-18",
    time: "14:00",
    warehouse: "Gudang Jakarta Barat",
    slot: "Gate 1",
    status: "pending" as const,
    plate: "B9012GH",
    duration: "30 menit",
  },
];

const statusText = {
  completed: "Selesai",
  confirmed: "Dikonfirmasi",
  pending: "Menunggu",
  cancelled: "Dibatalkan",
};

const statusColors = {
  completed: "badge-success",
  confirmed: "badge-primary",
  pending: "badge-warning",
  cancelled: "badge-error",
};

export default function HistoryPage() {
  const [selectedBookingId, setSelectedBookingId] = useState<string>(null);

  const [bookedFilter, setBookedFitler] = useState<BookingFilter>({
    searchKey: "",
    warehouseId: null,
  });

  const { data: bookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => await BookingApi.getAllBookings(bookedFilter),
    enabled: !!selectedBookingId,
  });

  const qq = useQueryClient();
  const { mutateAsync: handleCancel } = useMutation({
    mutationKey: ["bookings"],
    mutationFn: async () => {
      await BookingApi.cancelBooking(selectedBookingId || "");
    },
    onSuccess: async () => {
      toast.success("Pemesanan berhasil dibatalkan");
      qq.invalidateQueries({
        queryKey: ["bookings"],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Riwayat Pemesanan</h1>
          <p className="text-gray-600">Lihat semua pemesanan Anda</p>
        </div>

        <div className="space-y-4">
          {mockBookings.length === 0 ? (
            <div className="card bg-white shadow">
              <div className="card-body text-center py-12">
                <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Belum ada pemesanan</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {mockBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="card bg-white shadow hover:shadow-lg transition"
                  onClick={() =>
                    setSelectedBookingId(
                      selectedBookingId === booking.id ? null : booking.id
                    )
                  }
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold">{booking.id}</span>
                          <span
                            className={`badge ${statusColors[booking.status]}`}
                          >
                            {statusText[booking.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {booking.warehouse}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{booking.date}</p>
                        <p className="text-sm text-gray-600">{booking.time}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Slot</p>
                          <p className="font-semibold">{booking.slot}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Plat</p>
                          <p className="font-semibold">{booking.plate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Durasi</p>
                          <p className="font-semibold">{booking.duration}</p>
                        </div>
                      </div>
                    </div>

                    {selectedBookingId === booking.id && (
                      <div className="flex gap-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              className="btn btn-sm btn-error btn-outline flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBookingId(booking.id);
                                (
                                  document.getElementById(
                                    "confirmation1"
                                  ) as HTMLDialogElement
                                )?.showModal();
                              }}
                            >
                              <X size={16} /> Batal
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        message=""
        onConfirm={handleCancel}
        title={"Apakaha kamu yakin akan membatalkan Booking ini? "}
        key={"confirmation1"}
      />
    </div>
  );
}
