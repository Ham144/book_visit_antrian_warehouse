import { BookingApi } from "@/api/booking.api";
import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import PreviewSlotDisplay from "../vendor/PreviewSlotDisplay";
import { Calendar, Clock, MessageSquare } from "lucide-react";
// Versi statis yang lebih cantik dengan warna dan styling yang lebih menarik
export const getStatusBadgeColor = (status?: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return "bg-blue-100 text-blue-800 border border-blue-200 shadow-sm";
    case BookingStatus.IN_PROGRESS:
      return "bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm";
    case BookingStatus.UNLOADING:
      return "bg-amber-100 text-amber-800 border border-amber-200 shadow-sm";
    case BookingStatus.FINISHED:
      return "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm";
    case BookingStatus.CANCELED:
      return "bg-rose-100 text-rose-800 border border-rose-200 shadow-sm";
    case BookingStatus.DELAYED:
      return "bg-red-100 text-red-800 border border-red-200 shadow-sm";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200 shadow-sm";
  }
};

// Get status label yang sudah diperbaiki (ada typo di kode sebelumnya)
export const getStatusLabel = (status?: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return "Pending";
    case BookingStatus.IN_PROGRESS:
      return "In Progress";
    case BookingStatus.UNLOADING:
      return "Unloading";
    case BookingStatus.FINISHED:
      return "Finished";
    case BookingStatus.CANCELED:
      return "Canceled";
    case BookingStatus.DELAYED:
      return "Delayed";
    default:
      return "Unknown";
  }
};

// Fungsi tambahan untuk mendapatkan ikon (opsional)
export const getStatusIcon = (status?: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return "⏳";
    case BookingStatus.IN_PROGRESS:
      return "🚚";
    case BookingStatus.UNLOADING:
      return "📦";
    case BookingStatus.FINISHED:
      return "✅";
    case BookingStatus.CANCELED:
      return "❌";
    case BookingStatus.DELAYED:
      return "⚠️";
    default:
      return "❓";
  }
};

interface QueueDetailModalProps {
  selectedBookingId: string;
  setSelectedBookingId: Dispatch<SetStateAction<string | null>>;
  mode: "create" | "justify"; //craete no filter
  setNow?: Dispatch<Date>; //untuk triger kategorisasi ulang booking delayed
}

