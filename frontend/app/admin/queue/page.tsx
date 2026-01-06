"use client";

import { BookingApi } from "@/api/booking.api";
import { DockApi } from "@/api/dock.api";
import { useUserInfo } from "@/components/UserContext";
import { BookingFilter, Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  Clock,
  Pencil,
  Search,
} from "lucide-react";
import QueueDetailModal from "@/components/admin/QueueDetailModal";
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
  DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";
import DraggableBookingCard from "@/components/admin/DraggableBookingCard";
import isDelayed from "@/lib/IsDelayed";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableContainer } from "@/components/admin/SortableContainer";
import { DropZoneLine } from "@/components/admin/DropConeLine";

export default function LiveQueuePage() {
  const { userInfo } = useUserInfo();
  const queryClient = useQueryClient();
  const [selectedDockId, setSelectedDockId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  // Kategori
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [activeDockId, setActiveDockId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState<boolean>(false);

  const [onFloatingBooking, setOnFloatingBooking] = useState<Booking>();

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

    // Untuk canceled, filter berdasarkan status
    const canceled = bookings.filter(
      (b: Booking) => b.status === BookingStatus.CANCELED
    );
  };

  // Handle drag events
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const booking = active.data.current?.booking;

    setActiveBooking(booking);
    setActiveDockId(booking?.dockId || null);

    // Mode reorder hanya untuk IN_PROGRESS dalam dock yang sama
    if (booking?.status === BookingStatus.IN_PROGRESS && booking.dockId) {
      setIsReordering(true);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveBooking(null);
    setActiveDockId(null);

    if (!over) return;

    const sourceBooking = active.data.current?.booking;
    const targetData = over.data.current;

    if (!sourceBooking || !targetData) return;

    const sameDock = sourceBooking.dockId === targetData.dockId;

    /* =====================================================
     * 1. REORDER IN_PROGRESS (dock sama)
     * ===================================================== */
    if (
      targetData.type === "booking-card" &&
      sourceBooking.status === BookingStatus.IN_PROGRESS &&
      targetData.booking?.status === BookingStatus.IN_PROGRESS &&
      sameDock &&
      sourceBooking.id !== targetData.booking.id
    ) {
      toast("REORDER IN_PROGRESS (dock sama)");
      // Tentukan BEFORE/AFTER berdasarkan posisi visual
      const dockGroup = filteredBookings[sourceBooking.dockId!];
      const currentIndex = dockGroup.inprogress.findIndex(
        (b) => b.id === sourceBooking.id
      );
      const targetIndex = dockGroup.inprogress.findIndex(
        (b) => b.id === targetData.booking.id
      );

      const relativeType = currentIndex < targetIndex ? "BEFORE" : "AFTER";

      await BookingApi.dragAndDrop(sourceBooking.id!, {
        action: "MOVE_WITHIN_DOCK",
        toStatus: "IN_PROGRESS",
        dockId: sourceBooking.dockId,
        relativePositionTarget: {
          bookingId: targetData.booking.id!,
          type: relativeType,
        },
      });

      toast.success("Urutan antrian diperbarui");
      return;
    }

    /* =====================================================
     * 2. KE UNLOADING (dari IN_PROGRESS | DELAYED | CANCELED)
     * ===================================================== */
    if (targetData.bookingStatus === BookingStatus.UNLOADING) {
      toast("KE UNLOADING (dari IN_PROGRESS | DELAYED | CANCELED)");
      // Default relative position jika tidak ada
      const relativePositionTarget = targetData.bookingId
        ? {
            bookingId: targetData.bookingId,
            type: "AFTER" as const,
          }
        : {
            bookingId: "LAST",
            type: "AFTER" as const,
          };

      await BookingApi.dragAndDrop(sourceBooking.id!, {
        action: sameDock ? "MOVE_WITHIN_DOCK" : "MOVE_OUTSIDE_DOCK",
        toStatus: "UNLOADING",
        dockId: targetData.dockId || sourceBooking.dockId,
        relativePositionTarget,
      });

      toast.success("Booking masuk unloading");
      return;
    }

    /* =====================================================
     * 3. KE CANCELED (inventory section)
     * ===================================================== */
    if (
      targetData.type === "inventory" &&
      targetData.bookingStatus === BookingStatus.CANCELED
    ) {
      toast("KE CANCELED (inventory section)");
      // Buka modal konfirmasi, JANGAN langsung panggil API
      setSelectedBookingId(sourceBooking.id!);
      setCanceledReason(
        `Dipindahkan via drag & drop - ${new Date().toLocaleString()}`
      );

      setTimeout(() => {
        (
          document.getElementById("cancel-confirmation") as HTMLDialogElement
        )?.showModal();
      }, 100);

      return;
    }

    /* =====================================================
     * 4. KE IN_PROGRESS (dari DELAYED | CANCELED | UNLOADING)
     * ===================================================== */
    if (targetData.bookingStatus === BookingStatus.IN_PROGRESS) {
      // Handle dari berbagai status
      const allowedSources = [
        BookingStatus.DELAYED,
        BookingStatus.CANCELED,
        BookingStatus.UNLOADING,
      ];
      toast("KE IN_PROGRESS (dari DELAYED | CANCELED | UNLOADING)");
      if (allowedSources.includes(sourceBooking.status)) {
        // Default relative position
        const relativePositionTarget = targetData.bookingId
          ? {
              bookingId: targetData.bookingId,
              type: "AFTER" as const,
            }
          : {
              bookingId: "LAST",
              type: "AFTER" as const,
            };

        await BookingApi.dragAndDrop(sourceBooking.id!, {
          action: sameDock ? "MOVE_WITHIN_DOCK" : "MOVE_OUTSIDE_DOCK",
          toStatus: "IN_PROGRESS",
          dockId: targetData.dockId || sourceBooking.dockId,
          relativePositionTarget,
        });

        toast.success("Booking masuk ke antrian");
        return;
      }
    }

    /* =====================================================
     * 5. PINDAH DOCK (IN_PROGRESS ke dock lain)
     * ===================================================== */
    if (
      targetData.type === "dock-section" &&
      targetData.dockId &&
      sourceBooking.status === BookingStatus.IN_PROGRESS &&
      sourceBooking.dockId !== targetData.dockId
    ) {
      toast("PINDAH DOCK (IN_PROGRESS ke dock lain)");
      await BookingApi.dragAndDrop(sourceBooking.id!, {
        action: "MOVE_OUTSIDE_DOCK",
        toStatus: "IN_PROGRESS",
        dockId: targetData.dockId,
        relativePositionTarget: {
          bookingId: "LAST",
          type: "AFTER" as const,
        },
      });

      toast.success(`Booking dipindahkan ke dock`);
      return;
    }

    /* =====================================================
     * 6. DARI UNLOADING KE IN_PROGRESS (revert)
     * ===================================================== */
    if (
      targetData.bookingStatus === BookingStatus.IN_PROGRESS &&
      sourceBooking.status === BookingStatus.UNLOADING
    ) {
      toast("DARI UNLOADING KE IN_PROGRESS (revert)");
      const relativePositionTarget = targetData.bookingId
        ? {
            bookingId: targetData.bookingId,
            type: "AFTER" as const,
          }
        : {
            bookingId: "LAST",
            type: "AFTER" as const,
          };

      await BookingApi.dragAndDrop(sourceBooking.id!, {
        action: sameDock ? "MOVE_WITHIN_DOCK" : "MOVE_OUTSIDE_DOCK",
        toStatus: "IN_PROGRESS",
        dockId: targetData.dockId || sourceBooking.dockId,
        relativePositionTarget,
      });

      toast.success("Booking kembali ke antrian");
      return;
    }
  };

  const handleDragCancel = () => {
    setOnFloatingBooking(null);
  };

  let lastInvalidToastAt = 0;
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const sourceStatus = active.data.current?.sourceStatus;
    const targetData = over.data.current;

    if (!sourceStatus || !targetData) return;

    /* =====================================================
     * RULE: IN_PROGRESS / UNLOADING → DELAYED (ILLEGAL)
     * ===================================================== */
    const isIllegal =
      (sourceStatus === BookingStatus.IN_PROGRESS ||
        sourceStatus === BookingStatus.UNLOADING) &&
      targetData.bookingStatus === BookingStatus.DELAYED;

    if (isIllegal) {
      const now = Date.now();

      // anti-spam toast (1x per 1.5 detik)
      if (now - lastInvalidToastAt > 1500) {
        toast("Tidak bisa ke DELAYED, mungkin maksud Anda ke CANCELED");
        lastInvalidToastAt = now;
      }

      return;
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
    queryFn: async () => await BookingApi.getAllBookingsList(filter),
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

  /* groups booking by dock dan kelompokkan booking menjadi  : 
  IN_PROGRESS,
  UNLOADING,
  FINISHED,
  CANCELED
  "DELAYED",
  - 
  */
  type DockBookingGroup = {
    unloading: Booking[];
    inprogress: Booking[];
    finished: Booking[];
    canceled: Booking[];
    delayed: Booking[];
  };

  type GroupedBookingsByDock = Record<string, DockBookingGroup>;

  const filteredBookings = useMemo<GroupedBookingsByDock>(() => {
    const now = Date.now();

    const result: GroupedBookingsByDock = {};

    docks.forEach((dock) => {
      result[dock.id] = {
        unloading: [],
        inprogress: [],
        finished: [],
        canceled: [],
        delayed: [],
      };
    });

    bookings?.forEach((booking) => {
      if (!booking.dockId) return;

      const dockGroup = result[booking.dockId];
      if (!dockGroup) return;

      if (isDelayed(booking, now, delayTolerance)) {
        dockGroup.delayed.push({
          ...booking,
          status: BookingStatus.DELAYED,
        });
        return;
      }

      switch (booking.status) {
        case BookingStatus.UNLOADING:
          dockGroup.unloading.push(booking);
          break;

        case BookingStatus.IN_PROGRESS:
          dockGroup.inprogress.push(booking);
          break;

        case BookingStatus.FINISHED:
          dockGroup.finished.push(booking);
          break;

        case BookingStatus.CANCELED:
          dockGroup.canceled.push(booking);
          break;
      }
    });

    return result as GroupedBookingsByDock;
  }, [bookings, docks, delayTolerance]);

  const { delayedBookings, canceledBookings } = useMemo(() => {
    const delayed: Booking[] = [];
    const canceled: Booking[] = [];

    Object.values(filteredBookings).forEach((group) => {
      delayed.push(...group.delayed);
      canceled.push(...group.canceled);
    });

    return {
      delayedBookings: delayed,
      canceledBookings: canceled,
    };
  }, [filteredBookings]);

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

  // Open justify modal
  const openJustifyModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    (
      document.getElementById("QueueDetailModalJustify") as HTMLDialogElement
    )?.showModal();
  };

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
            <div className="flex gap-2 items-center">
              <button
                onClick={() =>
                  toast(
                    "Halaman ini masih dalam tahap pengerjaan, dan kemungkinan bertemu bug masih tinggi"
                  )
                }
                className="btn bg-black  border-dashed border text-white "
              >
                Masih Dikembangkan
              </button>
              {/* Toleransi */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-300">
                <Clock className="w-3 h-3 text-gray-500" />
                <input
                  type="number"
                  placeholder="15"
                  value={delayTolerance}
                  onChange={(e) =>
                    setDelayTolerance(parseInt(e.target.value) || 0)
                  }
                  className="w-10 text-center px-1 py-0.5 text-sm focus:outline-none"
                  min="0"
                  max="60"
                />
                <span className="text-xs text-gray-500">mnt</span>
              </div>

              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filter.searchKey || ""}
                  onChange={(e) =>
                    setFilter({ ...filter, searchKey: e.target.value })
                  }
                  className="w-full pl-8 pr-6 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Date */}
              <input
                value={filter.date || ""}
                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                type="date"
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[120px]"
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
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragCancel={handleDragCancel}
                >
                  {/* MAIN */}
                  <div className="grid gap-4 grid-cols-4 w-full">
                    {Object.entries(filteredBookings).map(
                      ([dockId, bookingGroup]) => {
                        const dock = docks.find((d) => d.id === dockId);
                        if (!dock) return null;

                        const unloadingBookings = bookingGroup.unloading;
                        const inProgressBookings = bookingGroup.inprogress;

                        return (
                          <div key={dockId} className="flex flex-col">
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

                            {/* ============================= */}
                            {/* UNLOADING SECTION - Bisa menerima drop */}
                            {/* ============================= */}
                            <SortableContainer
                              id={`unloading-section-${dockId}`}
                              type="dock-section"
                              bookingStatus={BookingStatus.UNLOADING}
                              dockId={dockId}
                              className="space-y-2 mb-4 min-h-[100px]"
                              acceptFrom={[
                                BookingStatus.IN_PROGRESS,
                                BookingStatus.DELAYED,
                              ]}
                            >
                              <div className="text-xs font-semibold text-warning uppercase mb-1">
                                Unloading ({unloadingBookings.length})
                              </div>

                              {/* Drop Zone di atas list (untuk area kosong) */}
                              {unloadingBookings.length === 0 ? (
                                <SortableContainer
                                  id={`unloading-empty-${dockId}`}
                                  type="dock-section"
                                  bookingStatus={BookingStatus.UNLOADING}
                                  dockId={dockId}
                                  className="card bg-base-200 min-h-[60px]"
                                  acceptFrom={[
                                    BookingStatus.IN_PROGRESS,
                                    BookingStatus.DELAYED,
                                  ]}
                                >
                                  <div className="card-body p-3 text-center text-xs text-gray-400">
                                    Kosong - Drop di sini
                                  </div>
                                </SortableContainer>
                              ) : (
                                <div className="space-y-2">
                                  {unloadingBookings.map((booking: Booking) => (
                                    <React.Fragment key={booking.id}>
                                      {/* Drop zone sebelum booking */}
                                      <SortableContainer
                                        id={`before-unloading-${booking.id}`}
                                        type="dock-section"
                                        bookingStatus={BookingStatus.UNLOADING}
                                        dockId={dockId}
                                        className="h-1 my-1"
                                        acceptFrom={[
                                          BookingStatus.IN_PROGRESS,
                                          BookingStatus.DELAYED,
                                        ]}
                                      >
                                        {/* Booking card */}
                                        <DraggableBookingCard
                                          booking={booking}
                                          onDetail={() => {
                                            setSelectedBookingId(booking.id!);
                                            (
                                              document.getElementById(
                                                "QueueDetailModalPreview"
                                              ) as HTMLDialogElement
                                            )?.showModal();
                                          }}
                                          onMarkFinished={() =>
                                            handleUpdateStatus({
                                              id: booking.id!,
                                              status: BookingStatus.FINISHED,
                                              actualFinishTime: new Date(),
                                            })
                                          }
                                        />
                                      </SortableContainer>
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}
                            </SortableContainer>
                            {/* ============================= */}
                            {/* IN_PROGRESS SECTION - Bisa tukar posisi */}
                            {/* ============================= */}
                            {/* IN_PROGRESS SECTION - Clean dengan DropZoneLine */}
                            <div className="space-y-2 flex-1">
                              <div className="text-xs font-semibold text-info uppercase mb-1">
                                Antrian ({inProgressBookings.length})
                              </div>

                              {inProgressBookings.length === 0 ? (
                                <SortableContainer
                                  id={`inprogress-empty-${dockId}`}
                                  type="dock-section"
                                  bookingStatus={BookingStatus.IN_PROGRESS}
                                  dockId={dockId}
                                  className="card bg-base-200 min-h-[100px] flex items-center justify-center"
                                  acceptFrom={[
                                    BookingStatus.IN_PROGRESS,
                                    BookingStatus.DELAYED,
                                    BookingStatus.CANCELED,
                                  ]}
                                >
                                  <div className="text-center text-xs text-gray-400">
                                    Kosong - Drop di sini
                                  </div>
                                </SortableContainer>
                              ) : (
                                <div className="space-y-1">
                                  {inProgressBookings.map(
                                    (booking: Booking, index) => (
                                      <React.Fragment key={booking.id}>
                                        {/* DROP ZONE LINE sebelum booking (untuk reorder) */}
                                        {index > 0 &&
                                          booking.status ===
                                            BookingStatus.IN_PROGRESS && (
                                            <DropZoneLine
                                              id={`drop-before-${booking.id}`}
                                              bookingStatus={
                                                BookingStatus.IN_PROGRESS
                                              }
                                              dockId={dockId}
                                              acceptFrom={[
                                                BookingStatus.IN_PROGRESS,
                                              ]}
                                              className="my-1"
                                            />
                                          )}

                                        {/* BOOKING CARD */}
                                        <DraggableBookingCard
                                          booking={booking}
                                          onDetail={() =>
                                            openJustifyModal(booking.id!)
                                          }
                                          onStartUnloading={() =>
                                            handleUpdateStatus({
                                              id: booking.id!,
                                              status: BookingStatus.UNLOADING,
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
                                        />
                                      </React.Fragment>
                                    )
                                  )}

                                  {/* DROP ZONE LINE di akhir (untuk drop setelah yang terakhir) */}
                                  {inProgressBookings.length > 0 && (
                                    <DropZoneLine
                                      id={`drop-end-${dockId}`}
                                      bookingStatus={BookingStatus.IN_PROGRESS}
                                      dockId={dockId}
                                      acceptFrom={[
                                        BookingStatus.IN_PROGRESS,
                                        BookingStatus.DELAYED,
                                        BookingStatus.CANCELED,
                                      ]}
                                      className="mt-2"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
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

                        {/* Toggle untuk show/hide inventory */}
                        <button className="btn btn-sm btn-ghost">
                          <ChevronUp size={16} />
                        </button>
                      </div>

                      <div className="flex gap-4">
                        {/* ============================= */}
                        {/* DELAYED - Hanya bisa drag OUT, tidak bisa di-drop IN */}
                        {/* ============================= */}
                        <SortableContainer
                          id="inventory-delayed-section"
                          type="inventory"
                          bookingStatus={BookingStatus.DELAYED}
                          acceptFrom={[]} // TIDAK MENERIMA DROP DARI MANA PUN
                          className="flex-1 min-h-[150px] p-4 rounded-lg border-2 border-dashed bg-amber-50 border-amber-200"
                        >
                          <h3 className="font-bold text-lg mb-2">
                            Delayed Bookings{" "}
                            <span className="badge badge-warning">
                              {delayedBookings.length}
                            </span>
                          </h3>

                          {/* Tambahkan div wrapper untuk drop zone */}
                          <div className="space-y-2">
                            {delayedBookings.map((booking: Booking) => (
                              <DraggableBookingCard
                                key={booking.id}
                                booking={booking}
                                draggable={true}
                              />
                            ))}
                          </div>
                        </SortableContainer>

                        {/* ============================= */}
                        {/* CANCELED - Bisa menerima drop dari semua */}
                        {/* ============================= */}
                        <SortableContainer
                          id="inventory-canceled-section"
                          type="inventory"
                          bookingStatus={BookingStatus.CANCELED}
                          acceptFrom={[
                            BookingStatus.IN_PROGRESS,
                            BookingStatus.UNLOADING,
                            BookingStatus.DELAYED,
                            BookingStatus.FINISHED,
                          ]}
                          className="flex-1 min-h-[150px] p-4 rounded-lg border-2 border-dashed bg-rose-50 border-rose-200"
                        >
                          <h3 className="font-bold text-lg mb-2">
                            Canceled Bookings{" "}
                            <span className="badge badge-error">
                              {canceledBookings.length}
                            </span>
                          </h3>

                          {/* Drop zone di dalam canceled */}
                          <div className="space-y-2">
                            {canceledBookings.length === 0 ? (
                              <SortableContainer
                                id="canceled-empty"
                                type="inventory"
                                bookingStatus={BookingStatus.CANCELED}
                                className="min-h-[80px] flex items-center justify-center"
                                acceptFrom={[
                                  BookingStatus.IN_PROGRESS,
                                  BookingStatus.UNLOADING,
                                  BookingStatus.DELAYED,
                                  BookingStatus.FINISHED,
                                ]}
                              >
                                <div className="text-center py-8 text-gray-400">
                                  <div className="text-3xl mb-2">🗑️</div>
                                  <p>Drop booking di sini untuk membatalkan</p>
                                </div>
                              </SortableContainer>
                            ) : (
                              canceledBookings.map((booking: Booking) => (
                                <DraggableBookingCard
                                  key={booking.id}
                                  booking={booking}
                                  draggable={true}
                                />
                              ))
                            )}
                          </div>
                        </SortableContainer>
                      </div>
                    </div>
                  </div>

                  <DragOverlay>
                    {activeBooking && (
                      <div className="card shadow-xl scale-105 rotate-1 border-primary">
                        <DraggableBookingCard
                          booking={activeBooking}
                          draggable={false}
                        />
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
