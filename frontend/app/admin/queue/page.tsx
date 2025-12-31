"use client";

import { BookingApi } from "@/api/booking.api";
import { DockApi } from "@/api/dock.api";
import { useUserInfo } from "@/components/UserContext";
import { BookingFilter, Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { IDock } from "@/types/dock.type";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import QueueDetailModal, {
  getStatusBadgeColor,
  getStatusLabel,
} from "@/components/admin/QueueDetailModal";
import ConfirmationWithInput from "@/components/shared-common/ConfirmationWithInput";
import DockOptionModal from "@/components/admin/DockOptionModal";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import InventorySection from "@/components/admin/InventorySection";
import DockColumn from "@/components/admin/DockColumn";

export default function QueuePage() {
  const { userInfo } = useUserInfo();
  const queryClient = useQueryClient();
  const [selectedDockId, setSelectedDockId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  //Drag & drop states
  const [delayedBookings, setDelayedBookings] = useState<Booking[]>([]);
  const [canceledBookings, setCanceledBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const [delayTolerance, setDelayTolerance] = useState(15);

  // Sensor untuk drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fungsi untuk menghitung delayed bookings
  const calculateDelayedBookings = (bookings: Booking[]) => {
    const delayed = bookings.filter((booking) => {
      if (booking.status !== "IN_PROGRESS") return false;
      if (!booking.arrivalTime) return false;

      const arrivalTime = new Date(booking.arrivalTime);
      const now = new Date();
      const delayInMinutes =
        (now.getTime() - arrivalTime.getTime()) / (1000 * 60);

      return delayInMinutes > delayTolerance;
    });

    setDelayedBookings(delayed);

    // Untuk canceled, filter berdasarkan status
    const canceled = bookings.filter(
      (b: Booking) => b.status === BookingStatus.CANCELED
    );
    setCanceledBookings(canceled);
  };

  // Handle drag events
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const booking = active.data.current?.booking;
    if (booking) {
      setActiveBooking(booking);
    }
  };

  const handleUpdateDock = () => {
    toast("test");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBooking(null);

    if (!over) return;

    const booking = active.data.current?.booking;
    const sourceType = active.data.current?.type;
    const targetType = over.data.current?.type;
    const targetDockId = over.data.current?.dockId;

    if (booking && targetDockId) {
      // Jika ditaruh ke dock
      console.log(`Moving booking ${booking.id} to dock ${targetDockId}`);
      // TODO: Panggil API untuk update booking dock
      handleUpdateDock({
        bookingId: booking.id!,
        dockId: targetDockId,
        prevDockId: booking.dockId,
      });
    } else if (booking && targetType) {
      // Jika ditaruh ke inventory lain
      console.log(`Moving booking ${booking.id} to ${targetType} inventory`);
    }
  };

  const [canceledReason, setCanceledReason] = useState<string>("");
  const qq = useQueryClient();

  const bookingFilterQueueInit: BookingFilter = {
    date: null,
    page: 1,
    searchKey: "",
    warehouseId: userInfo?.homeWarehouse?.id,
  };

  const [filter, setFilter] = useState<BookingFilter>(bookingFilterQueueInit);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", filter],
    queryFn: async () => await BookingApi.getAllBookingsForWarehouse(filter),
    enabled: !!userInfo,
  });

  // Get all docks for warehouse
  const {
    data: docks = [],
    isLoading: loadingDocks,
    refetch: refecthDock,
  } = useQuery({
    queryKey: ["docks", userInfo?.homeWarehouse?.id],
    queryFn: async () =>
      await DockApi.getDocksByWarehouseId(userInfo?.homeWarehouse?.id!),
    enabled: !!userInfo?.homeWarehouse?.id,
  });

  // Group bookings by dock and filter only UNLOADING and IN_PROGRESS
  const bookingsByDock = useMemo(() => {
    const result: Record<
      string,
      { unloading: Booking[]; inProgress: Booking[] }
    > = {};

    // Inisialisasi semua docks
    docks.forEach((dock) => {
      result[dock.id!] = { unloading: [], inProgress: [] };
    });

    // Group bookings
    bookings?.forEach((booking) => {
      if (!booking.dockId) return; // Pastikan ada dockId

      // Cari dock yang sesuai
      const dock = docks.find((d) => d.id === booking.dockId);
      if (!dock) {
        console.warn(
          `Booking ${booking.id} has invalid dockId: ${booking.dockId}`
        );
        return;
      }

      // Tambahkan ke group yang sesuai
      if (booking.status === BookingStatus.UNLOADING) {
        result[dock.id!].unloading.push(booking);
      } else if (booking.status === BookingStatus.IN_PROGRESS) {
        result[dock.id!].inProgress.push(booking);
      }
      // Status lainnya diabaikan untuk queue display
    });

    console.log("Grouped bookings:", result);
    return result;
  }, [bookings, docks]);

  // Update status mutation
  const { mutateAsync: handleUpdateStatus } = useMutation({
    mutationFn: async ({
      id,
      status,
      actualFinishTime,
    }: {
      id: string;
      status: BookingStatus;
      actualFinishTime?: Date;
    }) => {
      return await BookingApi.updateBookingStatus(id, status, actualFinishTime);
    },
    onSuccess: () => {
      toast.success("Status booking berhasil diupdate");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setSelectedBookingId(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal mengupdate status");
    },
  });

  // Cancel booking mutation
  const { mutateAsync: handleCancel } = useMutation({
    mutationKey: ["bookings"],
    mutationFn: async () => {
      if (!selectedBookingId || !canceledReason) {
        toast.error("Mohon isi alasan pembatalan");
        throw new Error("Mohon isi alasan pembatalan");
      }
      await BookingApi.cancelBooking(selectedBookingId, canceledReason);
    },
    onSuccess: async () => {
      qq.invalidateQueries({
        queryKey: ["bookings"],
      });
      setCanceledReason("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message);
    },
  });

  // Calculate time remaining
  const calculateTimeRemaining = (booking: Booking): string => {
    const now = new Date();
    const finish = new Date(
      booking.actualStartTime + booking.Vehicle.durasiBongkar
    );
    const diff = finish.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    if (diff < 0) {
      return `+${Math.abs(minutes)} min`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes} min`;
  };

  // Open detail modal
  const openDetailModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    (
      document.getElementById("QueueDetailModalPreview") as HTMLDialogElement
    )?.showModal();
  };

  // Open justify modal
  const openJustifyModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    (
      document.getElementById("QueueDetailModalJustify") as HTMLDialogElement
    )?.showModal();
  };

  const sortedDocksWithBookings = useMemo(
    () =>
      docks
        ?.sort((a: IDock, b: IDock) =>
          (a.name ?? "").localeCompare(b.name ?? "")
        )
        .map((dock: IDock) => {
          // Pastikan bookingsByDock[dock.id!] ada
          const bookings = bookingsByDock?.[dock.id!] || {
            unloading: [],
            inProgress: [],
          };

          console.log(`Dock ${dock.id} (${dock.name}):`, bookings);

          return {
            dock,
            dockBookings: bookings,
          };
        }) || [],
    [docks, bookingsByDock]
  );

  useEffect(() => {
    if (bookings) {
      calculateDelayedBookings(bookings);
    }
  }, [bookings, delayTolerance]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header dan filter area */}
            <div className="flex gap-2 justify-center items-center">
              <label className="flex items-center gap-x-2">
                <span>Toleransi Keterlambatan</span>
                <input
                  type="text"
                  placeholder="15"
                  value={delayTolerance}
                  onChange={(e) => setDelayTolerance(parseInt(e.target.value))}
                  className="input input-bordered input-accent w-[100px] px-3"
                />
                Menit
              </label>
              <input
                type="text"
                placeholder="Cari code, driver name.."
                value={filter.searchKey || ""}
                onChange={(e) =>
                  setFilter({ ...filter, searchKey: e.target.value })
                }
                className="input input-bordered input-accent w-full max-w-xs"
              />
              <input
                value={filter.date || ""}
                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                type="date"
                className="input input-bordered w-full max-w-xs"
              />
            </div>

            {/* Queue Grid by Dock */}
            {isLoading || loadingDocks ? (
              <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : docks.length === 0 ? (
              <div className="card bg-white">
                <div className="card-body text-center">
                  <p className="text-gray-500">Tidak ada dock tersedia</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto flex min-h-screen">
                <button className="btn btn-primary mr-2">
                  <ArrowLeft />
                </button>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  {/* MAIN CONTENT - SIMPLE DIRECT MAPPING */}
                  <div className="grid gap-4 grid-cols-4 w-full">
                    {docks
                      ?.sort((a: IDock, b: IDock) =>
                        (a.name ?? "").localeCompare(b.name ?? "")
                      )
                      .map((dock: IDock) => {
                        // Ambil booking untuk dock ini langsung dari bookings
                        const dockBookings =
                          bookings?.filter((b) => b.dockId === dock.id) || [];

                        // Pisahkan berdasarkan status
                        const unloadingBookings = dockBookings.filter(
                          (b) => b.status === BookingStatus.UNLOADING
                        );
                        const inProgressBookings = dockBookings.filter(
                          (b: Booking) =>
                            b.status === BookingStatus.IN_PROGRESS &&
                            b.arrivalTime >= new Date() // EXCLUDE DELAYED
                        );

                        return (
                          <div key={dock.id} className="flex flex-col">
                            {/* Dock Header */}
                            <div
                              className={`btn btn-outline border ${
                                dock.isActive ? "bg-primary" : "bg-slate-400"
                              } text-white p-3 cursor-pointer flex`}
                              onClick={() => {
                                setSelectedDockId(dock.id!);
                                (
                                  document.getElementById(
                                    "dock-option-modal"
                                  ) as HTMLDialogElement
                                )?.showModal();
                              }}
                            >
                              <h3 className="font-bold text-lg text-center flex items-center gap-x-4">
                                {dock.name}
                              </h3>
                              <h4>({inProgressBookings.length})</h4>
                              <div>
                                <Pencil className="w-5 h-5" />
                              </div>
                            </div>

                            {/* UNLOADING Section */}
                            <div className="space-y-2 mb-4">
                              <div className="text-xs font-semibold text-warning uppercase mb-1">
                                Unloading ({unloadingBookings.length})
                              </div>
                              {unloadingBookings.length === 0 ? (
                                <div className="card bg-base-200">
                                  <div className="card-body p-3 text-center text-xs text-gray-400">
                                    Kosong
                                  </div>
                                </div>
                              ) : (
                                unloadingBookings.map((booking: Booking) => (
                                  <DraggableBookingCard
                                    key={booking.id}
                                    booking={booking}
                                    timeRemaining={calculateTimeRemaining(
                                      booking
                                    )}
                                    onDetail={() =>
                                      openDetailModal(booking.id!)
                                    }
                                    onJustify={() =>
                                      openJustifyModal(booking.id!)
                                    }
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
                                    delayToleranceMinutes={
                                      filter.delayTolerance || 15
                                    }
                                  />
                                ))
                              )}
                            </div>

                            {/* IN_PROGRESS Queue Section */}
                            <div className="space-y-2 flex-1">
                              <div className="text-xs font-semibold text-info uppercase mb-1">
                                Antrian ({inProgressBookings.length})
                              </div>
                              {inProgressBookings.length === 0 ? (
                                <div className="card bg-base-200">
                                  <div className="card-body p-3 text-center text-xs text-gray-400">
                                    Kosong
                                  </div>
                                </div>
                              ) : (
                                inProgressBookings.map((booking: Booking) => (
                                  <DraggableBookingCard
                                    key={booking.id}
                                    booking={booking}
                                    timeRemaining={calculateTimeRemaining(
                                      booking
                                    )}
                                    onDetail={() =>
                                      openDetailModal(booking.id!)
                                    }
                                    onJustify={() =>
                                      openJustifyModal(booking.id!)
                                    }
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
                                    delayToleranceMinutes={
                                      filter.delayTolerance || 15
                                    }
                                  />
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* INVENTORY SECTION */}
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                    <div className="container mx-auto px-6 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h2 className="font-bold text-xl">Inventory</h2>
                          <p className="text-sm text-gray-500">
                            Booking yang memerlukan perhatian khusus
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-sm">
                              Delayed ({delayedBookings.length})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                            <span className="text-sm">
                              Canceled ({canceledBookings.length})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        {/* Delayed Bookings */}
                        <div className="flex-1 min-h-[150px] p-4 rounded-lg border-2 border-dashed bg-amber-50 border-amber-200">
                          <h3 className="font-bold text-lg mb-2">
                            Delayed Bookings{" "}
                            <span className="badge badge-warning">
                              {delayedBookings.length}
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {delayedBookings.length === 0 ? (
                              <div className="w-full text-center py-8 text-gray-400">
                                <div className="text-3xl mb-2">🕒</div>
                                <p>Tidak ada booking terlambat</p>
                              </div>
                            ) : (
                              delayedBookings.map((booking: Booking) => (
                                <DraggableBookingCard
                                  key={booking.id}
                                  booking={booking}
                                  getStatusBadgeColor={getStatusBadgeColor}
                                  getStatusLabel={getStatusLabel}
                                  delayToleranceMinutes={
                                    filter.delayTolerance || 15
                                  }
                                  draggable={true}
                                  dragData={{
                                    booking,
                                    type: "delayed",
                                    source: "inventory",
                                  }}
                                />
                              ))
                            )}
                          </div>
                        </div>

                        {/* Canceled Bookings */}
                        <div className="flex-1 min-h-[150px] p-4 rounded-lg border-2 border-dashed bg-rose-50 border-rose-200">
                          <h3 className="font-bold text-lg mb-2">
                            Canceled Bookings{" "}
                            <span className="badge badge-error">
                              {canceledBookings.length}
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {canceledBookings.length === 0 ? (
                              <div className="w-full text-center py-8 text-gray-400">
                                <div className="text-3xl mb-2">🗑️</div>
                                <p>Tidak ada booking dibatalkan</p>
                              </div>
                            ) : (
                              canceledBookings.map((booking: Booking) => (
                                <DraggableBookingCard
                                  key={booking.id}
                                  booking={booking}
                                  getStatusBadgeColor={getStatusBadgeColor}
                                  getStatusLabel={getStatusLabel}
                                  delayToleranceMinutes={
                                    filter.delayTolerance || 15
                                  }
                                  draggable={true}
                                  dragData={{
                                    booking,
                                    type: "canceled",
                                    source: "inventory",
                                  }}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DragOverlay>
                    {activeBooking && (
                      <div className="bg-white rounded-lg shadow-xl p-4 border-2 border-primary opacity-80">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                            {activeBooking.code?.charAt(0) || "B"}
                          </div>
                          <div>
                            <h4 className="font-bold">{activeBooking.code}</h4>
                            <p className="text-sm text-gray-600">
                              {activeBooking.driverUsername}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>

                <button className="btn btn-primary ml-2">
                  <ArrowRight />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal components */}
      <ConfirmationWithInput
        modalId="cancel-confirmation"
        message="Konfirmasi Pembatalan. tuliskan suatu alasan"
        onConfirm={handleCancel}
        title={"Apakah kamu yakin akan membatalkan Booking ini? "}
        input={canceledReason}
        setInput={setCanceledReason}
        key={"cancel-confirmation"}
      />
      <QueueDetailModal
        selectedBookingId={selectedBookingId}
        setSelectedBookingId={setSelectedBookingId}
        key={"QueueDetailModalPreview"}
        id="QueueDetailModalPreview"
      />
      <QueueDetailModal
        selectedBookingId={selectedBookingId}
        setSelectedBookingId={setSelectedBookingId}
        key={"QueueDetailModalJustify"}
        id="QueueDetailModalJustify"
      />
      <DockOptionModal
        key={"dock-option-modal"}
        selectedDockId={selectedDockId}
        refecthDock={refecthDock}
      />
    </div>
  );
}
