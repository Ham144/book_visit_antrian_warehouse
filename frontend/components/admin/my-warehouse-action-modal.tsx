import { BookingApi } from "@/api/booking.api";
import { Booking, UpdateBookingStatus } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";
import ConfirmationWithInput from "../shared-common/ConfirmationWithInput";
import { ArrowRight, Edit2, X } from "lucide-react";

interface MyWarehouseActionModalProps {
  selectedBooking?: Booking;
  onModifyAndConfirm?: (bookingId: string) => void;
}

const MyWarehouseActionModal = ({
  selectedBooking,
  onModifyAndConfirm,
}: MyWarehouseActionModalProps) => {
  const [canceledReason, setCanceledReason] = useState<string>("");
  const queryClient = useQueryClient();

  const { mutateAsync: handleUpdateStatus, isPending } = useMutation({
    mutationKey: ["booking", selectedBooking?.id],
    mutationFn: async (payload: UpdateBookingStatus) =>
      BookingApi.updateBookingStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      toast.success("Booking berhasil dikonfirmasi");
      (
        document.getElementById(
          "my-warehouse-action-modal"
        ) as HTMLDialogElement
      )?.close();
    },
    onError: (er: any) => {
      toast.error(er?.response?.data?.message || "Gagal mengupdate booking");
    },
  });

  const { mutateAsync: handleCancel } = useMutation({
    mutationKey: ["bookings"],
    mutationFn: async () => {
      if (!selectedBooking?.id || !canceledReason) {
        toast.error("Mohon isi alasan pembatalan");
        throw new Error("Mohon isi alasan pembatalan");
      }
      await BookingApi.cancelBooking(selectedBooking.id, canceledReason);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      setCanceledReason("");
      toast.success("Booking berhasil dibatalkan");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message);
    },
  });

  return (
    <dialog id="my-warehouse-action-modal" className="modal">
      <div className="modal-box w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">
                Booking Actions
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                ID:{" "}
                <span className="font-mono text-gray-700">
                  {selectedBooking?.id || "N/A"}
                </span>
              </p>
            </div>
          </div>

          {selectedBooking?.status && (
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                selectedBooking.status === BookingStatus.PENDING
                  ? "bg-yellow-100 text-yellow-800"
                  : selectedBooking.status === BookingStatus.IN_PROGRESS
                  ? "bg-blue-100 text-blue-800"
                  : selectedBooking.status === BookingStatus.FINISHED
                  ? "bg-green-100 text-green-800"
                  : selectedBooking.status === BookingStatus.CANCELED
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {selectedBooking.status.replace("_", " ")}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          {selectedBooking?.status === BookingStatus.PENDING && (
            <button
              className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              onClick={() => {
                if (!selectedBooking?.id) return;
                handleUpdateStatus({
                  id: selectedBooking.id,
                  status: BookingStatus.IN_PROGRESS,
                });
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="font-semibold text-gray-900">
                    Confirm Booking
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Start processing this booking
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {selectedBooking?.status !== BookingStatus.FINISHED &&
            selectedBooking?.status !== BookingStatus.CANCELED && (
              <button
                className="group  flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl hover:from-red-100 hover:to-red-200 hover:border-red-300 hover:shadow-md transition-all duration-200"
                onClick={() => {
                  (
                    document.getElementById(
                      "cancel-confirmation"
                    ) as HTMLDialogElement
                  )?.showModal();
                  (
                    document.getElementById(
                      "my-warehouse-action-modal"
                    ) as HTMLDialogElement
                  )?.close();
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <X />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900">
                      Cancel Booking
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      Cancel this booking request
                    </p>
                  </div>
                </div>
                <ArrowRight />
              </button>
            )}

          {selectedBooking?.status == BookingStatus.PENDING && (
            <button
              className={`group flex items-center justify-between p-4 border rounded-xl transition-all duration-200 ${
                !selectedBooking?.id || !onModifyAndConfirm
                  ? "bg-gray-100 border-gray-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 hover:shadow-md"
              }`}
              disabled={!selectedBooking?.id || !onModifyAndConfirm}
              onClick={() => {
                if (!selectedBooking?.id || !onModifyAndConfirm) return;
                onModifyAndConfirm(selectedBooking.id);
                (
                  document.getElementById(
                    "my-warehouse-action-modal"
                  ) as HTMLDialogElement
                )?.close();
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg shadow-sm ${
                    !selectedBooking?.id || !onModifyAndConfirm
                      ? "bg-gray-200"
                      : "bg-white"
                  }`}
                >
                  <Edit2 className={"w-5 h-5 text-purple-600 "} />
                </div>
                <div className="text-left">
                  <span
                    className={`font-semibold ${
                      !selectedBooking?.id || !onModifyAndConfirm
                        ? "text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    Modify & Confirm Booking
                  </span>
                  <p
                    className={`text-xs mt-1 ${
                      !selectedBooking?.id || !onModifyAndConfirm
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Edit details before confirming
                  </p>
                </div>
              </div>
              {!selectedBooking?.id || !onModifyAndConfirm ? (
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          )}

          <button className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900">Chat Driver</span>
                <p className="text-xs text-gray-600 mt-1">
                  Communicate with the driver
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-green-400 group-hover:text-green-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              (
                document.getElementById(
                  "my-warehouse-action-modal"
                ) as HTMLDialogElement
              )?.close();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-xl border border-gray-300 hover:border-gray-400 hover:shadow-sm transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Close
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Select an action to proceed with this booking</span>
          </div>
        </div>
      </div>

      <ConfirmationWithInput
        modalId="cancel-confirmation"
        message="Konfirmasi Pembatalan. tuliskan suatu alasan"
        onConfirm={handleCancel}
        title={"Apakaha kamu yakin akan membatalkan Booking ini? "}
        input={canceledReason}
        setInput={setCanceledReason}
        key={"cancel-confirmation"}
      />
    </dialog>
  );
};

export default MyWarehouseActionModal;
