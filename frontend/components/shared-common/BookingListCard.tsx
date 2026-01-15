import { Booking } from "@/types/booking.type";
import { BookingStatus, ROLE } from "@/types/shared.type";
import { useUserInfo } from "../UserContext";

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
  const { userInfo } = useUserInfo();

  // Format waktu untuk mobile friendly
  const formatTime = (timeString: Date | null) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hitung durasi
  const calculateDuration = () => {
    if (!booking.arrivalTime || !booking.estimatedFinishTime) return "-";
    const arrival = new Date(booking.arrivalTime);
    const finish = new Date(booking.estimatedFinishTime);
    const duration = Math.round(
      (finish.getTime() - arrival.getTime()) / (1000 * 60)
    );
    return `${duration}m`;
  };

  // Status info dengan icon emoji yang lebih baik
  const getStatusInfo = () => {
    const status = BookingStatus[booking.status];
    switch (status) {
      case BookingStatus.IN_PROGRESS:
        return {
          textClass: "bg-yellow-100 text-yellow-800",
          label: "In Progress",
          icon: "🔄",
        };
      case BookingStatus.FINISHED:
        return {
          textClass: "bg-green-100 text-green-800",
          label: "Selesai",
          icon: "✅",
        };
      case BookingStatus.CANCELED:
        return {
          textClass: "bg-red-100 text-red-800",
          label: "Dibatalkan",
          icon: "❌",
        };
      case BookingStatus.DELAYED:
        return {
          textClass: "bg-red-100 text-red-800",
          label: "Menunuggu",
          icon: "⏳",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isActive = selectedBookingId === booking.id;

  // Handler untuk membuka modal
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBookingId(booking.id);
    const modal = document.getElementById(
      "DetailBookingModal"
    ) as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  // Handler untuk tombol batalkan
  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBookingId(booking.id);
    const modal = document.getElementById(
      "cancel-confirmation"
    ) as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  return (
    <div
      className={`relative p-3 sm:p-4 bg-white border ${
        isActive ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200"
      } hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer rounded-xl shadow-sm sm:shadow mb-2  w-full`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick(e as any)}
    >
      {/* Status Indicator - diubah ke kiri atas untuk mobile */}
      <div className={`absolute top-3 left-3 w-2 h-10 rounded-full`} />

      {/* Main Content */}
      <div className="ml-4 sm:ml-6">
        {/* Header dengan kode dan status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-base sm:text-lg ">
              {booking.code}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo?.textClass} flex items-center gap-1`}
            >
              <span className="text-xs">{statusInfo?.icon}</span>
              <span className="hidden sm:inline">{statusInfo?.label}</span>
              <span className="sm:hidden">{statusInfo?.label}</span>
            </span>

            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <span className="hidden sm:inline mr-1">🕐</span>
              <span>{formatTime(booking.arrivalTime)}</span>
            </div>
          </div>
        </div>

        {/* Info Driver & Kendaraan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs">👤</span>
            </div>
            <span className="text-sm text-gray-700 truncate">
              {booking.driver?.displayName ||
                booking.driverUsername ||
                "Tidak ada driver"}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs">🚚</span>
            </div>
            <span className="text-sm text-gray-700 ">
              {booking.Vehicle?.brand || "Kendaraan"} -{" "}
              {booking.Vehicle?.vehicleType || "-"}
            </span>
          </div>
        </div>

        {/* Detail Grid - Responsif */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-gray-500 text-xs">⏱️</span>
              <span className="text-xs text-gray-600">Durasi</span>
            </div>
            <span className="font-medium text-sm">{calculateDuration()}</span>
          </div>

          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-gray-500 text-xs">📦</span>
              <span className="text-xs text-gray-600">Bongkar</span>
            </div>
            <span className="font-medium text-sm">
              {booking.Vehicle?.durasiBongkar || 0}m
            </span>
          </div>

          <div className="bg-gray-50 p-2 rounded-lg sm:col-span-2">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-gray-500 text-xs">📍</span>
              <span className="text-xs text-gray-600">Dock</span>
            </div>
            <span className="font-medium text-sm ">
              {booking?.Dock?.name || "-"}
            </span>
          </div>
        </div>

        {/* Waktu Selesai */}
        {BookingStatus[booking.status] === BookingStatus.IN_PROGRESS && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-sm">🏁</span>
                <span className="text-xs sm:text-sm text-blue-700">
                  Estimasi Selesai
                </span>
              </div>
              <span className="font-semibold text-blue-800 text-sm sm:text-base">
                {formatTime(booking.estimatedFinishTime)}
              </span>
            </div>
            {booking.actualFinishTime && (
              <div className="mt-1 flex items-center gap-2 text-xs text-green-600">
                <span>✓ Selesai: {formatTime(booking.actualFinishTime)}</span>
              </div>
            )}
          </div>
        )}

        {/* Tombol Action - hanya muncul untuk DRIVER_VENDOR */}
        {userInfo?.role != ROLE.DRIVER_VENDOR &&
          booking.status !== "CANCELED" &&
          booking.status !== "FINISHED" && (
            <div className="mt-3 flex justify-end">
              <button
                className="btn btn-sm btn-outline btn-error hover:bg-red-50 active:bg-red-100 text-xs sm:text-sm px-3 py-1.5"
                onClick={handleCancelClick}
              >
                <span className="hidden sm:inline">Batalkan Booking</span>
                <span className="sm:hidden">Batalkan</span>
              </button>
            </div>
          )}

        {/* Actual Arrival Time - tampilkan di bawah jika ada */}
        {booking.actualArrivalTime && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-500">✓</span>
              <span>Tiba: {formatTime(booking.actualArrivalTime)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingListCard;
