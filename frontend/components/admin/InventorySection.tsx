import { Booking } from "@/types/booking.type";
import { useDroppable } from "@dnd-kit/core";
import DraggableBookingCard from "./DraggableBookingCard";
import { getStatusBadgeColor, getStatusLabel } from "./QueueDetailModal";

interface InventorySectionProps {
  title: string;
  status: "DELAYED" | "CANCELED";
  bookings: Booking[];
  onDragStart?: (booking: Booking) => void;
  onDragEnd?: () => void;
  onDrop?: (booking: Booking) => void;
  delayTolerance?: number;
}

const InventorySection = ({
  title,
  status,
  bookings,
  onDrop,
  onDragEnd,
  onDragStart,
  delayTolerance,
}: InventorySectionProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `inventory-${status}`,
    data: { status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-h-[150px] p-4 rounded-lg border-2 border-dashed
        ${
          status === "DELAYED"
            ? "bg-amber-50 border-amber-200"
            : "bg-rose-50 border-rose-200"
        }
        ${isOver ? "ring-2 ring-primary ring-offset-2" : ""}
        transition-all duration-200
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">
            {title}
            <span className="ml-2 badge badge-outline">{bookings.length}</span>
          </h3>
          <p className="text-sm text-gray-500">
            {status === "DELAYED"
              ? `Booking terlambat ${delayTolerance} menit`
              : "Booking yang dibatalkan"}
          </p>
        </div>
        {status === "DELAYED" && bookings.length > 0 && (
          <span className="animate-pulse bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            ⚠️ PERLU PERHATIAN
          </span>
        )}
      </div>

      <div className=" gap-2 grid grid-cols-2 max-h-[200px] overflow-y-auto">
        {bookings.length === 0 ? (
          <div className="w-full text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">
              {status === "DELAYED" ? "🕒" : "🗑️"}
            </div>
            <p>Tidak ada data</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <DraggableBookingCard
              booking={booking}
              getStatusBadgeColor={getStatusBadgeColor}
              getStatusLabel={getStatusLabel}
              key={booking.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default InventorySection;
