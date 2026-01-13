import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import React, { SetStateAction, Dispatch } from "react";

interface BookingListCardProps {
  booking: Booking;
  setSelectedBookingId: any;
  selectedBookingId: string | null;
}

//ini untuk /vendor/history
const BookingListCard = ({
  booking,
  setSelectedBookingId,
  selectedBookingId,
}: BookingListCardProps) => {
  const calculateDuration = () => {
    if (!booking.arrivalTime || !booking.estimatedFinishTime) return "-";
    const arrival = new Date(booking.arrivalTime);
    const finish = new Date(booking.estimatedFinishTime);
    const duration = Math.round(
      (finish.getTime() - arrival.getTime()) / (1000 * 60)
    );
    return `${duration}m`;
  };

  const formatTime = (timeString: Date | null) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = () => {
    const status = BookingStatus[booking.status];
    switch (status) {
      case BookingStatus.IN_PROGRESS:
        return {
          bgColor: "#fbbf24",
          textClass: "bg-yellow-100 text-yellow-800",
          label: "Dalam Proses",
          icon: "🔄",
        };
      case BookingStatus.FINISHED:
        return {
          bgColor: "#10b981",
          textClass: "bg-green-100 text-green-800",
          label: "Selesai",
          icon: "✅",
        };
      case BookingStatus.CANCELED:
        return {
          bgColor: "#ef4444",
          textClass: "bg-red-100 text-red-800",
          label: "Dibatalkan",
          icon: "❌",
        };
      default:
        return {
          bgColor: "#3b82f6",
          textClass: "bg-blue-100 text-blue-800",
          label: "Menunggu",
          icon: "⏳",
        };
    }
  };

  const statusInfo = getStatusInfo();

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
      className="flex items-center p-4 bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer rounded-lg shadow-sm"
    >
      {/* Status Indicator */}
      <div
        className="w-2 h-14 mr-4 rounded-full flex-shrink-0"
        style={{ backgroundColor: statusInfo.bgColor }}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 truncate text-lg">
              {booking.code}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.textClass}`}
            >
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              🕐 {formatTime(booking.arrivalTime)}
            </span>
            {booking.actualArrivalTime && (
              <span className="text-xs text-gray-500">
                (Tiba: {formatTime(booking.actualArrivalTime)})
              </span>
            )}
          </div>
        </div>

        {/* Driver & Vehicle Info */}
        <div className="flex items-center text-sm text-gray-700 gap-4 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">👤</span>
            <span className="font-medium truncate max-w-[150px]">
              {booking.driver?.displayName || booking.driverUsername}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">🚚</span>
            <span className="font-medium">
              {booking.Vehicle?.brand} - {booking.Vehicle?.vehicleType}
            </span>
          </div>
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">⏱️</span>
            <span>Durasi: {calculateDuration()}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-500">📦</span>
            <span>Bongkar: {booking.Vehicle?.durasiBongkar || 0}m</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-500">🏭</span>
            <span className="truncate">
              Warehouse: {booking.warehouseId?.slice(0, 8)}...
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-500">📍</span>
            <span className="truncate">Dock: {booking?.Dock?.name}</span>
          </div>
        </div>

        {/* Finish Time */}
        {BookingStatus[booking.status] === BookingStatus.IN_PROGRESS && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-gray-500">🏁 Estimasi Selesai:</span>
            <span className="font-medium text-gray-700">
              {formatTime(booking.estimatedFinishTime)}
            </span>
            {booking.actualFinishTime && (
              <span className="text-green-600 ml-2">
                ✓ Selesai: {formatTime(booking.actualFinishTime)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 ml-4">
        {booking.status !== "CANCELED" && booking.status !== "FINISHED" && (
          <button
            className="btn btn-sm btn-outline btn-error text-red-600 text-white hover:bg-red-50"
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
            Batalkan
          </button>
        )}

        {/* View Details Button */}
        <button
          className="btn btn-sm btn-ghost text-gray-600 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedBookingId(booking.id);
            (
              document.getElementById("DetailBookingModal") as HTMLDialogElement
            ).showModal();
          }}
        >
          Detail
        </button>
      </div>
    </div>
  );
};

export default BookingListCard;
