import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import {
  Timer,
  Check,
  Truck,
  BanIcon,
  MessageCircleWarning,
  Eye,
  Edit,
  CheckCircle,
  X,
  GripVertical,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

interface DraggableBookingCardProps {
  booking: Booking;
  draggable?: boolean;

  onDetail?: () => void;
  onJustify?: () => void;
  onStartUnloading?: () => void;
  onMarkFinished?: () => void;
  onCancel?: () => void;
}

const DraggableBookingCard = ({
  booking,
  draggable = true,
  onDetail,
  onJustify,
  onStartUnloading,
  onMarkFinished,
  onCancel,
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
        bg-white rounded-lg border p-3 min-w-[220px]
        transition-all duration-200
        ${isDragging ? "opacity-50 shadow-xl" : "hover:shadow-md"}
      `}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon />
            <span className="text-xs font-medium text-gray-600">
              {booking.status}
            </span>
          </div>

          <p className="font-bold text-sm truncate">
            {booking.code || booking.id.slice(0, 8)}
          </p>

          <p className="text-xs text-gray-500 truncate">
            👤 {booking.driverUsername || "N/A"}
          </p>

          <p className="text-xs text-gray-500 truncate">
            🚚 {booking.Vehicle?.brand || "-"}{" "}
            {booking.Vehicle?.vehicleType || ""}
          </p>
        </div>

        {draggable && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical size={16} />
          </div>
        )}
      </div>

      {/* NOTES */}
      {booking.notes && (
        <p className="text-xs text-gray-500 italic mt-2 border-t pt-1">
          📝 {booking.notes}
        </p>
      )}

      {/* ACTIONS */}
      {(onDetail ||
        onJustify ||
        onStartUnloading ||
        onMarkFinished ||
        onCancel) && (
        <div className="grid grid-cols-2 gap-3 p-1">
          {onDetail && (
            <button className="btn btn-xs btn-ghost" onClick={onDetail}>
              <Eye size={12} /> Detail
            </button>
          )}

          {booking.status === BookingStatus.IN_PROGRESS && onJustify && (
            <button
              className="btn btn-xs btn-outline btn-primary"
              onClick={onJustify}
            >
              <Edit size={12} /> Justify
            </button>
          )}

          {booking.status === BookingStatus.IN_PROGRESS && onStartUnloading && (
            <button
              className="btn btn-xs btn-warning"
              onClick={onStartUnloading}
            >
              Start Unloading
            </button>
          )}

          {booking.status === BookingStatus.UNLOADING && onMarkFinished && (
            <button className="btn btn-xs btn-success" onClick={onMarkFinished}>
              <CheckCircle size={12} /> Finish
            </button>
          )}

          {booking.status !== BookingStatus.CANCELED && onCancel && (
            <button
              className="btn btn-xs btn-outline btn-error"
              onClick={onCancel}
            >
              <X size={12} /> Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DraggableBookingCard;
