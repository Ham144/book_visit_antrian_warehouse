import React, { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { BookingStatus } from "@/types/shared.type";

interface SortableContainerProps {
  id: string;
  children: React.ReactNode;
  type: "inventory" | "dock-section" | "booking-card";
  bookingStatus?: BookingStatus;
  dockId?: string;
  bookingId?: string;
  className?: string;
  acceptFrom?: BookingStatus[];
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
}: SortableContainerProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: {
      type,
      bookingStatus,
      dockId,
      bookingId,
      acceptFrom,
    },
  });

  useEffect(() => {
    setIsDragOver(isOver);
  }, [isOver]);

  // Jika ini adalah drop zone kosong (untuk area kosong di section)
  const isEmptyDropZone =
    type === "dock-section" &&
    (bookingStatus === BookingStatus.IN_PROGRESS ||
      bookingStatus === BookingStatus.UNLOADING);

  return (
    <div
      ref={setNodeRef}
      className={`
        ${className}
        ${isEmptyDropZone ? "min-h-[80px]" : ""}
        ${
          isDragOver && isEmptyDropZone
            ? "bg-primary/20 border-2 border-dashed border-primary"
            : ""
        }
        ${
          isDragOver && !isEmptyDropZone
            ? "ring-2 ring-primary ring-inset bg-primary/10"
            : ""
        }
        transition-all duration-150 relative
      `}
    >
      {children}

      {/* Visual feedback untuk drop zone kosong */}
      {isDragOver && isEmptyDropZone && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-primary font-medium text-sm">Drop di sini</div>
        </div>
      )}
    </div>
  );
};
