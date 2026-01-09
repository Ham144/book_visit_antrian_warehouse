import React, { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import DraggableBookingCard from "./DraggableBookingCard";
import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";

interface FullDroppableInventoryProps {
  bookings: Booking[];
  status: BookingStatus;
  title: string;
  badgeColor: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  className?: string;
  acceptFrom?: BookingStatus[];
  onDetail?: (booking: Booking) => void;
  isDragOverDelayed?: boolean;
}

const FullDroppableInventory = ({
  bookings,
  status,
  title,
  badgeColor,
  icon,
  onDetail,
  isDragOverDelayed,
}: FullDroppableInventoryProps) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `inventory-${status}`,
    data: {
      type: "inventory",
      bookingStatus: status,
      acceptFrom:
        status === BookingStatus.CANCELED
          ? [
              BookingStatus.IN_PROGRESS,
              BookingStatus.UNLOADING,
              BookingStatus.DELAYED,
            ]
          : [],
    },
  });

  return (
    <div className="relative flex-1 min-h-[160px] py-2">
      {/* ===================== */}
      {/* MAIN GRID LAYOUT */}
      {/* ===================== */}
      <div className="grid grid-rows-[auto_1fr] h-full  ">
        {/* ROW 1: HEADER AREA (NON-DROPPABLE) */}
        <div className="relative z-40 bg-white p-4 rounded-t-xl border-2 border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-xs text-gray-500">
                  {bookings.length} booking • Drag & Drop
                </p>
              </div>
            </div>
            <span className={`badge ${badgeColor}`}>{bookings.length}</span>
          </div>
        </div>

        {/* ROW 2: CONTENT AREA (DROPPABLE) */}
        <div className="relative">
          {/* DROP OVERLAY - HANYA di CONTENT AREA */}
          <div
            ref={setNodeRef}
            className={`
              absolute inset-0 rounded-b-xl
              transition-all duration-300
              ${isOver ? "z-20 border-4 border-dashed" : "z-0 opacity-0"}
              ${
                status === BookingStatus.CANCELED
                  ? "bg-rose-100/40 border-rose-400"
                  : "bg-amber-100/40 border-amber-400"
              }
            `}
          />

          {/* CONTENT CONTAINER */}
          <div
            className={`
            relative h-full p-4 rounded-b-xl border-2 border-t-0 z-10
            ${
              status === BookingStatus.CANCELED
                ? "bg-rose-50 border-rose-200"
                : "bg-amber-50 border-amber-200"
            }
          `}
          >
            {/* BOOKINGS GRID */}
            <div
              className={`
                grid grid-cols-2 gap-3 pr-2
                ${bookings.length > 4 ? "max-h-[140px] overflow-y-auto" : ""}
                custom-scrollbar
                relative z-30
              `}
            >
              {bookings.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">
                    {status === BookingStatus.CANCELED ? "🗑️" : "🕒"}
                  </div>
                  <p className="text-sm">Kosong • Drop booking di sini</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="relative z-40">
                    <DraggableBookingCard
                      booking={booking}
                      draggable={true}
                      droppable={false}
                      onDetail={() => onDetail(booking)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* HOVER HINT */}
      {/* ===================== */}
      {bookings.length > 0 && !isOver && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-40">
          <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
            🟢 Drop area aktif
          </div>
        </div>
      )}
    </div>
  );
};

export default FullDroppableInventory;
