import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { BookingStatus } from "@/types/shared.type";

interface DropZoneLineProps {
  id: string;
  bookingStatus: BookingStatus;
  dockId: string;
  acceptFrom?: BookingStatus[];
  className?: string;
}

export const DropZoneLine = ({
  id,
  bookingStatus,
  dockId,
  acceptFrom = [],
  className = "",
}: DropZoneLineProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "drop-zone-line",
      bookingStatus,
      dockId,
      acceptFrom,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        ${className}
        h-2 transition-all duration-150
        ${
          isOver ? "bg-primary/30 border-y border-primary" : "hover:bg-gray-100"
        }
      `}
      title="Drop di sini untuk mengubah urutan"
    />
  );
};
