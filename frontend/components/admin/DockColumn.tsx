import { useDroppable } from "@dnd-kit/core";
import { Pencil } from "lucide-react";
import DraggableBookingCard from "./DraggableBookingCard";
import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";

// Komponen DockColumn yang terpisah
const DockColumn = ({
  dock,
  dockBookings,
  selectedDockId,
  setSelectedDockId,
  openDetailModal,
  openJustifyModal,
  handleUpdateStatus,
  setSelectedBookingId,
  calculateTimeRemaining,
  getStatusBadgeColor,
  getStatusLabel,
  delayTolerance,
}: any) => {
  // Hook ini aman karena dalam komponen terpisah

  const { setNodeRef: setDockHeaderRef, isOver: isDockOver } = useDroppable({
    id: `dock-header-${dock.id}`,
    data: {
      type: "dock",
      dockId: dock.id,
      dockName: dock.name,
      acceptTypes: ["delayed", "in-progress", "unloading"],
    },
  });

  // Hook untuk unloading section
  const { setNodeRef: setUnloadingRef, isOver: isUnloadingOver } = useDroppable(
    {
      id: `dock-${dock.id}-unloading`,
      data: {
        type: "dock-section",
        dockId: dock.id,
        acceptTypes: ["in-progress", "delayed"],
      },
    }
  );

  // Hook untuk in-progress section
  const { setNodeRef: setInProgressRef, isOver: isInProgressOver } =
    useDroppable({
      id: `dock-${dock.id}-inprogress`,
      data: {
        type: "dock-section",
        dockId: dock.id,
        acceptTypes: ["delayed"],
      },
    });

  return (
    <div className="flex flex-col" data-dock-id={dock.id}>
      {/* Dock Header dengan droppable area */}
      <div
        ref={setDockHeaderRef}
        className={`
          btn btn-outline border 
          ${dock.isActive ? "bg-primary" : "bg-slate-400"}
          text-white p-3 cursor-pointer flex relative
          ${isDockOver ? "ring-4 ring-success ring-offset-2 scale-[1.02]" : ""}
          transition-all duration-200 ease-in-out
        `}
        onClick={() => {
          setSelectedDockId(dock.id!);
          (
            document.getElementById("dock-option-modal") as HTMLDialogElement
          )?.showModal();
        }}
      >
        {/* Visual feedback saat drag over */}
        {isDockOver && (
          <>
            {/* Overlay hijau transparan */}
            <div className="absolute inset-0 bg-success/30 rounded-lg flex items-center justify-center z-10">
              <div className="bg-success text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Lepaskan di sini
              </div>
            </div>

            {/* Animasi border */}
            <div className="absolute inset-0 rounded-lg border-2 border-success border-dashed animate-pulse"></div>
          </>
        )}

        <h3 className="font-bold text-lg text-center flex items-center gap-x-4 relative z-20">
          {dock.name}
          {isDockOver && (
            <span className="badge badge-success animate-bounce">+</span>
          )}
        </h3>
        <h4 className="relative z-20">({dockBookings.length})</h4>
        <div className="relative z-20">
          <Pencil className="w-5 h-5" />
        </div>
      </div>

      {/* UNLOADING Section */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-semibold text-warning uppercase mb-1 flex justify-between items-center">
          <span>Unloading</span>
          <span className="badge badge-warning badge-sm">
            {dockBookings.unloading.length}
          </span>
        </div>

        <div
          ref={setUnloadingRef}
          className={`
            relative min-h-[60px]
            ${
              isUnloadingOver
                ? "bg-success/10 rounded-lg border-2 border-success border-dashed"
                : ""
            }
            transition-all duration-200
          `}
        >
          {dockBookings.unloading.length === 0 ? (
            <div className="card bg-base-200">
              <div className="card-body p-3 text-center text-xs text-gray-400">
                {isUnloadingOver ? (
                  <div className="text-success font-medium">
                    Pindahkan ke sini
                  </div>
                ) : (
                  "Kosong"
                )}
              </div>
            </div>
          ) : (
            dockBookings.unloading.map((booking: Booking) => {
              const timeRemaining = calculateTimeRemaining(booking);
              return (
                <DraggableBookingCard
                  key={booking.id}
                  delayToleranceMinutes={delayTolerance}
                  booking={booking}
                  timeRemaining={timeRemaining}
                  onDetail={() => openDetailModal(booking.id!)}
                  onJustify={() => openJustifyModal(booking.id!)}
                  onStartUnloading={() =>
                    handleUpdateStatus({
                      id: booking.id!,
                      status: BookingStatus.UNLOADING,
                    })
                  }
                  onMarkFinished={() =>
                    handleUpdateStatus({
                      id: booking.id!,
                      status: BookingStatus.FINISHED,
                      actualFinishTime: new Date(),
                    })
                  }
                  onCancel={() => {
                    setSelectedBookingId(booking.id!);
                    (
                      document.getElementById(
                        "cancel-confirmation"
                      ) as HTMLDialogElement
                    ).showModal();
                  }}
                  getStatusBadgeColor={getStatusBadgeColor}
                  getStatusLabel={getStatusLabel}
                />
              );
            })
          )}
        </div>
      </div>

      {/* IN_PROGRESS Queue Section */}
      <div className="space-y-2 flex-1">
        <div className="text-xs font-semibold text-info uppercase mb-1 flex justify-between items-center">
          <span>Antrian</span>
          <span className="badge badge-info badge-sm">
            {dockBookings.inProgress.length}
          </span>
        </div>

        <div
          ref={setInProgressRef}
          className={`
            relative min-h-[60px]
            ${
              isInProgressOver
                ? "bg-success/10 rounded-lg border-2 border-success border-dashed"
                : ""
            }
            transition-all duration-200
          `}
        >
          {dockBookings.inProgress.length === 0 ? (
            <div className="card bg-base-200 min-h-[100px] flex items-center justify-center">
              <div className="card-body p-3 text-center text-xs text-gray-400">
                {isInProgressOver ? (
                  <div className="text-success font-medium">
                    Pindahkan ke sini
                  </div>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mx-auto mb-2 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Tarik booking ke sini
                  </>
                )}
              </div>
            </div>
          ) : (
            dockBookings.inProgress.map((booking: Booking) => {
              const timeRemaining = calculateTimeRemaining(booking);
              return (
                <DraggableBookingCard
                  key={booking.id}
                  booking={booking}
                  delayToleranceMinutes={delayTolerance}
                  timeRemaining={timeRemaining}
                  onDetail={() => openDetailModal(booking.id!)}
                  onJustify={() => openJustifyModal(booking.id!)}
                  onStartUnloading={() =>
                    handleUpdateStatus({
                      id: booking.id!,
                      status: BookingStatus.UNLOADING,
                    })
                  }
                  onMarkFinished={() =>
                    handleUpdateStatus({
                      id: booking.id!,
                      status: BookingStatus.FINISHED,
                      actualFinishTime: new Date(),
                    })
                  }
                  onCancel={() => {
                    setSelectedBookingId(booking.id!);
                    (
                      document.getElementById(
                        "cancel-confirmation"
                      ) as HTMLDialogElement
                    ).showModal();
                  }}
                  getStatusBadgeColor={getStatusBadgeColor}
                  getStatusLabel={getStatusLabel}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DockColumn;
