import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Booking } from "@/types/booking.type";
import { BookingApi } from "@/api/booking.api";
import { DockApi } from "@/api/dock.api";
import { Vacant } from "@/types/vacant.type";
import { IDockBusyTime } from "@/types/busyTime.type";
import { Days } from "@/types/shared.type";
import { IDock } from "@/types/dock.type";
import { DAYS } from "@/lib/constant";
import { Calendar, Clock } from "lucide-react";

interface PreviewSlotDisplayProps {
  formData: Booking;
  onUpdateFormData: (updates: Partial<Booking>) => void;
  mode?: "preview" | "create" | "justify";
  currentBookingId?: string;
}

const PreviewSlotDisplay = ({
  formData,
  onUpdateFormData,
  mode = "create",
  currentBookingId,
}: PreviewSlotDisplayProps) => {
  const isReadOnly = mode === "preview";
  const isAutoEfficientActive = true;

  // States
  const [visualStartTime, setVisualStartTime] = useState<string | null>(null);
  const [visualEndTime, setVisualEndTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>();
  const [selectedWeek, setSelectedWeek] = useState<Date | null>();
  const [notes, setNotes] = useState(formData?.notes || "");

  // Queries
  const { data: availableDocks } = useQuery({
    queryKey: ["docks", formData?.warehouseId],
    queryFn: () => DockApi.getDocksByWarehouseId(formData.warehouseId!),
    enabled: !!formData?.warehouseId && !isReadOnly && mode === "justify",
  });

  const { data: dockDetail, isLoading: loadingDock } = useQuery({
    queryKey: ["dock-detail", formData?.dockId],
    queryFn: () => DockApi.getDockDetail(formData.dockId!),
    enabled: !!formData?.dockId,
  });

  const { data: allBookings } = useQuery({
    queryKey: ["bookings", formData?.warehouseId],
    queryFn: () =>
      BookingApi.getAllBookingsList({
        warehouseId: formData.warehouseId,
        page: 1,
      }),
    enabled: !!formData?.warehouseId,
    refetchInterval: 5000, // tiap 5 detik
  });

  // Helper functions
  const parseTimeToHours = (timeString: string | null): number | null => {
    if (!timeString) return null;
    const match = timeString.match(/^(\d{1,2}):(\d{2})/);
    return match ? parseInt(match[1]) + parseInt(match[2]) / 60 : null;
  };

  const formatHoursToTimeString = (decimalHours: number): string => {
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;
  };

  const formatDateToString = (date: Date): string =>
    date.toISOString().split("T")[0];

  const getDayNameFromDate = (date: Date): string => {
    return ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][
      date.getDay()
    ];
  };
  const getDateFromDayNameInSelectedWeek = (
    dayName: string,
    selectedDate: Date
  ): Date => {
    const targetDayIndex = DAYS.indexOf(dayName);
    if (targetDayIndex === -1) {
      throw new Error("Invalid day name");
    }

    const base = new Date(selectedDate);

    // mundur ke Minggu di minggu tersebut
    const startOfWeek = new Date(base);
    startOfWeek.setDate(base.getDate() - base.getDay());

    // maju ke hari target
    const result = new Date(startOfWeek);
    result.setDate(startOfWeek.getDate() + targetDayIndex);

    return result;
  };

  const mapDayIndexToEnum = (dayIndex: number): Days => {
    return [
      Days.MINGGU,
      Days.SENIN,
      Days.SELASA,
      Days.RABU,
      Days.KAMIS,
      Days.JUMAT,
      Days.SABTU,
    ][dayIndex];
  };

  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getApplicableBusyTimesForDate = (date: Date): IDockBusyTime[] => {
    if (!busyTimes) return [];
    const dayEnum = mapDayIndexToEnum(date.getDay());
    return busyTimes.filter((bt: IDockBusyTime) => {
      if (bt.recurring === "DAILY") return true;
      if (bt.recurring === "WEEKLY")
        return bt.recurringCustom?.includes(dayEnum);
      if (bt.recurring === "MONTHLY")
        return date.getDate() === bt.recurringStep;
      return false;
    });
  };

  const getDateBookingsForDate = (date: Date): any[] => {
    if (!filteredDockBookings) return [];
    const dateString = formatDateToString(date);
    return filteredDockBookings.filter(
      (b: any) =>
        b?.arrivalTime &&
        formatDateToString(new Date(b.arrivalTime)) === dateString
    );
  };

  // Computed values
  const busyTimes: IDockBusyTime[] =
    (dockDetail?.busyTimes as IDockBusyTime[]) || [];
  const dockBookings = useMemo(
    () =>
      allBookings?.filter(
        (b: any) => b.dockId === formData.dockId && b.status !== "CANCELED"
      ) || [],
    [allBookings, formData?.dockId]
  );

  const filteredDockBookings = useMemo(
    () => dockBookings.filter((b: any) => b.id !== currentBookingId),
    [dockBookings, currentBookingId]
  );

  const weekDays = useMemo(() => {
    if (!selectedWeek) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(selectedWeek);
      day.setDate(selectedWeek.getDate() + i);
      return day;
    });
  }, [selectedWeek]);

  const availableSchedulesByDay = useMemo(() => {
    if (!dockDetail?.vacants || !selectedWeek) return {};

    const schedulesByDay: Record<string, any[]> = {};
    weekDays.forEach((date) => {
      const dayEnum = mapDayIndexToEnum(date.getDay());
      const dateString = formatDateToString(date);
      const dayVacants = dockDetail.vacants.filter(
        (v: Vacant) => v.day === dayEnum
      );

      schedulesByDay[dateString] = dayVacants
        .filter((v: Vacant) => v.availableFrom && v.availableUntil)
        .map((v) => ({
          id: v.id || `vacant-${dayEnum}-${dateString}`,
          day: getDayNameFromDate(date),
          startTime: v.availableFrom!,
          endTime: v.availableUntil!,
          date: dateString,
        }));
    });

    return schedulesByDay;
  }, [dockDetail?.vacants, selectedWeek, weekDays]);

  // Event handlers
  const handleWeekSelect = (weekStart: Date) => {
    setSelectedWeek(weekStart);
    setSelectedDate(null);
    setVisualStartTime(null);
    setVisualEndTime(null);
    onUpdateFormData({ arrivalTime: null, estimatedFinishTime: null });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setVisualStartTime(null);
    setVisualEndTime(null);
    onUpdateFormData({ arrivalTime: null, estimatedFinishTime: null });
  };

  const handleDockChange = (dockId: string) => {
    onUpdateFormData({ dockId });
    setVisualStartTime(null);
    setVisualEndTime(null);
    setSelectedDate(null);
    setSelectedWeek(null);
  };

  const checkTimeCollisions = (
    startTime: number,
    durationHours: number,
    events: any[]
  ): boolean => {
    const endTime = startTime + durationHours;
    for (const event of events) {
      if (startTime < event.end && endTime > event.start) {
        return true;
      }
    }
    return false;
  };

  const handleClickOnTrack = (day: string, clickedTimeDecimal: number) => {
    if (isReadOnly || !selectedDate || !formData.Vehicle?.durasiBongkar) return;

    const date = getDateFromDayNameInSelectedWeek(day, selectedDate);
    const isPastDate =
      date < new Date(new Date().setDate(new Date().getDate() - 1));
    if (isPastDate) {
      return toast.error("Tanggal sudah lewat");
    }
    handleDateSelect(date);

    const dateString = formatDateToString(date);
    const schedules = availableSchedulesByDay[dateString] || [];

    // Cari schedule aktif berdasarkan waktu yang diklik
    const activeSchedule =
      schedules.find((schedule) => {
        const scheduleStart =
          parseTimeToHours(schedule.startTime) ?? parseTimeToHours("06:00:00")!;
        const scheduleEnd =
          parseTimeToHours(schedule.endTime) ?? parseTimeToHours("18:00:00")!;
        return (
          clickedTimeDecimal >= scheduleStart &&
          clickedTimeDecimal < scheduleEnd
        );
      }) || schedules[0];

    const scheduleStartHour =
      (activeSchedule &&
        (parseTimeToHours(activeSchedule.startTime) ??
          parseTimeToHours("06:00:00")!)) ||
      6;
    const scheduleEndHour =
      (activeSchedule &&
        (parseTimeToHours(activeSchedule.endTime) ??
          parseTimeToHours("18:00:00")!)) ||
      18;

    const scheduleEndMinutes = Math.round(scheduleEndHour * 60);

    const durationMinutes = formData.Vehicle.durasiBongkar;
    const durationHours = durationMinutes / 60;

    // Default: gunakan waktu klik
    let selectedStartHour = clickedTimeDecimal;

    // Jika auto efficient aktif, coba geser ke belakang ke waktu terkait terdekat
    if (isAutoEfficientActive) {
      const applicableBusyTimes = getApplicableBusyTimesForDate(date);
      const dateBookings = getDateBookingsForDate(date);

      type EventBoundary = { start: number; end: number };

      const eventBoundaries: EventBoundary[] = [
        // Busy times
        ...applicableBusyTimes.map((bt) => ({
          start: parseTimeToHours(bt.from) || 0,
          end: parseTimeToHours(bt.to) || 0,
        })),
        // Bookings
        ...dateBookings.map((b: any) => {
          const bDate = new Date(b.arrivalTime);
          const fDate = new Date(b.estimatedFinishTime);
          return {
            start: bDate.getHours() + bDate.getMinutes() / 60,
            end: fDate.getHours() + fDate.getMinutes() / 60,
          };
        }),
      ].filter(
        (ev) => ev.end > scheduleStartHour && ev.start < scheduleEndHour
      );

      // PERBAIKAN: Hitung waktu sekarang dalam format yang sama
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;

      // FIX: pakai `date`, bukan `selectedDate`
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      let minimumAllowedHour = scheduleStartHour;

      if (isToday) {
        const bufferMinutes = 30;
        minimumAllowedHour = Math.max(
          currentHour + bufferMinutes / 60,
          scheduleStartHour
        );
      }

      // Batas awal yang mungkin: minimumAllowedHour atau awal schedule
      const candidateStarts: number[] = [minimumAllowedHour];

      // Tambahkan akhir event sebelum waktu klik (jika setelah minimumAllowedHour)
      eventBoundaries.forEach((ev) => {
        if (ev.end <= clickedTimeDecimal && ev.end > minimumAllowedHour) {
          candidateStarts.push(ev.end);
        }
      });

      // PERBAIKAN: Filter candidateStarts yang valid (tidak bertabrakan)
      const validCandidateStarts = candidateStarts.filter((start) => {
        const candidateEnd = start + durationHours;

        // Cek tidak bertabrakan dengan event lain
        const hasCollision = eventBoundaries.some(
          (ev) => start < ev.end && candidateEnd > ev.start
        );

        // Cek tidak melebihi schedule end
        const withinSchedule = candidateEnd <= scheduleEndHour;

        return !hasCollision && withinSchedule;
      });

      // Ambil start terbaik (paling dekat dengan clickedTimeDecimal, tapi >= minimumAllowedHour)
      if (validCandidateStarts.length > 0) {
        // Cari yang paling dekat dengan waktu klik, tapi tidak kurang dari minimumAllowedHour
        const bestAnchor = validCandidateStarts.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev - clickedTimeDecimal);
          const currDiff = Math.abs(curr - clickedTimeDecimal);

          // Prioritaskan yang >= minimumAllowedHour dan paling dekat dengan klik
          if (curr >= minimumAllowedHour && currDiff < prevDiff) {
            return curr;
          }
          return prev;
        });

        // Validasi final
        const candidateEnd = bestAnchor + durationHours;
        const finalHasCollision = eventBoundaries.some(
          (ev) => bestAnchor < ev.end && candidateEnd > ev.start
        );

        if (!finalHasCollision && candidateEnd <= scheduleEndHour) {
          selectedStartHour = bestAnchor;

          // PERBAIKAN: Jika waktu terpilih < minimumAllowedHour, beri peringatan
          if (bestAnchor < minimumAllowedHour) {
            toast.warning(
              "Waktu booking disesuaikan ke waktu terdekat yang tersedia",
              {
                position: "top-center",
              }
            );
          } else {
            toast.success("Jam booking dioptimalkan", {
              position: "top-center",
            });
          }
        } else {
          // Fallback ke waktu klik asli (jika valid)
          if (
            clickedTimeDecimal >= minimumAllowedHour &&
            !checkTimeCollisions(
              clickedTimeDecimal,
              durationHours,
              eventBoundaries
            ) &&
            clickedTimeDecimal + durationHours <= scheduleEndHour
          ) {
            selectedStartHour = clickedTimeDecimal;
            toast.info("Menggunakan waktu yang Anda pilih", {
              position: "top-center",
            });
          } else {
            toast.error("Tidak ada slot waktu yang tersedia", {
              position: "top-center",
            });
            return; // Batalkan pemilihan waktu
          }
        }
      } else {
        // Tidak ada candidate yang valid, coba gunakan waktu klik asli
        if (
          clickedTimeDecimal >= minimumAllowedHour &&
          !checkTimeCollisions(
            clickedTimeDecimal,
            durationHours,
            eventBoundaries
          ) &&
          clickedTimeDecimal + durationHours <= scheduleEndHour
        ) {
          selectedStartHour = clickedTimeDecimal;
          toast.info("Menggunakan waktu yang Anda pilih", {
            position: "top-center",
          });
        } else {
          toast.error("Tidak ada slot waktu yang cocok", {
            position: "top-center",
          });
          return; // Batalkan pemilihan waktu
        }
      }
    }

    const endMinutes = Math.round(selectedStartHour * 60) + durationMinutes;

    if (endMinutes > scheduleEndMinutes) {
      toast.error("Waktu selesai melebihi jam operasional");
      return;
    }

    const startTimeString = formatHoursToTimeString(selectedStartHour);
    const arrivalDateTime = new Date(date);
    const [hours, minutes] = startTimeString.split(":").map(Number);
    arrivalDateTime.setHours(hours, minutes, 0, 0);

    const finishDateTime = new Date(arrivalDateTime);
    finishDateTime.setMinutes(
      finishDateTime.getMinutes() + formData.Vehicle.durasiBongkar
    );

    setVisualStartTime(startTimeString);
    setVisualEndTime(
      `${finishDateTime.getHours().toString().padStart(2, "0")}:${finishDateTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );

    onUpdateFormData({
      arrivalTime: new Date(arrivalDateTime),
      estimatedFinishTime: new Date(finishDateTime),
    });
  };

  // Effects
  useEffect(() => {
    if (formData?.dockId && !selectedWeek) {
      if (formData?.arrivalTime && mode === "preview") {
        const arrivalDate = new Date(formData.arrivalTime);
        handleWeekSelect(getStartOfWeek(arrivalDate));
        handleDateSelect(arrivalDate);
        setVisualStartTime(
          `${arrivalDate.getHours().toString().padStart(2, "0")}:${arrivalDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}:00`
        );
        if (formData.estimatedFinishTime) {
          const finishDate = new Date(formData.estimatedFinishTime);
          setVisualEndTime(
            `${finishDate.getHours().toString().padStart(2, "0")}:${finishDate
              .getMinutes()
              .toString()
              .padStart(2, "0")}:00`
          );
        }
      } else {
        handleWeekSelect(getStartOfWeek(new Date()));
      }
    }
  }, [formData?.dockId, formData?.arrivalTime, mode]);

  useEffect(() => {
    if (
      selectedWeek &&
      weekDays.length > 0 &&
      !selectedDate &&
      mode !== "preview"
    ) {
      handleDateSelect(weekDays[0]);
    }
  }, [selectedWeek, weekDays.length, mode]);

  useEffect(() => {
    if (mode == "create") {
      handleDateSelect(new Date());
    }
  }, []);

  // Calendar setup
  const today = new Date();
  const currentWeekStart = getStartOfWeek(today);
  const availableWeeks = Array.from({ length: 12 }, (_, i) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() + i * 7);
    return weekStart;
  });

  // UI Components
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  const WeekSelector = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-base font-medium mb-3">
        {isReadOnly ? "Minggu Booking" : "Pilih Minggu (12 minggu ke depan)"}
      </h3>
      <div className="flex overflow-x-auto gap-2 pb-2 -mx-2 px-2">
        {availableWeeks.map((weekStart, i) => {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          const isSelected =
            selectedWeek &&
            formatDateToString(selectedWeek) === formatDateToString(weekStart);

          return (
            <button
              key={i}
              onClick={() => !isReadOnly && handleWeekSelect(weekStart)}
              disabled={isReadOnly}
              className={`flex-shrink-0 flex flex-col p-3 rounded-lg border transition-all min-w-[120px] ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : isReadOnly
                  ? "border-gray-200 bg-gray-100 opacity-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span className="text-xs opacity-80">
                {i === 0 ? "Minggu Ini" : `Minggu ${i + 1}`}
              </span>
              <span className="text-sm font-bold mt-1">
                {weekStart.getDate()}-{weekEnd.getDate()}{" "}
                {weekStart.toLocaleDateString("id-ID", { month: "short" })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const TimeSlotGrid = () => {
    const hours = Array.from({ length: 13 }, (_, i) => 6 + i); // 6:00 - 18:00
    const startHour = 6;
    const endHour = 18;
    const totalHours = endHour - startHour;

    const getBarPosition = (timeHour: number): number => {
      const clamped = Math.max(startHour, Math.min(endHour, timeHour));
      return ((clamped - startHour) / totalHours) * 100;
    };

    const getApplicableBusyTimes = (date: Date): IDockBusyTime[] => {
      if (!busyTimes) return [];
      const dayEnum = mapDayIndexToEnum(date.getDay());
      return busyTimes.filter((bt: IDockBusyTime) => {
        if (bt.recurring === "DAILY") return true;
        if (bt.recurring === "WEEKLY")
          return bt.recurringCustom?.includes(dayEnum);
        if (bt.recurring === "MONTHLY")
          return date.getDate() === bt.recurringStep;
        return false;
      });
    };

    const getDateBookings = (date: Date): any[] => {
      if (!filteredDockBookings) return [];
      const dateString = formatDateToString(date);
      return filteredDockBookings.filter(
        (b: any) =>
          b?.arrivalTime &&
          formatDateToString(new Date(b.arrivalTime)) === dateString
      );
    };

    if (loadingDock) return <LoadingSpinner />;
    if (!formData?.dockId)
      return (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            Silakan pilih dock terlebih dahulu
          </p>
        </div>
      );
    if (weekDays.length === 0)
      return (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            Silakan pilih minggu terlebih dahulu
          </p>
        </div>
      );

    return (
      <div className="space-y-2">
        {/* Time header */}
        <div className="flex border-b pb-1">
          <div className="w-16 flex-shrink-0"></div>
          <div className="flex-1 relative min-w-0">
            <div className="grid grid-cols-12 gap-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="text-center text-xs text-gray-500 font-medium"
                >
                  {hour}:00
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Days - Compact horizontal layout */}
        <div className="space-y-1 overflow-y-auto pr-1">
          {weekDays.map((date) => {
            const dateString = formatDateToString(date);
            const dayName = getDayNameFromDate(date);
            const dayShort = dayName.slice(0, 3);
            const schedules = availableSchedulesByDay[dateString] || [];
            const isDateSelected =
              selectedDate && formatDateToString(selectedDate) === dateString;
            const applicableBusyTimes = getApplicableBusyTimes(date);
            const dateBookings = getDateBookings(date);

            return (
              <div key={dateString} className="group">
                {/* Day header with schedule info */}
                <div className="flex items-center mb-1">
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded transition-colors flex items-center gap-1 flex-shrink-0 ${
                      isDateSelected
                        ? "bg-primary text-white"
                        : isReadOnly
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="font-semibold">{dayShort}</span>
                    <span>{date.getDate()}</span>
                    <span className="text-[10px] opacity-75">
                      {date.toLocaleDateString("id-ID", { month: "short" })}
                    </span>
                  </div>

                  {/* Schedule times inline */}
                  {schedules.length > 0 && (
                    <div className="ml-2 flex flex-wrap gap-1">
                      {schedules.slice(0, 2).map((schedule, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border"
                        >
                          {schedule.startTime.slice(0, 5)}-
                          {schedule.endTime.slice(0, 5)}
                        </span>
                      ))}
                      {schedules.length > 2 && (
                        <span className="text-xs text-gray-500 px-1">
                          +{schedules.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Time slot track */}
                <div className="flex items-center">
                  <div className="w-16 flex-shrink-0"></div>
                  <div className="flex-1 relative min-w-0 h-10">
                    {/* Background grid */}
                    <div className="absolute inset-0 grid grid-cols-12 gap-0">
                      {hours.map((h) => (
                        <div
                          key={h}
                          className="border-r border-gray-200 h-full"
                        ></div>
                      ))}
                    </div>

                    {/* Render each schedule as a track */}
                    {schedules.length === 0 ? (
                      <div className="absolute inset-0 bg-gray-100 rounded opacity-50"></div>
                    ) : (
                      schedules.map((schedule) => {
                        const startHourNum =
                          parseTimeToHours(schedule.startTime) || startHour;
                        const endHourNum =
                          parseTimeToHours(schedule.endTime) || endHour;
                        const startPercent = getBarPosition(startHourNum);
                        const widthPercent =
                          getBarPosition(endHourNum) - startPercent;

                        // Collect events for this schedule
                        const events: Array<{
                          start: number;
                          end: number;
                          desc: string;
                          type: "busy" | "booking";
                        }> = [
                          ...applicableBusyTimes
                            .filter((bt) => {
                              const btStart = parseTimeToHours(bt.from) || 0;
                              const btEnd = parseTimeToHours(bt.to) || 0;
                              return (
                                btEnd > startHourNum && btStart < endHourNum
                              );
                            })
                            .map((bt) => ({
                              start: parseTimeToHours(bt.from) || 0,
                              end: parseTimeToHours(bt.to) || 0,
                              desc: bt.reason,
                              type: "busy" as const,
                            })),
                          ...dateBookings
                            .filter((b: Booking) => {
                              const bDate = new Date(b.arrivalTime);
                              const fDate = new Date(b.estimatedFinishTime);
                              const bookingStart =
                                bDate.getHours() + bDate.getMinutes() / 60;
                              const bookingEnd =
                                fDate.getHours() + fDate.getMinutes() / 60;
                              return (
                                bookingEnd > startHourNum &&
                                bookingStart < endHourNum
                              );
                            })
                            .map((b: Booking) => ({
                              start:
                                new Date(b.arrivalTime).getHours() +
                                new Date(b.arrivalTime).getMinutes() / 60,
                              end:
                                new Date(b.estimatedFinishTime).getHours() +
                                new Date(b.estimatedFinishTime).getMinutes() /
                                  60,
                              desc: `${b.code}`,
                              type: "booking" as const,
                            })),
                        ];

                        return (
                          <div key={schedule.id} className="absolute inset-0">
                            {/* Available slot - clickable area */}
                            <div
                              onClick={(e) => {
                                if (isReadOnly) return;
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const clickPercent = clickX / rect.width;
                                const clickedTime =
                                  startHourNum +
                                  (endHourNum - startHourNum) * clickPercent;

                                handleClickOnTrack(schedule.day, clickedTime);
                              }}
                              className={`absolute h-full rounded transition-all cursor-pointer ${
                                isReadOnly
                                  ? "bg-gray-300 cursor-not-allowed opacity-50"
                                  : isDateSelected
                                  ? "bg-green-100 hover:bg-green-200 border border-green-300 cursor-pointer"
                                  : "bg-gray-200 cursor-not-allowed opacity-60"
                              }`}
                              style={{
                                left: `${startPercent}%`,
                                width: `${widthPercent}%`,
                              }}
                              title={`${schedule.startTime.slice(
                                0,
                                5
                              )}-${schedule.endTime.slice(
                                0,
                                5
                              )}\nKlik untuk memilih waktu`}
                            >
                              {/* Schedule time label inside bar */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {schedule.startTime.slice(0, 5)}-
                                  {schedule.endTime.slice(0, 5)}
                                </span>
                              </div>
                            </div>

                            {/* Events overlay - versi clean */}
                            {events.map((event, idx) => {
                              const eventStart = Math.max(
                                event.start,
                                startHourNum
                              );
                              const eventEnd = Math.min(event.end, endHourNum);
                              const left = getBarPosition(eventStart);
                              const width = getBarPosition(eventEnd) - left;

                              const formatHour = (hour: number) => {
                                const hours = Math.floor(hour);
                                const minutes = Math.round((hour - hours) * 60);
                                return `${hours}:${minutes
                                  .toString()
                                  .padStart(2, "0")}`;
                              };

                              const isWideEnough = width > 5;
                              const eventTypeColor =
                                event.type === "busy"
                                  ? {
                                      bg: "bg-red-500",
                                      border: "border-red-600",
                                      text: "text-red-50",
                                    }
                                  : {
                                      bg: "bg-amber-500",
                                      border: "border-amber-600",
                                      text: "text-amber-50",
                                    };

                              return (
                                <div
                                  key={idx}
                                  className="absolute h-full group"
                                  style={{
                                    left: `${left}%`,
                                    width: `${Math.max(2, width)}%`,
                                  }}
                                >
                                  {/* Main event bar */}
                                  <div
                                    className={`relative h-full rounded ${eventTypeColor.bg} ${eventTypeColor.border} border shadow-sm overflow-hidden hover:shadow-md transition-shadow`}
                                  >
                                    {/* Pattern overlay */}
                                    {event.type === "booking" && (
                                      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                    )}

                                    {/* Content */}
                                    <div className="relative h-full flex items-center px-1">
                                      {/* Icon indicator */}
                                      <div className="absolute left-1 flex items-center">
                                        {event.type === "busy" ? (
                                          <Clock className="w-2.5 h-2.5 text-white/80" />
                                        ) : (
                                          <Calendar className="w-2.5 h-2.5 text-white/80" />
                                        )}
                                      </div>

                                      {/* Time label */}
                                      {isWideEnough && (
                                        <div
                                          className={`flex-1 text-center ${eventTypeColor.text} text-[9px] font-medium truncate px-4`}
                                        >
                                          {formatHour(eventStart)} -{" "}
                                          {formatHour(eventEnd)}
                                        </div>
                                      )}

                                      {/* Type badge */}
                                      <div className="absolute right-1">
                                        <span
                                          className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                                            event.type === "busy"
                                              ? "bg-red-600"
                                              : "bg-amber-600"
                                          } text-white`}
                                        >
                                          {event.type === "busy" ? "🔒" : "📅"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Hover overlay with full info */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="text-center p-2">
                                        <div className="text-xs font-bold text-white mb-1">
                                          {event.type === "busy"
                                            ? "⏰ Waktu Sibuk"
                                            : "📅 Booking"}
                                        </div>
                                        <div className="text-[10px] text-white/90 font-medium">
                                          {event.desc}
                                        </div>
                                        <div className="text-[9px] text-white/80 mt-1">
                                          {formatHour(eventStart)} -{" "}
                                          {formatHour(eventEnd)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Compact tooltip for small events */}
                                  {!isWideEnough && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      <div className="bg-gray-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                        <div className="font-bold">
                                          {event.type === "busy"
                                            ? "🔒 Sibuk"
                                            : "📅 Booking"}
                                        </div>
                                        <div>
                                          {formatHour(eventStart)}-
                                          {formatHour(eventEnd)}
                                        </div>
                                      </div>
                                      <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 mx-auto"></div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Selected time slot */}
                            {isDateSelected &&
                              visualStartTime &&
                              visualEndTime && (
                                <div
                                  className="absolute h-full rounded-lg border-2 border-blue-500 bg-blue-400/30 shadow-sm z-10"
                                  style={{
                                    left: `${getBarPosition(
                                      parseTimeToHours(visualStartTime) || 0
                                    )}%`,
                                    width: `${Math.max(
                                      2,
                                      getBarPosition(
                                        parseTimeToHours(visualEndTime) || 0
                                      ) -
                                        getBarPosition(
                                          parseTimeToHours(visualStartTime) || 0
                                        )
                                    )}%`,
                                  }}
                                  title={`Waktu terpilih: ${visualStartTime.slice(
                                    0,
                                    5
                                  )}-${visualEndTime.slice(0, 5)}`}
                                >
                                  {/* Time label */}
                                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                    <div className="text-xs font-medium bg-blue-500 text-white px-2 py-0.5 rounded">
                                      {visualStartTime.slice(0, 5)}-
                                      {visualEndTime.slice(0, 5)}
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Events summary below track */}
                {(applicableBusyTimes.length > 0 ||
                  dateBookings.length > 0) && (
                  <div className="mt-1 ml-16">
                    <div className="flex flex-wrap gap-1">
                      {applicableBusyTimes.slice(0, 2).map((bt, idx) => (
                        <div
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-800 rounded border border-red-200 flex items-center gap-1"
                          title={bt.reason}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          <span className="truncate max-w-[80px]">
                            {bt.reason}
                          </span>
                        </div>
                      ))}
                      {dateBookings.map((b: Booking, idx: number) => (
                        <div
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-200 flex items-center gap-1"
                          title={`Booking ${b.id}`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                          <span className="truncate max-w-[80px]">
                            {b.code}{" "}
                          </span>
                        </div>
                      ))}
                      {(applicableBusyTimes.length > 2 ||
                        dateBookings.length > 2) && (
                        <span className="text-[10px] text-gray-500 px-1">
                          +
                          {applicableBusyTimes.length -
                            2 +
                            (dateBookings.length - 2)}{" "}
                          lainnya
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Click instruction */}
        {!isReadOnly && selectedDate && !visualStartTime && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <p className="text-xs text-blue-700">
                <span className="font-medium">Klik pada area hijau</span> untuk
                memilih waktu kunjungan
              </p>
            </div>
          </div>
        )}

        {/* Legend - Compact */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-xs text-gray-600">Tersedia (klik)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Sibuk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-600">Booking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-400/30 border-2 border-blue-500 rounded-lg"></div>
            <span className="text-xs text-gray-600">Pilihan Anda</span>
          </div>
        </div>

        {/* Selected time summary */}
        {selectedDate && visualStartTime && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Waktu Terpilih:
                </p>
                <p className="text-sm text-blue-700">
                  {getDayNameFromDate(selectedDate)}, {selectedDate.getDate()}{" "}
                  {selectedDate.toLocaleDateString("id-ID", { month: "long" })}{" "}
                  {selectedDate.getFullYear()}
                </p>
                <p className="text-sm font-semibold text-blue-800">
                  {visualStartTime.slice(0, 5)} - {visualEndTime!.slice(0, 5)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">Durasi:</p>
                <p className="text-sm font-semibold text-blue-800">
                  {formData.Vehicle?.durasiBongkar || 0} menit
                </p>
              </div>
            </div>
            {!isReadOnly && (
              <p className="text-xs text-blue-600 mt-2">
                Klik area hijau lain untuk mengubah waktu
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col  h-[600px]">
      {/* Dock Selector */}
      {!isReadOnly && availableDocks?.length && mode === "justify" && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label className="block text-sm font-medium mb-2">
            Pilih Dock/Gate
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={formData.dockId || ""}
            onChange={(e) => handleDockChange(e.target.value)}
          >
            <option value="">Pilih dock...</option>
            {availableDocks
              .filter(
                (dock: IDock) =>
                  !formData.Vehicle?.vehicleType ||
                  !dock.allowedTypes ||
                  dock.allowedTypes.includes(formData.Vehicle.vehicleType)
              )
              .map((dock: IDock) => (
                <option key={dock.id} value={dock.id}>
                  {dock.name}
                </option>
              ))}
          </select>
        </div>
      )}
      <WeekSelector />

      {/* Time Slot Section */}
      <div className="bg-white rounded-lg shadow-sm pb-12">
        <h3 className="text-base font-medium mb-3 flex">
          <div className="flex flex-col">
            {isReadOnly ? "Waktu Kunjungan" : "Pilih Waktu Kunjungan"}
            {!isReadOnly && (
              <span className="block text-xs text-gray-600 mt-1">
                Klik area hijau untuk memilih waktu.
              </span>
            )}
          </div>
          <div className="flex flex-col ml-auto border border-dashed p-2">
            Admin Gudang Mungkin Akan Menyesuaikan Ulang Sampai Anda Dilokasi
            (Telah Tiba).
          </div>
        </h3>

        <div className="mb-3">
          <p className="text-sm">
            Durasi Bongkar:{" "}
            <span className="font-medium text-primary">
              {formData?.Vehicle?.durasiBongkar || 0} menit
            </span>
          </p>
        </div>

        <TimeSlotGrid />
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-base font-medium mb-2">Catatan Tambahan</h3>
        <textarea
          value={notes}
          disabled={isReadOnly || mode === "justify"}
          onChange={(e) => {
            const newNotes = e.target.value;
            setNotes(newNotes);
            onUpdateFormData({ notes: newNotes });
          }}
          placeholder="Catatan untuk operator gudang..."
          className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          * Akan dilihat oleh operator gudang
        </p>
      </div>
    </div>
  );
};

export default PreviewSlotDisplay;
