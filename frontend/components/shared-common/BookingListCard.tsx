import { Booking, BookingStatus } from "@/types/booking.type";
import React, { SetStateAction, Dispatch } from "react";

interface BookingListCardProps {
  booking: Booking;
  setSelectedBookingId: any;
  selectedBookingId: string | null;
}

const BookingListCard = ({
  booking,
  setSelectedBookingId,
  selectedBookingId,
}: BookingListCardProps) => {
  return (
    <div
      key={booking.id}
      onClick={(e) => {
        setSelectedBookingId(
          selectedBookingId === booking.id ? null : booking.id
        );
        (
          document.getElementById("DetailBookingModal") as HTMLDialogElement
        ).showModal();
        setSelectedBookingId(booking.id);
      }}
      className="flex items-center p-3 bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {/* Status Indicator */}
      <div
        className="w-2 h-10 mr-3 rounded-full flex-shrink-0"
        style={{
          backgroundColor:
            BookingStatus[booking.status] === BookingStatus.IN_PROGRESS
              ? "#fbbf24"
              : BookingStatus[booking.status] === BookingStatus.FINISHED
              ? "#10b981"
              : BookingStatus[booking.status] === BookingStatus.CANCELED
              ? "#ef4444"
              : "#3b82f6",
        }}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 truncate">
              {booking.code}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                BookingStatus[booking.status] === BookingStatus.IN_PROGRESS
                  ? "bg-yellow-100 text-yellow-800"
                  : BookingStatus[booking.status] === BookingStatus.FINISHED
                  ? "bg-green-100 text-green-800"
                  : BookingStatus[booking.status] === BookingStatus.CANCELED
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {BookingStatus[booking.status]}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {new Date(booking.arrivalTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600 gap-4">
          <span className="truncate max-w-[120px]">
            👤 {booking.driverUsername}
          </span>
          <span>
            ⏱️{" "}
            {booking.arrivalTime && booking.estimatedFinishTime
              ? `${Math.round(
                  (new Date(booking.estimatedFinishTime).getTime() -
                    new Date(booking.arrivalTime).getTime()) /
                    (1000 * 60)
                )}m`
              : "-"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 ml-2">
        {booking.status !== "CANCELED" && booking.status !== "FINISHED" && (
          <button
            className="btn btn-xs btn-ghost text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBookingId(booking.id);
              (
                document.getElementById(
                  "cancel-confirmation"
                ) as HTMLDialogElement
              ).showModal();
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingListCard;
