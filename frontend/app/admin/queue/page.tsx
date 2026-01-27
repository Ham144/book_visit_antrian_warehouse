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
  Clock,
  Pencil,
  Trash2,
  Users,
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
  DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";
import DraggableBookingCard from "@/components/admin/DraggableBookingCard";
import isDelayed from "@/lib/IsDelayed";
import { SortableContainer } from "@/components/admin/SortableContainer";
import { DropZoneLine } from "@/components/admin/DropConeLine";
import FullDroppableInventory from "@/components/admin/FullDroppableInventory";
import { IDock } from "@/types/dock.type";
import WarehouseSettingPreview from "@/components/admin/WarehouseSettingPreview";

export default function LiveQueuePage() {
  const { userInfo, socket } = useUserInfo();
  const queryClient = useQueryClient();
  const [selectedDockId, setSelectedDockId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [now, setNow] = useState(() => new Date());

  const [dockPageStart, setDockPageStart] = useState<number>();
  const [isDekstop, setIsDesktop] = useState<boolean>();

  // Kategori
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // UI/UX interaction
  const [isDragOverCanceled, setIsDragOverCanceled] = useState(false);
  const [isDragOverDelayed, setIsDragOverDelayed] = useState(false);
  const [onFloatingBooking, setOnFloatingBooking] = useState<Booking>();
  const [height, setHeight] = useState(200); // height inventory

  // Sensor untuk drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Handle drag events
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const booking = active.data.current?.booking;

    setActiveBooking(booking);
  };

  function getRelativePosition(
    sourceIndex: number,
    targetIndex: number,
  ): "BEFORE" | "AFTER" {
    if (sourceIndex === targetIndex) return "AFTER";
    return sourceIndex < targetIndex ? "AFTER" : "BEFORE";
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveBooking(null);

    if (!over) return;

    const sourceBooking: Booking = active.data.current?.booking;
    const targetData = over.data.current;

    if (!sourceBooking || !targetData) return;
    const sameDock = sourceBooking.dockId === targetData.dockId;
    //validasi
    const dock: IDock = docks.find((d: IDock) => d.id === targetData.dockId);
    if (targetData?.dockId && !dock?.isActive) {
      return toast.error("Dock sedang tidak aktif");
    }
    if (
      targetData?.dockId &&
      !dock?.allowedTypes?.includes(sourceBooking.Vehicle.vehicleType)
    ) {
      return toast.error(
        `Gate ${dock.name} Tidak menerima tipe kendaraan ${sourceBooking.Vehicle.vehicleType}`,
      );
    }
    /* =====================================================
     * 1. REORDER: SWAP IN_PROGRESS (antar booking di dock yang sama)
     * ===================================================== */
    if (
      targetData?.type === "booking-card" &&
      sourceBooking.status === BookingStatus.IN_PROGRESS &&
      targetData.bookingStatus === BookingStatus.IN_PROGRESS &&
      sameDock &&
      dock?.bookings?.length > 1
    ) {
      const dockGroup = filteredBookings[sourceBooking.dockId!];
      if (!dockGroup) return;

      const sourceIndex = dockGroup.inprogress.findIndex(
        (b) => b.id === sourceBooking.id,
      );
      const targetIndex = dockGroup.inprogress.findIndex(
        (b) => b.id === targetData.bookingId,
      );

      if (
        sourceIndex === -1 ||
        targetIndex === -1 ||
        sourceIndex === targetIndex
      ) {
        return;
      }

      try {
        await BookingApi.dragAndDrop(sourceBooking.id!, {
          action: "MOVE_WITHIN_DOCK",
          toStatus: "IN_PROGRESS",
          dockId: sourceBooking.dockId,
          relativePositionTarget: {
            bookingId: targetData.bookingId!,
            type: "SWAP",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
        return;
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Gagal memperbarui booking",
        );
      }
    }

    /* =====================================================
     * 2. KE UNLOADING (IN_PROGRESS | DELAYED | CANCELED)
     * ===================================================== */
    if (targetData.bookingStatus === BookingStatus.UNLOADING) {
      const targetData = over.data.current;

      const existingUnloading = filteredBookings[targetData.dockId!].unloading;

      if (existingUnloading.length > 0) {
        return toast.error(
          "Unloading di Gate" + dock.name + " sedang dilakukan",
        );
      }
      try {
        await BookingApi.dragAndDrop(sourceBooking.id!, {
          action: sameDock ? "MOVE_WITHIN_DOCK" : "MOVE_OUTSIDE_DOCK",
          toStatus: "UNLOADING",
          dockId: targetData.dockId || sourceBooking.dockId,
          relativePositionTarget: targetData.bookingId
            ? {
                bookingId: targetData.bookingId,
                type: "AFTER",
              }
            : { bookingId: "LAST", type: "AFTER" },
        });
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Gagal memperbarui booking",
        );
      }
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      return;
    }

    /* =====================================================
     * 3. KE CANCELED (inventory) - support both old and new drop area ID
     * ===================================================== */
    if (
      targetData.type === "inventory" &&
      targetData.bookingStatus === BookingStatus.CANCELED &&
      sourceBooking.status !== BookingStatus.CANCELED
    ) {
      setSelectedBookingId(sourceBooking.id!);
      setCanceledReason(
        `Dipindahkan via drag & drop - ${new Date().toLocaleString("id-ID")}`,
      );

      (
        document.getElementById("cancel-confirmation") as HTMLDialogElement
      )?.showModal();
      return;
    }

    // Handle canceled wrapper drop area
    if (
      over?.id === "inventory-CANCELED-wrapper" &&
      sourceBooking.status !== BookingStatus.CANCELED
    ) {
      setSelectedBookingId(sourceBooking.id!);
      setCanceledReason(
        `Dipindahkan via drag & drop - ${new Date().toLocaleString("id-ID")}`,
      );

      (
        document.getElementById("cancel-confirmation") as HTMLDialogElement
      )?.showModal();
      return;
    }

    /* =====================================================
     * 4. KE IN_PROGRESS (DELAYED | CANCELED | UNLOADING)
     * ===================================================== */
    if (targetData.bookingStatus === BookingStatus.IN_PROGRESS) {
      try {
        await BookingApi.dragAndDrop(sourceBooking.id!, {
          action: sameDock ? "MOVE_WITHIN_DOCK" : "MOVE_OUTSIDE_DOCK",
          toStatus: "IN_PROGRESS",
          dockId: targetData.dockId || sourceBooking.dockId,
          relativePositionTarget: targetData.bookingId
            ? {
                bookingId: targetData.bookingId,
                type: "AFTER",
              }
            : { bookingId: "LAST", type: "AFTER" },
        });
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Gagal memperbarui booking",
        );
      }

      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      return;
    }

    /* =====================================================
     * 5. PINDAH DOCK (IN_PROGRESS → dock lain)
     * ===================================================== */
    if (
      targetData.type === "dock-section" &&
      sourceBooking.status === BookingStatus.IN_PROGRESS &&
      sourceBooking.dockId !== targetData.dockId
    ) {
      try {
        await BookingApi.dragAndDrop(sourceBooking.id!, {
          action: "MOVE_OUTSIDE_DOCK",
          toStatus: "IN_PROGRESS",
          dockId: targetData.dockId,
          relativePositionTarget: {
            bookingId: "LAST",
            type: "AFTER",
          },
        });
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Gagal memperbarui booking",
        );
      }

      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      return;
    }
  };

  // Di handleDragOver atau custom hook
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (over?.data.current?.bookingStatus === BookingStatus.CANCELED) {
      setIsDragOverCanceled(true);
      setIsDragOverDelayed(false);
    } else if (over?.data.current?.bookingStatus === BookingStatus.DELAYED) {
      setIsDragOverDelayed(true);
      setIsDragOverCanceled(false);
    } else {
      setIsDragOverCanceled(false);
      setIsDragOverDelayed(false);
    }
  };

  const handleDragCancel = () => {
    setOnFloatingBooking(null);
  };

  const [canceledReason, setCanceledReason] = useState<string>("");
  const qq = useQueryClient();

  const bookingFilterQueueInit: BookingFilter = {
    warehouseId: userInfo?.homeWarehouse?.id,
    date: new Date().toISOString().split("T")[0],
  };

  const [filter, setFilter] = useState<BookingFilter>(bookingFilterQueueInit);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", filter],
    queryFn: async () => await BookingApi.semiDetailList(filter),
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
      return await BookingApi.updateBookingStatus({
        id,
        status,
        actualFinishTime,
      });
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
      setSelectedBookingId(null);
      (
        document.getElementById("cancel-confirmation") as HTMLDialogElement
      )?.close();
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
    const delayTolerance = userInfo?.homeWarehouse?.delayTolerance || 0;

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

    bookings?.forEach((booking: Booking) => {
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
  }, [bookings, docks, filter, now]);

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

  // Open justify modal
  const onDetail = (booking: Booking) => {
    setSelectedBookingId(booking.id!);
    (
      document.getElementById("QueueDetailModalJustify") as HTMLDialogElement
    )?.showModal();
  };

  // Mutation untuk konfirmasi datang
  const { mutateAsync: confirmArrival } = useMutation({
    mutationFn: async (booking: Booking) =>
      await BookingApi.updateBookingStatus({
        id: booking.id,
        status: BookingStatus.IN_PROGRESS,
        actualArrivalTime: booking?.actualArrivalTime ? null : new Date(),
        actualFinishTime: null,
      }),
    onSuccess: () => {
      qq.invalidateQueries({
        queryKey: ["bookings", filter],
      });
    },
  });

  //socket
  useEffect(() => {
    if (!socket || !userInfo?.homeWarehouse?.id) return;

    const warehouseId = userInfo.homeWarehouse.id;

    const handleConnect = () => {
      socket.emit("join_warehouse", {
        warehouseId,
      });
    };

    const handleSemiDetailList = () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
    };

    if (socket.connected) {
      socket.emit("join_warehouse", {
        warehouseId,
      });
    }

    socket.on("connect", handleConnect);
    socket.on("semi-detail-list", handleSemiDetailList);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("semi-detail-list", handleSemiDetailList);
      if (socket.connected) {
        socket.emit("leave_warehouse", {
          warehouseId,
        });
      }
    };
  }, [socket, queryClient, userInfo?.homeWarehouse?.id]);

  //triger kategorisasi ulang filteredBookings
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30_000); // tiap 30 detik (atau 1 menit)

    return () => clearInterval(timer);
  }, []);

  //width check
  useEffect(() => {
    //dock page
    const parsed = Number(localStorage.getItem("dockPageStart"));
    const value = Number.isNaN(parsed) ? 0 : parsed;
    localStorage.setItem("dockPageStart", String(value));

    //isDekstop
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", handler);

    setDockPageStart(value);
    return () => media.removeEventListener("change", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col">
        <WarehouseSettingPreview />
        <main className="flex-1 ">
          <div className="space-y-6">
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
                <button
                  disabled={dockPageStart === 0}
                  onClick={() => {
                    setDockPageStart((prev) => {
                      const value = prev - 1;
                      window.localStorage.setItem(
                        "dockPageStart",
                        value.toString(),
                      );
                      return value;
                    });
                  }}
                  className="btn btn-primary mr-2 disabled:bg-slate-400"
                >
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
                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 w-full ">
                    {Object.entries(filteredBookings)
                      .splice(dockPageStart, isDekstop ? 4 : 2)
                      .map(([dockId, bookingGroup]) => {
                        const dock: IDock = docks.find((d) => d.id === dockId);
                        if (!dock) return null;

                        const unloadingBookings = bookingGroup.unloading;
                        const inProgressBookings = bookingGroup.inprogress;

                        return (
                          <div
                            key={dockId}
                            className="flex flex-col gap-y-2 border border-dashed p-1"
                          >
                            {/* Dock Header - Compact & Modern */}
                            <div
                              className={`relative px-3 py-2 cursor-pointer rounded-xl transition-all duration-300 
    ${
      dock?.isActive
        ? "bg-gradient-to-r from-primary/90 to-primary/70 shadow-lg shadow-primary/20"
        : "bg-gradient-to-r from-slate-500/80 to-slate-400/80"
    }
    text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.99]
    group
  `}
                              onClick={() => {
                                setSelectedDockId(dock.id!);
                                (
                                  document.getElementById(
                                    "dock-option-modal",
                                  ) as HTMLDialogElement
                                )?.showModal();
                              }}
                            >
                              {/* Header Content Grid */}
                              <div className="flex items-center justify-between gap-2">
                                {/* Left: Dock Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {/* Dock Name with Badge */}
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-bold text-base truncate">
                                        {dock.name}
                                      </h3>
                                      {/* Active Status Indicator */}
                                      <div
                                        className={`
            w-2 h-2 rounded-full
            ${dock.isActive ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}
          `}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Stats & Actions */}
                                <div className="flex items-center gap-3">
                                  {/* Queue Count with Icon */}
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3 text-white/70" />
                                      <span className="text-sm font-bold">
                                        {inProgressBookings.length}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-white/70 uppercase tracking-wide">
                                      Antrian
                                    </span>
                                  </div>

                                  {/* Vertical Divider */}
                                  <div className="w-px h-6 bg-white/30" />

                                  {/* Edit Button */}
                                  <div
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 
                     transition-colors group-hover:bg-white/20"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              </div>

                              {/* Hover Tooltip for More Types */}
                              {dock?.allowedTypes?.length > 2 && (
                                <div
                                  className="absolute bottom-0  mt-1 w-48 bg-gray-800 text-white 
                   text-xs rounded-lg p-2 shadow-xl  opacity-0 
                   group-hover:opacity-100 pointer-events-none transition-opacity "
                                >
                                  <div className="font-semibold mb-1">
                                    Jenis Kendaraan:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {dock.allowedTypes.map((type) => (
                                      <span
                                        key={type}
                                        className="px-1.5 py-0.5 bg-gray-700 rounded"
                                      >
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ============================= */}

                            {/* UNLOADING SECTION - Bisa menerima drop */}
                            {/* ============================= */}

                            <div className="text-xs font-semibold text-warning uppercase pb-4 ">
                              Unloading Area
                            </div>
                            <SortableContainer
                              id={`unloading-section-${dockId}`}
                              type="dock-section"
                              bookingStatus={BookingStatus.UNLOADING}
                              dockId={dockId}
                              className="space-y-2  min-h-[100px] "
                              acceptFrom={[
                                BookingStatus.IN_PROGRESS,
                                BookingStatus.DELAYED,
                                BookingStatus.CANCELED,
                              ]}
                            >
                              {/* Drop Zone di atas list (untuk area kosong) */}
                              {unloadingBookings.length === 0 ? (
                                <SortableContainer
                                  id={`unloading-empty-${dockId}`}
                                  type="dock-section"
                                  bookingStatus={BookingStatus.UNLOADING}
                                  dockId={dockId}
                                  acceptFrom={[
                                    BookingStatus.IN_PROGRESS,
                                    BookingStatus.DELAYED,
                                  ]}
                                  isEmptyZone={true}
                                />
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
                                          onDetail={() => onDetail(booking)}
                                          droppable={false}
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

                            {/* IN_PROGRESS SECTION - Clean dengan DropZoneLine */}
                            <div className="space-y-2 flex-1  flex flex-col max-h-96">
                              <div className="text-xs font-semibold text-info uppercase mb-1 mt-7">
                                Antrian ({inProgressBookings.length})
                              </div>

                              {inProgressBookings.length === 0 ? (
                                <SortableContainer
                                  id={`inprogress-empty-${dockId}`}
                                  type="dock-section"
                                  bookingStatus={BookingStatus.IN_PROGRESS}
                                  dockId={dockId}
                                  className="card bg-base-200 min-h-[100px] flex items-center justify-center"
                                  isEmptyZone={true}
                                  acceptFrom={[
                                    BookingStatus.IN_PROGRESS,
                                    BookingStatus.DELAYED,
                                    BookingStatus.CANCELED,
                                  ]}
                                />
                              ) : (
                                <div className="space-y-1 max-h-96 flex  flex-col overflow-auto">
                                  {/* 🔥 DROP ZONE di ATAS booking PERTAMA */}
                                  <DropZoneLine
                                    id={`drop-before-first-${dockId}`}
                                    bookingStatus={BookingStatus.IN_PROGRESS}
                                    dockId={dockId}
                                    acceptFrom={[
                                      BookingStatus.IN_PROGRESS,
                                      BookingStatus.DELAYED,
                                      BookingStatus.CANCELED,
                                    ]}
                                    className="mb-2"
                                  />

                                  {inProgressBookings.map(
                                    (booking: Booking) => (
                                      <React.Fragment key={booking.id}>
                                        {/* Drop zone sebelum booking */}
                                        <SortableContainer
                                          id={`before-inprogress-${booking.id}`}
                                          type="dock-section"
                                          bookingStatus={
                                            BookingStatus.IN_PROGRESS
                                          }
                                          dockId={dockId}
                                          className="h-1 my-1"
                                          acceptFrom={[
                                            BookingStatus.IN_PROGRESS,
                                            BookingStatus.DELAYED,
                                            BookingStatus.CANCELED,
                                          ]}
                                          children
                                        ></SortableContainer>
                                        <DraggableBookingCard
                                          booking={booking}
                                          onDetail={() => onDetail(booking)}
                                          onCancel={() =>
                                            handleUpdateStatus({
                                              id: booking.id!,
                                              status: BookingStatus.CANCELED,
                                            })
                                          }
                                          onActualArrived={() =>
                                            confirmArrival(booking)
                                          }
                                        />
                                      </React.Fragment>
                                    ),
                                  )}

                                  {/* 🔥 DROP ZONE di BAWAH booking TERAKHIR */}
                                  <DropZoneLine
                                    id={`drop-after-last-${dockId}`}
                                    bookingStatus={BookingStatus.IN_PROGRESS}
                                    dockId={dockId}
                                    acceptFrom={[
                                      BookingStatus.IN_PROGRESS,
                                      BookingStatus.DELAYED,
                                      BookingStatus.CANCELED,
                                    ]}
                                    className="mt-2"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  {/* INVENTORY SECTION - Fixed positioning dengan z-index yang tepat */}
                  <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-400 shadow-lg z-10">
                    {/* Handle untuk tarik */}
                    <div
                      className="h-6 bg-gray-200 border-t border-gray-300 cursor-ns-resize flex justify-center items-center z-50 relative"
                      onMouseDown={(e) => {
                        const startY = e.clientY;
                        const startHeight = height;

                        // PREVENT TEXT SELECTION & GHOST IMAGE
                        e.preventDefault();
                        e.stopPropagation();

                        const handleMouseMove = (moveEvent) => {
                          const delta = startY - moveEvent.clientY;
                          setHeight(
                            Math.max(100, Math.min(600, startHeight + delta)),
                          );
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener(
                            "mousemove",
                            handleMouseMove,
                          );
                          document.removeEventListener(
                            "mouseup",
                            handleMouseUp,
                          );
                        };

                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                      }}
                    >
                      <div className="w-16 h-1 bg-gray-400 rounded"></div>
                    </div>
                    {/* Content - z-index lebih rendah dari handle tapi cukup untuk drop detection */}
                    <div
                      style={{ height: `${height}px` }}
                      className="overflow-auto  z-30"
                    >
                      <div className="grid grid-cols-2 gap-x-3 md:px-52">
                        {/* DELAYED */}
                        <div className="p-2 -m-2 flex-1">
                          <FullDroppableInventory
                            bookings={delayedBookings}
                            status={BookingStatus.DELAYED}
                            title="Delayed Bookings"
                            onDetail={(booking) => {
                              onDetail(booking);
                            }}
                            badgeColor="badge-warning"
                            bgColor="bg-amber-50"
                            borderColor="border-amber-200"
                            icon={<Clock className="w-5 h-5 mr-2" />}
                          />
                        </div>

                        {/* CANCELED */}
                        <div className="p-2 -m-2 flex-1">
                          {/* 🔥 jangan dihapus pembungkus nya sangat berguna*/}
                          <FullDroppableInventory
                            bookings={canceledBookings}
                            status={BookingStatus.CANCELED}
                            title="Canceled Bookings"
                            onDetail={(booking) => {
                              onDetail(booking);
                            }}
                            badgeColor="badge-error"
                            bgColor="bg-red-50"
                            borderColor="border-rose-200"
                            icon={<Trash2 className="w-5 h-5 mr-2" />}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DragOverlay - z-index tinggi untuk visual feedback, tapi tidak menghalangi drop detection */}
                  <DragOverlay style={{ zIndex: 9999 }}>
                    {activeBooking && (
                      <div className="card shadow-xl scale-105 rotate-1 border-primary pointer-events-none">
                        <DraggableBookingCard
                          booking={activeBooking}
                          draggable={false}
                        />
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>

                <button
                  disabled={
                    isLoading ||
                    dockPageStart + (isDekstop ? 4 : 2) >= docks.length
                  }
                  className="btn btn-primary ml-2 disabled:bg-slate-400"
                  onClick={() =>
                    setDockPageStart((prev) => {
                      const value = prev + 1;
                      window.localStorage.setItem(
                        "dockPageStart",
                        value.toString(),
                      );
                      return value;
                    })
                  }
                >
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
        setNow={setNow}
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
