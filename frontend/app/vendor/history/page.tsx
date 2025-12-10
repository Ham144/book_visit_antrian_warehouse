"use client";

import { QrCode, Edit, X, Truck, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ConfirmationModal from "@/components/shared-common/confirmationModal";
import { Booking, BookingFilter, BookingStatus } from "@/types/booking.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookingApi } from "@/api/booking.api";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [selectedBookingId, setSelectedBookingId] = useState<string>(null);

  const [bookedFilter, setBookedFitler] = useState<BookingFilter>({
    searchKey: "",
    warehouseId: null,
  });

  const { data: bookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => await BookingApi.getAllBookings(bookedFilter),
  });

  const router = useRouter();
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
          {bookings?.length === 0 ? (
            <div className="card bg-white shadow">
              <div className="card-body text-center py-12">
                <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Belum ada pemesanan</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings?.map((booking: Booking) => (
                <div
                  key={booking.id}
                  className="card bg-white shadow hover:shadow-lg transition border border-teal-100 hover:border-teal-300"
                  onClick={() =>
                    setSelectedBookingId(
                      selectedBookingId === booking.id ? null : booking.id
                    )
                  }
                >
                  <div className="card-body p-4">
                    {/* Header dengan ID dan Status */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-teal-600 font-medium">
                            #{booking.counterId || booking.id.substring(0, 8)}
                          </span>
                          <span
                            className={`badge badge-sm px-2 ${
                              BookingStatus[booking.status] ===
                              BookingStatus.IN_PROGRESS
                                ? "badge-warning"
                                : BookingStatus[booking.status] ===
                                  BookingStatus.FINISHED
                                ? "badge-success"
                                : BookingStatus[booking.status] ===
                                  BookingStatus.CANCELED
                                ? "badge-error"
                                : "badge-info"
                            }`}
                          >
                            {BookingStatus[booking.status] ===
                            BookingStatus.IN_PROGRESS
                              ? "Berlangsung"
                              : BookingStatus[booking.status] ===
                                BookingStatus.FINISHED
                              ? "Selesai"
                              : BookingStatus[booking.status] ===
                                BookingStatus.CANCELED
                              ? "Dibatalkan"
                              : booking.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-teal-800">
                          {booking.organizationName || "N/A"}
                        </p>
                      </div>

                      {/* Waktu Booking */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-teal-900">
                          {new Date(booking.arrivalTime).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </p>
                        <p className="text-xs text-teal-600">
                          {new Date(booking.arrivalTime).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Informasi Utama */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-teal-50 p-3 rounded-lg">
                        <p className="text-xs text-teal-600 mb-1">
                          Waktu Kedatangan
                        </p>
                        <p className="text-sm font-semibold text-teal-900">
                          {new Date(booking.arrivalTime).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <div className="bg-teal-50 p-3 rounded-lg">
                        <p className="text-xs text-teal-600 mb-1">
                          Estimasi Selesai
                        </p>
                        <p className="text-sm font-semibold text-teal-900">
                          {booking.estimatedFinishTime
                            ? new Date(
                                booking.estimatedFinishTime
                              ).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </p>
                      </div>

                      <div className="bg-teal-50 p-3 rounded-lg">
                        <p className="text-xs text-teal-600 mb-1">Durasi</p>
                        <p className="text-sm font-semibold text-teal-900">
                          {booking.arrivalTime && booking.estimatedFinishTime
                            ? `${Math.round(
                                (new Date(
                                  booking.estimatedFinishTime
                                ).getTime() -
                                  new Date(booking.arrivalTime).getTime()) /
                                  (1000 * 60)
                              )} menit`
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Informasi Tambahan */}
                    <div className="border-t border-teal-100 pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-xs text-teal-600">Dock ID</p>
                          <p className="font-medium text-teal-800">
                            {booking.dockId?.substring(0, 8) || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-teal-600">Kendaraan</p>
                          <p className="font-medium text-teal-800">
                            {booking.vehicleId?.substring(0, 8) || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-teal-600">Driver</p>
                          <p className="font-medium text-teal-800">
                            {booking.driverUsername || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Aksi (hanya muncul jika booking dipilih) */}
                    {selectedBookingId === booking.id && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-teal-100">
                        {BookingStatus[booking.status] === "IN_PROGRESS" && (
                          <button
                            className="btn btn-sm btn-error btn-outline flex-1 border-teal-200 hover:bg-teal-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBookingId(booking.id);
                              (
                                document.getElementById(
                                  "cancel_modal"
                                ) as HTMLDialogElement
                              )?.showModal();
                            }}
                          >
                            <X size={16} /> Batalkan Booking
                          </button>
                        )}

                        {BookingStatus[booking.status] !== "CANCELLED" &&
                          BookingStatus[booking.status] !== "COMPLETED" && (
                            <button
                              className="btn btn-sm btn-teal btn-outline flex-1 border-teal-300 hover:bg-teal-600 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Aksi untuk detail booking
                                router.push(`/booking/detail/${booking.id}`);
                              }}
                            >
                              <Eye size={16} /> Detail
                            </button>
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
        modalId="cancel-confirmation"
        message="Konfirmasi Pembatalan ?"
        onConfirm={handleCancel}
        title={"Apakaha kamu yakin akan membatalkan Booking ini? "}
        key={"cancel-confirmation"}
      />
    </div>
  );
}
