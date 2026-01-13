import React from "react";
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
  onDetail?: (booking: Booking) => void;
}

const FullDroppableInventory = ({
  bookings,
  status,
  title,
  badgeColor,
  bgColor,
  borderColor,
  icon,
  onDetail,
}: FullDroppableInventoryProps) => {
  // 🔥 INI YANG PENTING: Gunakan useDroppable di PARENT
  const { setNodeRef, isOver } = useDroppable({
    id: `inventory-${status}`,
    data: {
      type: "inventory",
      bookingStatus: status,
    },
  });

  // Tentukan styling berdasarkan status
  const getStatusConfig = () => {
    if (status === BookingStatus.CANCELED) {
      return {
        dropBg: "bg-rose-100/40",
        dropBorder: "border-rose-400",
        dropText: "text-rose-600",
        icon: "🗑️",
        message: "Batalkan Booking",
      };
    }
    return {
      dropBg: "bg-amber-100/40",
      dropBorder: "border-amber-400",
      dropText: "text-amber-600",
      icon: "🕒",
      message: "Tandai sebagai Terlambat",
    };
  };

  const config = getStatusConfig();

  return (
    // 🔥 PARENT CONTAINER sebagai DROPPABLE
    <div
      ref={setNodeRef}
      className={`
        relative flex-1 min-h-[160px] z4 rounded-xl p-4
        border-2 ${borderColor}
        transition-all duration-300
        ${
          isOver
            ? `
          ${config.dropBg}
          border-4 ${config.dropBorder} border-dashed
          scale-[1.02] shadow-xl
        `
            : `
          ${bgColor}
          hover:border-gray-300
        `
        }
        group
      `}
      // 🔥 INI YANG MEMBUAT SEMUA AREA DROPPABLE
      style={{
        // Force stacking context
        isolation: "isolate",
        zIndex: 4,
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 relative z-20">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${bgColor}`}>{icon}</div>
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-xs text-gray-500">
              {bookings.length} booking •{" "}
              {status === BookingStatus.CANCELED
                ? "Drag untuk mengembalikan"
                : "Auto-generated"}
            </p>
          </div>
        </div>
        <span className={`badge ${badgeColor}`}>{bookings.length}</span>
      </div>

      {/* CONTENT AREA - BISA SCROLL & DRAG */}
      <div
        className={`
          relative min-h-[100px]
          ${bookings.length > 0 ? "overflow-y-auto max-h-[140px] pr-2" : ""}
          custom-scrollbar
        `}
        // 🔥 MAGIC: Content area TETAP bisa di-interact meski parent droppable
        style={{
          position: "relative",
          zIndex: 30,
          pointerEvents: "auto", // 🔥 INI YANG PENTING!
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">{config.icon}</div>
            <p className="text-sm">Drop booking di sini</p>
            <p className="text-xs mt-1">
              Area hijau untuk {config.message.toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="relative"
                // 🔥 Mencegah event bubble ke parent droppable
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <DraggableBookingCard
                  booking={booking}
                  draggable={true}
                  droppable={false}
                  onDetail={() => onDetail(booking)}
                  className="shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DROP FEEDBACK OVERLAY */}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div
            className={`
            bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-2xl
            border-2 ${config.dropBorder}
            animate-in fade-in duration-200
          `}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{config.icon}</div>
              <h4 className={`font-bold text-lg ${config.dropText}`}>
                {config.message}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Lepaskan untuk melanjutkan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HOVER HINT */}
      {!isOver && bookings.length > 0 && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
          <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
            📍 Drag dari sini | Drop di sini
          </div>
        </div>
      )}
    </div>
  );
};

export default FullDroppableInventory;
