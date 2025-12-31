import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  X,
  GripVertical,
  Clock,
  Ban,
  Truck,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { useMemo } from "react";

interface DraggableBookingCardProps {
  booking: Booking;
  timeRemaining?: string;
  onDetail?: () => void;
  onJustify?: () => void;
  onStartUnloading?: () => void;
  onMarkFinished?: () => void;
  onCancel?: () => void;
  getStatusBadgeColor: (status?: BookingStatus) => string;
  getStatusLabel: (status?: BookingStatus) => string;
  // DnD props
  draggable?: boolean;
  dragId?: string;
  dragData?: any;
  // Untuk force delayed (jika dari inventory)
  forceDelayed?: boolean;
  delayToleranceMinutes?: number; // default 15 menit
}

const DraggableBookingCard = ({
  booking,
  timeRemaining = "",
  onDetail,
  onJustify,
  onStartUnloading,
  onMarkFinished,
  onCancel,
  getStatusBadgeColor,
  getStatusLabel,
  // DnD props
  draggable = true,
  dragId,
  dragData,
  // Override
  forceDelayed = false,
  delayToleranceMinutes = 15,
}: DraggableBookingCardProps) => {
  // 1. TENTUKAN TYPE BERDASARKAN DATA BOOKING
  const { cardType, isDelayed, delayMinutes, showDelayBadge } = useMemo(() => {
    // Cek jika canceled
    if (booking.status === BookingStatus.CANCELED) {
      return {
        cardType: "canceled" as const,
        isDelayed: false,
        delayMinutes: 0,
        showDelayBadge: false,
      };
    }

    // Cek jika unloading
    if (booking.status === BookingStatus.UNLOADING) {
      return {
        cardType: "unloading" as const,
        isDelayed: false,
        delayMinutes: 0,
        showDelayBadge: false,
      };
    }

    // Cek jika in-progress
    if (booking.status === BookingStatus.IN_PROGRESS) {
      // LOGIKA DELAYED YANG BENAR:
      // 1. Jika ada actualArrivalTime -> hitung delay dari actualArrivalTime
      // 2. Jika tidak ada actualArrivalTime -> hitung dari arrivalTime
      // 3. Delayed jika > toleranceMinutes

      const now = new Date();
      let referenceTime: Date | null = null;
      let delayed = false;
      let delayMin = 0;

      // Tentukan waktu referensi untuk perhitungan delayed
      if (booking.actualArrivalTime) {
        // Jika sudah datang, hitung dari actualArrivalTime
        referenceTime = new Date(booking.actualArrivalTime);
      } else if (booking.arrivalTime) {
        // Jika belum datang, hitung dari arrivalTime (waktu booking)
        referenceTime = new Date(booking.arrivalTime);
      }

      if (referenceTime) {
        delayMin = Math.floor(
          (now.getTime() - referenceTime.getTime()) / 60000
        );

        // Delayed jika lebih dari toleransi DAN belum ada actualArrivalTime
        // (kalau sudah ada actualArrivalTime berarti sudah datang tepat waktu)
        delayed =
          !booking.actualArrivalTime && delayMin > delayToleranceMinutes;
      }

      // Gunakan forceDelayed jika ada (untuk inventory section)
      if (forceDelayed) {
        delayed = true;
      }

      return {
        cardType: delayed ? ("delayed" as const) : ("in-progress" as const),
        isDelayed: delayed,
        delayMinutes: delayMin,
        showDelayBadge: delayed,
      };
    }

    // Default untuk status lainnya (WAITING, FINISHED, etc)
    return {
      cardType: "normal" as const,
      isDelayed: false,
      delayMinutes: 0,
      showDelayBadge: false,
    };
  }, [booking, forceDelayed, delayToleranceMinutes]);

  // 2. Tentukan apakah card ini harus HANYA di inventory (tidak boleh di dock)
  const isInventoryOnly = useMemo(() => {
    return cardType === "delayed" || cardType === "canceled";
  }, [cardType]);

  // 3. DnD HOOK - untuk inventory only, disable drag ke area yang tidak sesuai
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: dragId || `booking-${booking.id}-${cardType}`,
      data: {
        booking,
        type: cardType,
        source: isInventoryOnly ? "inventory" : "dock",
        isDelayed,
        delayMinutes,
        // Tambahkan metadata untuk validasi di drag end
        inventoryOnly: isInventoryOnly,
        currentDockId: booking.dockId,
      },
      disabled: !draggable,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 9999 : "auto",
      }
    : undefined;

  // 4. STYLING BERDASARKAN TYPE
  const getCardStyle = useMemo(() => {
    const baseStyle =
      "card bg-white transition-all duration-200 hover:shadow-md";

    if (isDragging) return `${baseStyle} opacity-50 shadow-xl scale-105`;

    switch (cardType) {
      case "delayed":
        return `${baseStyle} border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200`;
      case "canceled":
        return `${baseStyle} border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200`;
      case "unloading":
        return `${baseStyle} border-2 border-warning bg-gradient-to-r from-warning/10 to-warning/20`;
      case "in-progress":
        return `${baseStyle} border border-primary/20 bg-gradient-to-r from-white to-primary/5 hover:border-primary/40`;
      default:
        return `${baseStyle} border border-gray-200 bg-gradient-to-r from-white to-gray-50`;
    }
  }, [cardType, isDragging]);

  // 5. ICON BERDASARKAN TYPE
  const getTypeIcon = useMemo(() => {
    switch (cardType) {
      case "delayed":
        return <AlertTriangle className="text-amber-600" size={18} />;
      case "canceled":
        return <Ban className="text-rose-600" size={18} />;
      case "unloading":
        return <Truck className="text-warning" size={18} />;
      case "in-progress":
        return <Clock className="text-primary" size={18} />;
      default:
        return null;
    }
  }, [cardType]);

  // 6. STATUS TEXT BERDASARKAN KONDISI
  const getStatusText = useMemo(() => {
    if (cardType === "delayed") {
      return booking.actualArrivalTime
        ? `Delayed (Sudah datang ${new Date(
            booking.actualArrivalTime
          ).toLocaleTimeString()})`
        : `Delayed (Belum datang)`;
    }
    return getStatusLabel(booking.status);
  }, [cardType, booking, getStatusLabel]);

  // 7. ACTION BUTTONS - hanya untuk non-inventory cards
  const shouldShowActionButtons = useMemo(() => {
    // Tidak perlu action buttons untuk inventory-only cards
    if (isInventoryOnly) return false;

    // Cek jika ada minimal satu handler
    return !!(
      onDetail ||
      onJustify ||
      onStartUnloading ||
      onMarkFinished ||
      onCancel
    );
  }, [
    isInventoryOnly,
    onDetail,
    onJustify,
    onStartUnloading,
    onMarkFinished,
    onCancel,
  ]);

  // Komponen utama
  const CardContent = () => (
    <div className="card-body p-3">
      {/* Header dengan type indicator dan drag handle */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          {/* Status dan Type Badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {getTypeIcon}
            <span
              className={`badge badge-sm ${getStatusBadgeColor(
                booking.status
              )}`}
            >
              {getStatusText}
            </span>
            {showDelayBadge && (
              <span className="badge badge-sm badge-warning animate-pulse">
                ⏰ +{delayMinutes}m
              </span>
            )}
            {isInventoryOnly && (
              <span className="badge badge-sm badge-outline">
                {cardType === "delayed" ? "INVENTORY" : "CANCELED"}
              </span>
            )}
          </div>

          {/* Booking Info */}
          <div className="space-y-1">
            <p className="font-bold text-sm truncate flex items-center gap-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                ID
              </span>
              {booking.code || booking.id?.substring(0, 8)}
            </p>
            <p className="text-xs text-gray-600 truncate flex items-center gap-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded">👤</span>
              {booking.driverUsername || "N/A"}
            </p>
            <p className="text-xs text-gray-600 truncate flex items-center gap-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded">🚚</span>
              {booking.Vehicle?.brand || "N/A"}{" "}
              {booking.Vehicle?.vehicleType || ""}
            </p>
          </div>

          {/* Additional info berdasarkan type */}
          {cardType === "delayed" && (
            <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
              <p className="text-xs font-medium text-amber-800">
                ⚠️ Terlambat {delayMinutes} menit
              </p>
              {booking.arrivalTime && !booking.actualArrivalTime && (
                <p className="text-xs text-amber-600 mt-0.5">
                  Booked:{" "}
                  {new Date(booking.arrivalTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {booking.actualArrivalTime && (
                <p className="text-xs text-amber-600 mt-0.5">
                  Actual:{" "}
                  {new Date(booking.actualArrivalTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          )}

          {cardType === "canceled" && booking.canceledReason && (
            <div className="mt-2 p-2 bg-rose-50 rounded border border-rose-200">
              <p className="text-xs font-medium text-rose-800">
                🗑️ {booking.canceledReason}
              </p>
            </div>
          )}

          {booking.notes && (
            <p className="text-xs text-gray-500 mt-2 italic truncate border-t pt-1">
              📝 {booking.notes}
            </p>
          )}
        </div>

        {/* Time dan Drag Handle */}
        <div className="flex flex-col items-end gap-2 ml-2">
          {draggable && (
            <div
              className={`cursor-grab active:cursor-grabbing p-1 rounded ${
                isInventoryOnly ? "text-gray-400" : "text-gray-600"
              } hover:bg-gray-100`}
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} />
            </div>
          )}

          {/* Time Display */}
          <div
            className={`text-right ${
              cardType === "delayed" ? "text-amber-600" : "text-gray-700"
            }`}
          >
            {timeRemaining ? (
              <>
                <p className="text-lg font-bold">{timeRemaining}</p>
                <p className="text-xs text-gray-500">remaining</p>
              </>
            ) : cardType === "delayed" ? (
              <>
                <p className="text-lg font-bold">+{delayMinutes}m</p>
                <p className="text-xs text-amber-500">delayed</p>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Action Buttons - hanya untuk dock cards */}
      {shouldShowActionButtons && (
        <div className="flex gap-1 flex-wrap mt-3 pt-2 border-t border-gray-100">
          {onDetail && (
            <button
              className="btn btn-xs btn-ghost hover:bg-gray-100"
              onClick={onDetail}
              title="Detail"
            >
              <Eye size={12} />
              <span className="ml-1 text-xs">Detail</span>
            </button>
          )}

          {booking.status === BookingStatus.IN_PROGRESS && onJustify && (
            <button
              className="btn btn-xs btn-primary btn-outline"
              onClick={onJustify}
              title="Justify"
            >
              <Edit size={12} />
              <span className="ml-1 text-xs">Justify</span>
            </button>
          )}

          {booking.status === BookingStatus.IN_PROGRESS && onStartUnloading && (
            <button
              className="btn btn-xs btn-warning"
              onClick={onStartUnloading}
              title="Start Unloading"
            >
              Start Unloading
            </button>
          )}

          {booking.status === BookingStatus.UNLOADING && onMarkFinished && (
            <button
              className="btn btn-xs btn-success"
              onClick={onMarkFinished}
              title="Mark Finished"
            >
              <CheckCircle size={12} />
              <span className="ml-1 text-xs">Finish</span>
            </button>
          )}

          {onCancel && booking.status !== BookingStatus.CANCELED && (
            <button
              className="btn btn-xs btn-error btn-outline"
              onClick={onCancel}
              title="Cancel"
            >
              <X size={12} />
              <span className="ml-1 text-xs">Cancel</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Render dengan atau tanpa DnD wrapper
  if (draggable) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={getCardStyle}
        data-booking-id={booking.id}
        data-dock-id={booking.dockId}
        data-type={cardType}
        data-delayed={isDelayed}
        data-delay-minutes={delayMinutes}
        data-inventory-only={isInventoryOnly}
      >
        <CardContent />
      </div>
    );
  }

  return (
    <div
      className={getCardStyle}
      data-booking-id={booking.id}
      data-dock-id={booking.dockId}
      data-type={cardType}
      data-delayed={isDelayed}
      data-delay-minutes={delayMinutes}
      data-inventory-only={isInventoryOnly}
    >
      <CardContent />
    </div>
  );
};

export default DraggableBookingCard;
