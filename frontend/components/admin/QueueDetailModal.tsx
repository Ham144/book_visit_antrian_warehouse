import { BookingApi } from "@/api/booking.api";
import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import PreviewSlotDisplay from "../vendor/PreviewSlotDisplay";

export const getStatusBadgeColor = (status?: BookingStatus) => {
  switch (status) {
    case BookingStatus.IN_PROGRESS:
      return "badge-info";
    case BookingStatus.UNLOADING:
      return "badge-warning";
    case BookingStatus.FINISHED:
      return "badge-success";
    case BookingStatus.CANCELED:
      return "badge-error";
    default:
      return "badge-ghost";
  }
};

// Get status label
export const getStatusLabel = (status?: BookingStatus) => {
  switch (status) {
    case BookingStatus.IN_PROGRESS:
      return "In Progress";
    case BookingStatus.UNLOADING:
      return "Unloading";
    case BookingStatus.FINISHED:
      return "Finished";
    case BookingStatus.CANCELED:
      return "Canceled";
    default:
      return "Unknown";
  }
};

interface QueueDetailModalProps {
  selectedBookingId: string;
  setSelectedBookingId: Dispatch<SetStateAction<string | null>>;
  id: "QueueDetailModalPreview" | "QueueDetailModalJustify";
}

const QueueDetailModal = ({
  setSelectedBookingId,
  selectedBookingId,
  id,
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
      const justifyData = {
        arrivalTime: selectedBooking.arrivalTime,
        notes: selectedBooking.notes,
        // Include other fields required by the justifyBooking API
        ...selectedBooking,
      };

      return await BookingApi.justifyBooking(selectedBookingId, justifyData);
    },
    onSuccess: () => {
      toast.success("Booking berhasil diupdate");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", selectedBookingId],
      });

      const modal = document.getElementById(id) as HTMLDialogElement;
      modal?.close();

      setSelectedBookingId(null);
      setSelectedBooking(null);
      setIsFormModified(false);
    },
    onError: (error: any) => {
      console.error("Justify booking error:", error);
      toast.error(error?.response?.data?.message || "Gagal mengupdate booking");
    },
  });

  // Handle modal close
  const handleClose = () => {
    const modal = document.getElementById(id) as HTMLDialogElement;
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

    if (!isFormModified && id === "QueueDetailModalJustify") {
      toast.info("Tidak ada perubahan untuk diupdate");
      return;
    }

    try {
      await justifyBooking();
    } catch (error) {
      // Error handled in mutation
    }
  };

  if (isLoading && selectedBookingId) {
    return (
      <dialog id={id} className="modal">
        <div className="modal-box max-w-6xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </div>
      </dialog>
    );
  }

  return (
    <dialog id={id} className="modal" onClose={handleClose}>
      <div className="modal-box max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-none flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Detail Booking</h3>
          {isFormModified && id == "QueueDetailModalJustify" && (
            <span className="badge badge-warning badge-sm">
              Ada perubahan yang belum disimpan
            </span>
          )}
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Code</p>
              <p className="font-semibold">
                {selectedBooking?.code || selectedBooking?.id || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`badge ${getStatusBadgeColor(
                  selectedBooking?.status
                )}`}
              >
                {getStatusLabel(selectedBooking?.status)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Driver</p>
              <p className="font-semibold">
                {selectedBooking?.driverUsername || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle</p>
              <p className="font-semibold">
                {selectedBooking?.Vehicle?.brand || "N/A"}
                {selectedBooking?.Vehicle?.vehicleType
                  ? ` (${selectedBooking.Vehicle.vehicleType})`
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dock</p>
              <p className="font-semibold">
                {selectedBooking?.Dock?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Arrival Time</p>
              <p className="font-semibold">
                {selectedBooking?.arrivalTime
                  ? new Date(selectedBooking.arrivalTime).toLocaleString(
                      "id-ID"
                    )
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Notes</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-800">
                {selectedBooking?.notes || "Tidak ada catatan"}
              </p>
            </div>
          </div>

          {/* Time Slot Section */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Time Slot</p>
            <PreviewSlotDisplay
              formData={selectedBooking}
              onUpdateFormData={handleUpdateFormData}
              mode={id === "QueueDetailModalJustify" ? "justify" : "preview"}
              currentBookingId={selectedBooking?.id}
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

              {id === "QueueDetailModalJustify" && (
                <button
                  type="button"
                  className="btn btn-primary text-white min-w-[200px]"
                  onClick={handleJustifyClick}
                  disabled={isJustifying || !isFormModified}
                >
                  {isJustifying ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    "Update Booking"
                  )}
                </button>
              )}
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
