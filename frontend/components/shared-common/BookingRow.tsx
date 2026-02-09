import { useGoToUnloadingBar } from "@/hooks/useGoToUnloadingBar";
import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { LucideSettings2, PanelLeftDashedIcon } from "lucide-react";
import React from "react";
import {
  getStatusBadgeColor,
  getStatusIcon,
  getStatusLabel,
} from "../admin/QueueDetailModal";
import { useQuery } from "@tanstack/react-query";
import { WarehouseApi } from "@/api/warehouse.api";

interface BookingRowProps {
  booking: Booking;
  setSelectedBookingId: React.Dispatch<React.SetStateAction<string | null>>;
}

const BookingRow = ({ booking, setSelectedBookingId }: BookingRowProps) => {
  const arrival = new Date(booking.arrivalTime);

  const { data: warehouseDetail, isLoading } = useQuery({
    queryKey: ["warehouse-detail"],
    queryFn: async () =>
      await WarehouseApi.getWarehouseDetail(booking.warehouseId),
    enabled: !!booking?.warehouseId,
  });

  console.log(warehouseDetail);

  const now = new Date();
  const isPast =
    !isLoading &&
    arrival.getTime() + (warehouseDetail?.delayTolerance || 0) * 60_000 <
      now.getTime() &&
    (booking.status == BookingStatus.IN_PROGRESS ||
      booking.status == BookingStatus.PENDING) &&
    !booking.actualArrivalTime;

  const { remainingTime: remainingTimeGotoUnloading } =
    booking.status == BookingStatus.IN_PROGRESS &&
    useGoToUnloadingBar(booking, 1000);

  return (
    <tr
      key={booking.id}
      className={`hover:bg-gray-50 transition-colors duration-150 relative ${
        isPast && "bg-yellow-100 hover:bg-yellow-50"
      }`}
    >
      {/* Booking Code */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-bold py-3 text-gray-900 lg:w-40">
            {booking.code}
            {booking.notes && (
              <div
                className="text-xs text-gray-500 mt-1 truncate max-w-[150px]"
                title={booking.notes}
              >
                <div className="flex items-center gap-x-1">
                  <PanelLeftDashedIcon size={12} /> {booking.notes}
                </div>
              </div>
            )}
            {booking.canceledReason && (
              <div className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded mt-1 absolute">
                ❗ {booking.canceledReason}
              </div>
            )}
          </div>
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
                {booking.driver?.displayName || booking.driverUsername || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Schedule */}
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            Arrival Time:{" "}
            {new Date(booking.arrivalTime).toLocaleDateString("id-ID", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-gray-500 text-xs mt-1">
            {new Date(booking.arrivalTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            <span>
              {booking.estimatedFinishTime && (
                <>
                  <span className="mx-1">→</span>
                  {new Date(booking.estimatedFinishTime).toLocaleTimeString(
                    "id-ID",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </>
              )}
            </span>
          </div>
          {booking.actualArrivalTime && (
            <div className="text-green-600 text-xs mt-1 font-medium">
              ✅ Actual:{" "}
              {new Date(booking.actualArrivalTime).toLocaleTimeString("id-ID")}
            </div>
          )}
        </div>
      </td>

      {/* Duration */}
      <td className="px-4 py-3">
        <div className="text-sm">
          {booking.Vehicle?.durasiBongkar ? (
            <div className="space-y-1.5">
              {/* Durasi Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                {booking.Vehicle.durasiBongkar} min
              </div>

              {/* Status Waktu */}
              {booking.status === BookingStatus.IN_PROGRESS && (
                <div className="text-xs">
                  <div
                    className={`font-medium whitespace-nowrap ${
                      remainingTimeGotoUnloading &&
                      remainingTimeGotoUnloading.includes("+")
                        ? "text-red-500"
                        : "text-gray-600"
                    }`}
                  >
                    {remainingTimeGotoUnloading &&
                    remainingTimeGotoUnloading.includes("+")
                      ? "Telah Berlalu "
                      : "Menuju "}
                    {remainingTimeGotoUnloading}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
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
      <td className="px-6 py-4 whitespace-nowrap">
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
      <td className="px-6 py-4">
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
            className="btn"
          >
            <LucideSettings2 />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BookingRow;
