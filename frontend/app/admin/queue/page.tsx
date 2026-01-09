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
  CalendarIcon,
  Clock,
  Pencil,
  Trash2,
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

export default function LiveQueuePage() {
  const { userInfo } = useUserInfo();
  const queryClient = useQueryClient();
  const [selectedDockId, setSelectedDockId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  // Kategori
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // UI/UX interaction
  const [isDragOverCanceled, setIsDragOverCanceled] = useState(false);
  const [isDragOverDelayed, setIsDragOverDelayed] = useState(false);
  const [onFloatingBooking, setOnFloatingBooking] = useState<Booking>();
  const [height, setHeight] = useState(200); // height inventory

  //fundamental properties
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
  };

  function getRelativePosition(
    sourceIndex: number,
    targetIndex: number
  ): "BEFORE" | "AFTER" {
    if (sourceIndex === targetIndex) return "AFTER";
    return sourceIndex < targetIndex ? "AFTER" : "BEFORE";
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveBooking(null);

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
      const dockGroup = filteredBookings[sourceBooking.dockId!];

      const sourceIndex = dockGroup.inprogress.findIndex(
        (b) => b.id === sourceBooking.id
      );
      const targetIndex = dockGroup.inprogress.findIndex(
        (b) => b.id === targetData.booking.id
      );

      const relativeType = getRelativePosition(sourceIndex, targetIndex);

      try {
        await BookingApi.dragAndDrop(sourceBooking.id!, {
          action: "MOVE_WITHIN_DOCK",
          toStatus: "IN_PROGRESS",
          dockId: sourceBooking.dockId,
          relativePositionTarget: {
            bookingId: targetData.booking.id!,
            type: relativeType,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
        return;
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Gagal memperbarui booking"
        );
      }
    }

    /* =====================================================
     * 2. KE UNLOADING (IN_PROGRESS | DELAYED | CANCELED)
     * ===================================================== */
    if (targetData.bookingStatus === BookingStatus.UNLOADING) {
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

      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      return;
    }

    /* =====================================================
     * 3. KE CANCELED (inventory)
     * ===================================================== */
    if (
      targetData.type === "inventory" &&
      sourceBooking.status !== BookingStatus.CANCELED
    ) {
      setSelectedBookingId(sourceBooking.id!);
      setCanceledReason(
        `Dipindahkan via drag & drop - ${new Date().toLocaleString()}`
      );

      (
        document.getElementById("cancel-confirmation") as HTMLDialogElement
      )?.showModal();
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      return;
    }

    /* =====================================================
     * 4. KE IN_PROGRESS (DELAYED | CANCELED | UNLOADING)
     * ===================================================== */
    if (targetData.bookingStatus === BookingStatus.IN_PROGRESS) {
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
      await BookingApi.dragAndDrop(sourceBooking.id!, {
        action: "MOVE_OUTSIDE_DOCK",
        toStatus: "IN_PROGRESS",
        dockId: targetData.dockId,
        relativePositionTarget: {
          bookingId: "LAST",
          type: "AFTER",
        },
      });

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
  }, [bookings, docks, delayTolerance, filter]);

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
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() =>
                  toast(
                    "Halaman ini masih dalam tahap pengerjaan, dan kemungkinan bertemu bug masih tinggi"
                  )
                }
                className="btn bg-black border-dashed border text-white hover:bg-gray-800 transition-colors"
              >
                Masih Dikembangkan
              </button>

              {/* Toleransi */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-300 hover:border-gray-400 transition-colors">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs sm:text-sm">
                  Toleransi Keterlambatan
                </span>
                <input
                  type="number"
                  placeholder="15"
                  value={delayTolerance}
                  onChange={(e) =>
                    setDelayTolerance(parseInt(e.target.value) || 0)
                  }
                  className="w-10 text-center px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                  min="0"
                  max="60"
                />
                <span className="text-xs text-gray-500">mnt</span>
              </div>

              {/* Date Picker Minimalis */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-300 hover:border-gray-400 transition-colors">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <div className="flex gap-1 items-center">
                  <select
                    value={
                      filter.date
                        ? new Date(filter.date).getDate()
                        : new Date().getDate()
                    }
                    onChange={(e) => {
                      const day = parseInt(e.target.value);
                      const currentDate = filter.date
                        ? new Date(filter.date)
                        : new Date();
                      currentDate.setDate(day);
                      setFilter({
                        ...filter,
                        date: currentDate.toISOString().split("T")[0],
                      });
                    }}
                    className="px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded w-12"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400">/</span>
                  <select
                    value={
                      filter.date
                        ? new Date(filter.date).getMonth() + 1
                        : new Date().getMonth() + 1
                    }
                    onChange={(e) => {
                      const month = parseInt(e.target.value) - 1;
                      const currentDate = filter.date
                        ? new Date(filter.date)
                        : new Date();
                      currentDate.setMonth(month);
                      setFilter({
                        ...filter,
                        date: currentDate.toISOString().split("T")[0],
                      });
                    }}
                    className="px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded w-14"
                  >
                    {[
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "Mei",
                      "Jun",
                      "Jul",
                      "Agu",
                      "Sep",
                      "Okt",
                      "Nov",
                      "Des",
                    ].map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400">/</span>
                  <select
                    value={
                      filter.date
                        ? new Date(filter.date).getFullYear()
                        : new Date().getFullYear()
                    }
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      const currentDate = filter.date
                        ? new Date(filter.date)
                        : new Date();
                      currentDate.setFullYear(year);
                      setFilter({
                        ...filter,
                        date: currentDate.toISOString().split("T")[0],
                      });
                    }}
                    className="px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded w-16"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return year;
                    }).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const today = new Date();
                    setFilter({
                      ...filter,
                      date: today.toISOString().split("T")[0],
                    });
                  }}
                  className="ml-1 px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors"
                >
                  Hari Ini
                </button>
              </div>
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
                  <div className="grid gap-3 grid-cols-4 w-full">
                    {Object.entries(filteredBookings).map(
                      ([dockId, bookingGroup]) => {
                        const dock = docks.find((d) => d.id === dockId);
                        if (!dock) return null;

                        const unloadingBookings = bookingGroup.unloading;
                        const inProgressBookings = bookingGroup.inprogress;

                        return (
                          <div key={dockId} className="flex flex-col gap-y-6 ">
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

                            <div className="text-xs font-semibold text-warning uppercase ">
                              Unloading ({unloadingBookings.length})
                            </div>
                            <SortableContainer
                              id={`unloading-section-${dockId}`}
                              type="dock-section"
                              bookingStatus={BookingStatus.UNLOADING}
                              dockId={dockId}
                              className="space-y-2  min-h-[100px]"
                              acceptFrom={[
                                BookingStatus.IN_PROGRESS,
                                BookingStatus.DELAYED,
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
                                          onMarkFinished={() =>
                                            handleUpdateStatus({
                                              id: booking.id!,
                                              status: BookingStatus.FINISHED,
                                              actualFinishTime: new Date(),
                                            })
                                          }
                                        />
                                      </React.Fragment>
                                    )
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
                      }
                    )}
                  </div>
                  {/* INVENTORY SECTION */}
                  <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-400 shadow-lg">
                    {/* Handle untuk tarik */}
                    <div
                      className="h-6 bg-gray-200 border-t border-gray-300 cursor-ns-resize flex justify-center items-center"
                      onMouseDown={(e) => {
                        const startY = e.clientY;
                        const startHeight = height;

                        // PREVENT TEXT SELECTION & GHOST IMAGE
                        e.preventDefault();
                        e.stopPropagation();

                        const handleMouseMove = (moveEvent) => {
                          const delta = startY - moveEvent.clientY;
                          setHeight(
                            Math.max(100, Math.min(600, startHeight + delta))
                          );
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener(
                            "mousemove",
                            handleMouseMove
                          );
                          document.removeEventListener(
                            "mouseup",
                            handleMouseUp
                          );
                        };

                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                      }}
                    >
                      <div className="w-16 h-1 bg-gray-400 rounded"></div>
                    </div>

                    {/* Content */}
                    <div
                      style={{ height: `${height}px` }}
                      className="overflow-auto "
                    >
                      <div className="grid grid-cols-2 gap-x-3 md:px-52">
                        {/* DELAYED */}
                        <div className="p-2 -m-2 flex-1">
                          <FullDroppableInventory
                            bookings={delayedBookings}
                            status={BookingStatus.DELAYED}
                            title="Delayed Bookings"
                            badgeColor="badge-warning"
                            bgColor="bg-amber-50"
                            onDetail={onDetail}
                            borderColor="border-amber-200"
                            icon={<Clock className="w-5 h-5 mr-2" />}
                            isDragOverDelayed={isDragOverDelayed}
                          />
                        </div>

                        {/* CANCELED */}
                        <div className="p-2 -m-2 flex-1">
                          {/* 🔥 jangan dihapus pembungkus nya sangat berguna*/}
                          <FullDroppableInventory
                            bookings={canceledBookings}
                            status={BookingStatus.CANCELED}
                            title="Canceled Bookings"
                            badgeColor="badge-error"
                            bgColor="bg-red-50"
                            borderColor="border-rose-200"
                            icon={<Trash2 className="w-5 h-5 mr-2" />}
                          />
                        </div>
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
