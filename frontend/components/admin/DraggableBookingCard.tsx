import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import {
  Timer,
  Check,
  Truck,
  BanIcon,
  MessageCircleWarning,
  CheckCircle,
  GripVertical,
  Clock,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  calculateTimeProgress,
  timeRemainingAutoUnloading,
} from "@/lib/constant";

interface DraggableBookingCardProps {
  booking: Booking;
  draggable?: boolean;
  droppable?: boolean; // 🔥 NEW PROP: apakah bisa di-drop di atasnya
  className?: string;

  onDetail?: () => void;
  onJustify?: () => void;
  onStartUnloading?: () => void;
  onMarkFinished?: () => void;
  onCancel?: () => void;
}

const DraggableBookingCard = ({
  booking,
  draggable = true,
  droppable = true, // 🔥 Default true, false untuk inventory
  className = "",
  onDetail,
  onStartUnloading,
  onMarkFinished,
}: DraggableBookingCardProps) => {
  // Tambahkan useSortable dengan data yang lengkap
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: booking.id!,
    disabled: !draggable,
    data: {
      type: "booking-card", // PASTIKAN ADA TYPE INI
      booking,
      bookingStatus: booking.status,
      sourceType: "booking-card",
      sourceStatus: booking.status,
      sourceDockId: booking.dockId,
      allowReorder: booking.status === BookingStatus.IN_PROGRESS,
    },
  });

  // Tambahkan juga sebagai drop target
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `booking-${booking.id}`,
    data: {
      type: "booking-card",
      booking,
      bookingStatus: booking.status,
      bookingId: booking.id,
      dockId: booking.dockId,
      acceptFrom: [BookingStatus.IN_PROGRESS], // Untuk reorder
    },
  });

  // Gabungkan refs
  const combinedRef = (node: HTMLDivElement) => {
    setNodeRef(node);
    setDropRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const StatusIcon = () => {
    switch (booking.status) {
      case BookingStatus.IN_PROGRESS:
        return <Timer className="w-4 h-4 text-primary" />;
      case BookingStatus.UNLOADING:
        return <Truck className="w-4 h-4 text-warning" />;
      case BookingStatus.FINISHED:
        return <Check className="w-4 h-4 text-success" />;
      case BookingStatus.DELAYED:
        return <MessageCircleWarning className="w-4 h-4 text-amber-500" />;
      case BookingStatus.CANCELED:
        return <BanIcon className="w-4 h-4 text-error" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      className={`
        bg-white rounded-md border border-gray-200 p-2 min-w-[180px]
        transition-all duration-150 w-full relative text-xs
        ${isDragging ? "opacity-30 shadow-lg scale-95" : ""}
        ${isOver ? "ring-2 ring-blue-300 ring-inset bg-blue-50" : ""}
        hover:shadow-sm hover:border-gray-300
      `}
    >
      {/* HEADER - SUPER COMPACT */}
      <div
        onClick={onDetail}
        className="flex justify-between items-start gap-1 cursor-pointer"
      >
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          {/* Status & Code in one line */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1 truncate">
              {StatusIcon()}
              <span className="font-medium text-gray-700 truncate">
                {booking.code || booking.id.slice(0, 6)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Timer size={10} className="text-gray-400" />
              <span className="font-medium text-gray-600 whitespace-nowrap">
                {timeRemainingAutoUnloading(booking)}
              </span>
            </div>
          </div>

          {/* Driver & Vehicle in one line */}
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <span className="truncate">
              👤 {booking.driverUsername?.slice(0, 10) || "N/A"}
            </span>
            <span>•</span>
            <span className="truncate">
              🚚 {booking.Vehicle?.vehicleType?.split("_").pop() || "-"}
            </span>
          </div>

          {/* Time Info - Minimal */}
          {booking.status === BookingStatus.IN_PROGRESS && (
            <div className="space-y-0.5 mt-1.5 border-t pt-1.5">
              {/* Arrival Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock size={10} className="text-gray-400" />
                  <span className="text-gray-600">Arrival Book:</span>
                </div>
                <span className="font-medium text-gray-800">
                  {booking.arrivalTime
                    ? new Date(booking.arrivalTime).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )
                    : "-"}
                </span>
              </div>

              {/* Est. Finish */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Timer size={10} className="text-gray-400" />
                  <span className="text-gray-600">Est. Finish:</span>
                </div>
                <span className="font-medium text-gray-800">
                  {booking.estimatedFinishTime
                    ? new Date(booking.estimatedFinishTime).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )
                    : "-"}
                </span>
              </div>

              {/* Duration - kecil di pojok */}
              {booking.Vehicle?.durasiBongkar && (
                <div className="text-right">
                  <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                    Duration {booking.Vehicle.durasiBongkar}m
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drag Handle - Smaller */}
        {draggable && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 ml-1"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </div>
        )}
      </div>

      {/* Progress Bar - Super Slim */}
      {booking.status === BookingStatus.UNLOADING && (
        <div className="mt-1.5">
          <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
            <span>Arrival</span>
            <span>Est. Finish</span>
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full"
              style={{
                width: `${calculateTimeProgress(booking)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Notes - Compact */}
      {booking.notes && (
        <div className="mt-1.5 pt-1.5 border-t border-gray-100">
          <p className="text-gray-500 truncate text-[11px]">
            <span className="text-gray-400">📝</span>{" "}
            {booking.notes.slice(0, 50)}
            {booking.notes.length > 50 ? "..." : ""}
          </p>
        </div>
      )}

      {/* Actions - Minimal */}
      {onMarkFinished && booking.status === BookingStatus.UNLOADING && (
        <div className="mt-2 pt-1.5 border-t border-gray-100">
          <button
            className="w-full py-1 px-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-medium rounded flex items-center justify-center gap-1 transition-colors"
            onClick={onMarkFinished}
          >
            <CheckCircle size={10} />
            <span>Mark Selesai</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DraggableBookingCard;
