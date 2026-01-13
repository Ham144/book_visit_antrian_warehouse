import { BookingStatus } from "@/types/shared.type";
import { useDroppable } from "@dnd-kit/core";

// SortableContainer.tsx - Tambahkan prop isEmptyZone
interface SortableContainerProps {
  id: string;
  children?: React.ReactNode;
  type: "inventory" | "dock-section" | "booking-card" | "empty-zone";
  bookingStatus?: BookingStatus;
  dockId?: string;
  bookingId?: string;
  className?: string;
  acceptFrom?: BookingStatus[];
  isEmptyZone?: boolean; // 🔥 Flag khusus untuk zona kosong
}

export const SortableContainer = ({
  id,
  children,
  type,
  bookingStatus,
  dockId,
  bookingId,
  className = "",
  acceptFrom = [],
  isEmptyZone = false,
}: SortableContainerProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type,
      bookingStatus,
      dockId,
      bookingId,
      acceptFrom,
      isEmptyZone, // 🔥 Kirim flag ke data
    },
  });

  // Styling khusus untuk empty zone
  const isInventoryEmptyZone = type === "inventory" && isEmptyZone;
  const isDockEmptyZone = type === "dock-section" && isEmptyZone;

  return (
    <div
      ref={setNodeRef}
      className={`
        ${className}
        ${isEmptyZone ? "min-h-[80px]" : ""}
        ${
          isOver || isInventoryEmptyZone
            ? "bg-rose-100 border-2 border-primary border-dashed"
            : "border-dashed"
        }
        ${
          isOver && isDockEmptyZone
            ? "bg-primary/20 border-2 border-dashed border-primary"
            : ""
        }
        ${
          isOver && !isEmptyZone && type !== "booking-card"
            ? "ring-2 ring-primary ring-inset bg-primary/10"
            : ""
        }
        transition-all duration-150 relative flex flex-col  justify-center border border-dashed px-2
      `}
    >
      {children}

      {/* Visual feedback khusus untuk empty zone */}
      {isEmptyZone && (
        <div className="badge badge-ghost text-primary border border-dashed mx-auto text-center justify-center items-center mt-2">
          Kosong - Drop di sini
        </div>
      )}
    </div>
  );
};