const QueueDetailModal = ({
  setSelectedBookingId,
  selectedBookingId,
  mode,
  setNow,
}: QueueDetailModalProps) => {
  const queryClient = useQueryClient();

  // Local state for form data
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isFormModified, setIsFormModified] = useState(false);

  // Fetch booking detail
  const { data: bookingData, isLoading } = useQuery({
    queryKey: ["booking-detail", selectedBookingId],
    queryFn: async () => {
      if (!selectedBookingId) return null;
      return await BookingApi.getDetailById(selectedBookingId);
    },
    enabled: !!selectedBookingId,
  });

  // Handle form data updates from PreviewSlotDisplay
  const handleUpdateFormData = (data: Partial<Booking>) => {
    setSelectedBooking((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };

      // Check if form was modified
      const isModified = Object.keys(data).some(
        (key) => prev[key as keyof Booking] !== data[key as keyof Booking]
      );

      if (isModified) {
        setIsFormModified(true);
      }

      return updated;
    });
  };

  // Justify booking mutation
  const { mutateAsync: justifyBooking, isPending: isJustifying } = useMutation({
    mutationFn: async () => {
      if (!selectedBookingId || !selectedBooking) {
        throw new Error("Booking data is missing");
      }

      // Only send necessary data for the justify API
      const justifyData: Partial<Booking> = {
        arrivalTime: selectedBooking.arrivalTime,
        estimatedFinishTime: selectedBooking.estimatedFinishTime,
        notes: selectedBooking.notes,
        dockId: selectedBooking.dockId,
        status: BookingStatus.IN_PROGRESS,
      };

      return await BookingApi.justifyBooking(selectedBookingId, justifyData);
    },
    onSuccess: () => {
      toast.success("Booking berhasil diupdate");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", selectedBookingId],
      });

      const modal = document.getElementById(mode) as HTMLDialogElement;
      modal?.close();

      setSelectedBookingId(null);
      setSelectedBooking(null);
      setIsFormModified(false);
      setNow(new Date());
    },
    onError: (error: any) => {
      console.error("Justify booking error:", error);
      toast.error(error?.response?.data?.message || "Gagal mengupdate booking");
    },
  });

  // Handle modal close
  const handleClose = () => {
    const modal = document.getElementById(mode) as HTMLDialogElement;
    modal?.close();

    // Reset states
    setSelectedBookingId(null);
    setSelectedBooking(null);
    setIsFormModified(false);
  };

  // Handle justify button click
  const handleJustifyClick = async () => {
    if (!selectedBookingId || !selectedBooking) {
      toast.error("Data booking tidak lengkap");
      return;
    }

    if (!isFormModified && mode === "justify") {
      toast.info("Tidak ada perubahan untuk diupdate");
      return;
    }

    try {
      await justifyBooking();
    } catch (error: any) {
      toast.error(error?.message);
      // Error handled in mutation
    }
  };

  // Update local state when booking data changes
  useEffect(() => {
    if (bookingData) {
      setSelectedBooking(bookingData);
      setIsFormModified(false);
    }
  }, [bookingData]);

  // Reset when modal closes or bookingId changes
  useEffect(() => {
    if (!selectedBookingId) {
      setSelectedBooking(null);
      setIsFormModified(false);
    }
  }, [selectedBookingId]);

  if (isLoading && selectedBookingId) {
    return (
      <dialog id={mode} className="modal">
        <div className="modal-box max-w-6xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </div>
      </dialog>
    );
  }

  return (
    <dialog id={mode} className="modal" onClose={handleClose}>
      <div className="modal-box max-w-6xl max-h-[90vh] flex flex-col">
        {/* Ultra Compact Header */}
        <div className="flex-none border-b pb-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">
                Booking Code {selectedBooking?.code || "N/A"}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {isFormModified && mode === "justify" && (
                <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded animate-pulse">
                  ⚠️ Unsaved
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded ${getStatusBadgeColor(
                  BookingStatus[selectedBooking?.status]
                )}`}
              >
                {getStatusLabel(BookingStatus[selectedBooking?.status])}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Info Cards */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {/* Key Info Row */}
          <div className="grid grid-cols-4 gap-1 text-xs">
            <div className="bg-gray-50 p-1.5 rounded border">
              <div className="text-gray-500 truncate">Driver</div>
              <div
                className="font-semibold truncate"
                title={selectedBooking?.driverUsername}
              >
                {selectedBooking?.driverUsername?.split("@")[0] || "—"}
              </div>
            </div>
            <div className="bg-gray-50 p-1.5 rounded border">
              <div className="text-gray-500 truncate">Vehicle</div>
              <div
                className="font-semibold truncate"
                title={`${selectedBooking?.Vehicle?.brand} ${
                  selectedBooking?.Vehicle?.vehicleType || ""
                }`}
              >
                {selectedBooking?.Vehicle?.brand ? (
                  <>
                    {selectedBooking.Vehicle.brand.slice(0, 8)}
                    {selectedBooking.Vehicle.vehicleType && (
                      <span className="text-gray-500 text-[10px]">
                        {" "}
                        ({selectedBooking.Vehicle.vehicleType.slice(0, 3)})
                      </span>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-1.5 rounded border">
              <div className="text-gray-500 truncate">Dock</div>
              <div
                className="font-semibold truncate"
                title={selectedBooking?.Dock?.name}
              >
                {selectedBooking?.Dock?.name?.slice(0, 8) || "—"}
              </div>
            </div>
            <div className="bg-gray-50 p-1.5 rounded border">
              <div className="text-gray-500 truncate">Book Time</div>
              <div className="font-semibold">
                {selectedBooking?.arrivalTime ? (
                  <>
                    <div className="text-[10px] text-gray-600">
                      {new Date(selectedBooking.arrivalTime).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )}
                    </div>
                    <div className="text-[10px]">
                      {new Date(selectedBooking.arrivalTime).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>

          {/* Notes Chip */}
          {selectedBooking?.notes && (
            <div className="flex items-start gap-1 bg-blue-50 border border-blue-200 rounded p-1.5">
              <MessageSquare className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-700 mb-0.5">
                  Catatan:
                </p>
                <p className="text-xs text-blue-900 line-clamp-2 leading-tight">
                  {selectedBooking.notes}
                </p>
              </div>
            </div>
          )}

          {/* Duration Badge */}
          {selectedBooking?.Vehicle?.durasiBongkar && (
            <div className="flex items-center justify-between text-xs bg-gray-100 rounded px-2 py-1">
              <span className="text-gray-600">⏱️ Durasi Bongkar:</span>
              <span className="font-semibold">
                {selectedBooking.Vehicle.durasiBongkar} menit
              </span>
            </div>
          )}

          {/* Time Slot - Minimal Header */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  Jadwal Slot
                </span>
              </div>
              {mode === "justify" && (
                <span className="text-[10px] text-gray-500">✏️ Edit mode</span>
              )}
            </div>
            <PreviewSlotDisplay
              formData={(selectedBooking ?? bookingData) as Booking}
              onUpdateFormData={handleUpdateFormData}
              mode={mode === "justify" ? "justify" : "create"}
              currentBookingId={selectedBooking?.id ?? bookingData?.id}
            />
          </div>
        </div>

        {/* Fixed Footer at Bottom */}
        <div className="modal-action mt-6 pt-4 border-t border-gray-200 flex-none">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-3">
              <button
                type="button"
                className="btn btn-outline border-gray-300 hover:bg-gray-50 font-medium"
                onClick={handleClose}
              >
                Close
              </button>

              <button
                type="button"
                className="btn disabled:bg-slate-200 btn-primary text-white min-w-[200px]"
                onClick={handleJustifyClick}
                disabled={isJustifying || !isFormModified}
              >
                {isJustifying ? (
                  <>
                    <span className="loading loading-spinner loading-xs mr-2"></span>
                    Processing...
                  </>
                ) : (
                  "Update Booking & Konfirmasi"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toaster */}
      <Toaster position="bottom-right" />
    </dialog>
  );
};

export default QueueDetailModal;
