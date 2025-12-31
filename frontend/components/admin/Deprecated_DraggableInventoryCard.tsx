import { Booking } from "@/types/booking.type";
import { useDraggable } from "@dnd-kit/core";

interface DraggableInventoryCardProps {
  booking: Booking;
  type: "delayed" | "canceled";
}

const DraggableInventoryCard = ({
  booking,
  type,
}: DraggableInventoryCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `inventory-booking-${booking.id}`,
      data: { booking, type },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-50 z-50" : "opacity-100"}
        min-w-[200px] bg-white rounded-lg shadow-sm border p-3
        ${type === "delayed" ? "border-amber-300" : "border-rose-300"}
        hover:shadow-md transition-all duration-200
        group
      `}
    >
      {/* Drag handle indicator */}
      <div className="absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100">
        ⋮⋮
      </div>

      <div className="flex items-start gap-2">
        <div
          className={`
          w-8 h-8 rounded-full flex items-center justify-center text-white text-sm
          ${type === "delayed" ? "bg-amber-500" : "bg-rose-500"}
        `}
        >
          {type === "delayed" ? "⌛" : "✗"}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-sm truncate">
            {booking.code || booking.id?.slice(0, 8)}
          </h4>
          <p className="text-xs text-gray-600">
            {booking.driverUsername || "Tanpa driver"}
          </p>
          {type === "delayed" && booking.arrivalTime && (
            <p className="text-xs text-amber-600 font-medium mt-1">
              Terlambat{" "}
              {Math.floor(
                (new Date().getTime() -
                  new Date(booking.arrivalTime).getTime()) /
                  60000
              )}{" "}
              menit
            </p>
          )}
          {type === "canceled" && (
            <p className="text-xs text-rose-600">
              Dibatal: {booking.canceledReason || "Tanpa alasan"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraggableInventoryCard;
