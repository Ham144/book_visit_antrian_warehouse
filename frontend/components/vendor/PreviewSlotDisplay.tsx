import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Booking } from "@/types/booking.type";
import { BusyTimeApi } from "@/api/busyTime.api";
import { BookingApi } from "@/api/booking.api";
import { DockApi } from "@/api/dock.api";
import { Vacant } from "@/types/vacant.type";
import { IDockBusyTime } from "@/types/busyTime.type";
import { Days } from "@/types/shared.type";
import { IDock } from "@/types/dock.type";
import decimalToMinutes from "@/lib/decimaltoHHMM";
import hhmmToMinutes from "@/lib/hhmmToMinutes";

interface PreviewSlotDisplayProps {
  formData: Booking;
  onUpdateFormData: (updates: Partial<Booking>) => void;
  mode?: "preview" | "create" | "justify";
  currentBookingId?: string; // For highlighting current booking slot
}

const PreviewSlotDisplay = ({
  formData,
  onUpdateFormData,
  mode = "create",
  currentBookingId,
}: PreviewSlotDisplayProps) => {
  const isReadOnly = mode === "preview";

  // Internal state for visual representation
  const [visualStartTime, setVisualStartTime] = useState<string | null>(null);
  const [visualEndTime, setVisualEndTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [notes, setNotes] = useState(formData?.notes || "");

  // Get available docks for warehouse (for dock selector in create mode)
  const { data: availableDocks } = useQuery({
    queryKey: ["docks", formData?.warehouseId],
    queryFn: async () =>
      await DockApi.getDocksByWarehouseId(formData.warehouseId!),
    enabled: !!formData?.warehouseId && !isReadOnly,
  });

  // Get dock detail which includes vacants and busyTimes
  const { data: dockDetail, isLoading: loadingDock } = useQuery({
    queryKey: ["dock-detail", formData?.dockId],
    queryFn: async () => await DockApi.getDockDetail(formData.dockId!),
    enabled: !!formData?.dockId,
  });

  // Get busy times for the dock
  // Note: dockDetail should include busyTimes, but we also fetch separately as fallback
  // The backend busy-time endpoint has a parameter mismatch (expects dockId but service uses warehouseId)
  // So we primarily use dockDetail's busyTimes
  const { data: busyTimesFromApi } = useQuery({
    queryKey: ["busy-times", formData?.dockId],
    queryFn: async () => {
      try {
        return await BusyTimeApi.getAll(formData?.dockId!);
      } catch (error) {
        // If API fails (due to backend bug), return empty array
        return [];
      }
    },
    enabled:
      !!formData?.dockId &&
      (!dockDetail?.busyTimes || (dockDetail.busyTimes as any[]).length === 0),
  });

  // Use busyTimes from dockDetail if available, otherwise use API result
  const busyTimes: IDockBusyTime[] =
    (dockDetail?.busyTimes as IDockBusyTime[]) || busyTimesFromApi || [];

  // Get all bookings to filter by dockId
  const { data: allBookings } = useQuery({
    queryKey: ["bookings", formData?.warehouseId],
    queryFn: async () =>
      await BookingApi.getAllBookingsList({
        warehouseId: formData.warehouseId,
        page: 1,
      }),
    enabled: !!formData?.warehouseId,
  });

  // Helper function to normalize time format
  const parseTimeToHours = (timeString: string | null): number | null => {
    if (!timeString) return null;
    const match = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      return hours + minutes / 60;
    }
    return null;
  };

  // Helper function to format decimal hours to HH:MM:SS
  const formatHoursToTimeString = (decimalHours: number): string => {
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:00`;
  };

  // Format date to YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Get day name from date (Indonesian)
  const getDayNameFromDate = (date: Date): string => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[date.getDay()];
  };

  // Map JavaScript day index (0=Sunday) to Days enum
  const mapDayIndexToEnum = (dayIndex: number): Days => {
    const mapping: Days[] = [
      Days.MINGGU,
      Days.SENIN,
      Days.SELASA,
      Days.RABU,
      Days.KAMIS,
      Days.JUMAT,
      Days.SABTU,
    ];
    return mapping[dayIndex];
  };

  // Filter bookings for the selected dock
  const dockBookings = useMemo(() => {
    if (!allBookings || !formData.dockId) return [];
    return allBookings.filter(
      (booking: any) =>
        booking.dockId === formData.dockId && booking.status !== "CANCELED"
    );
  }, [allBookings, formData?.dockId]);

  // Get all days in a week starting from Monday
  const getWeekDays = (weekStart: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };
  // Get days in selected week (moved before useMemo that uses it)
  const weekDays = useMemo(() => {
    return selectedWeek ? getWeekDays(selectedWeek) : [];
  }, [selectedWeek]);

  // Calculate available schedules for all days in selected week
  const availableSchedulesByDay = useMemo(() => {
    if (!dockDetail?.vacants || !selectedWeek) return {};

    const schedulesByDay: Record<
      string,
      Array<{
        id: string;
        day: string;
        dayEnum: Days;
        startTime: string;
        endTime: string;
        date: string;
      }>
    > = {};

    weekDays.forEach((date) => {
      const dayEnum = mapDayIndexToEnum(date.getDay());
      const dateString = formatDateToString(date);
      const dayName = getDayNameFromDate(date);

      // Filter vacants by day
      const dayVacants = dockDetail.vacants.filter(
        (vacant: Vacant) => vacant.day === dayEnum
      );

      // Convert vacants to schedule format
      const schedules = dayVacants
        .filter(
          (vacant: Vacant) => vacant.availableFrom && vacant.availableUntil
        )
        .map((vacant: Vacant) => ({
          id: vacant.id || `vacant-${dayEnum}-${dateString}`,
          day: dayName,
          dayEnum: dayEnum,
          startTime: vacant.availableFrom!,
          endTime: vacant.availableUntil!,
          date: dateString,
        }));

      schedulesByDay[dateString] = schedules as any;
    });

    return schedulesByDay;
  }, [dockDetail?.vacants, selectedWeek, weekDays]);

  // Check if a busy time applies to the selected date
  const isBusyTimeApplicable = (
    busyTime: IDockBusyTime,
    date: Date
  ): boolean => {
    if (!busyTime.recurring) return false;

    if (busyTime.recurring === "DAILY") {
      return true; // DAILY applies every day
    }

    if (busyTime.recurring === "WEEKLY") {
      const dayEnum = mapDayIndexToEnum(date.getDay());
      return busyTime.recurringCustom?.includes(dayEnum) || false;
    }

    if (busyTime.recurring === "MONTHLY") {
      return date.getDate() === busyTime.recurringStep;
    }

    return false;
  };

  // Get busy times that apply to a specific date
  const getApplicableBusyTimes = (date: Date): IDockBusyTime[] => {
    if (!busyTimes) return [];
    return busyTimes.filter((bt: IDockBusyTime) =>
      isBusyTimeApplicable(bt, date)
    );
  };

  // Filter bookings to exclude current booking
  const filteredDockBookings = useMemo(() => {
    if (!dockBookings) return [];
    return dockBookings.filter(
      (booking: any) =>
        booking.id !== currentBookingId && booking.status !== "CANCELED"
    );
  }, [dockBookings, currentBookingId]);

  // Get bookings for a specific date
  const getDateBookings = (date: Date): any[] => {
    if (!filteredDockBookings) return [];
    const dateString = formatDateToString(date);
    return filteredDockBookings.filter((booking: any) => {
      if (!booking?.arrivalTime) return false;
      const bookingDate = new Date(booking.arrivalTime);
      return formatDateToString(bookingDate) === dateString;
    });
  };

  // Get current booking for highlighting
  const getCurrentBooking = (date: Date): any | null => {
    if (!currentBookingId || !formData?.arrivalTime) return null;
    const dateString = formatDateToString(date);
    const bookingDate = new Date(formData.arrivalTime);
    if (formatDateToString(bookingDate) === dateString) {
      return {
        id: currentBookingId,
        arrivalTime: formData.arrivalTime,
        estimatedFinishTime: formData.estimatedFinishTime,
      };
    }
    return null;
  };

  // Get start of week (Monday) from a date
  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Handle week selection
  const handleWeekSelect = (weekStart: Date) => {
    setSelectedWeek(weekStart);
    // Clear selected date and time when week changes
    setSelectedDate(null);
    setSelectedDay(null);
    setVisualStartTime(null);
    setVisualEndTime(null);
    onUpdateFormData({ arrivalTime: null, estimatedFinishTime: null });
  };

  // Handle date selection (from week view)
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedDay(getDayNameFromDate(date));

    // Clear visual time when date changes
    setVisualStartTime(null);
    setVisualEndTime(null);
    onUpdateFormData({ arrivalTime: null, estimatedFinishTime: null });
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onUpdateFormData({ notes: newNotes });
  };

  // Calendar setup - next 4 weeks
  const today = new Date();
  const currentWeekStart = getStartOfWeek(today);
  const availableWeeks = Array.from({ length: 12 }, (_, i) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() + i * 7);
    return weekStart;
  });

  // Start at 6:00 and end at 18:00 (typical working hours)
  const startHour = 6;
  const endHour = 18;
  const hoursCount = endHour - startHour;
  const hours = Array.from({ length: hoursCount + 1 }, (_, i) => startHour + i);

  // Calculate specific times for position
  const getBarPosition = (timeHour: number): number => {
    const clampedTimeHour = Math.max(startHour, Math.min(endHour, timeHour));
    return ((clampedTimeHour - startHour) / hoursCount) * 100;
  };

  // Handle dock change
  const handleDockChange = (dockId: string) => {
    onUpdateFormData({ dockId });
    // Reset selected times when dock changes
    setVisualStartTime(null);
    setVisualEndTime(null);
    setSelectedDate(null);
    setSelectedDay(null);
    setSelectedWeek(null);
  };

  // Handle click on time track
  const handleClickOnTrack = (day: string, clickedTimeDecimal: number) => {
    if (isReadOnly) return;

    if (!formData.Vehicle?.durasiBongkar) {
      toast.error("Durasi bongkar kendaraan tidak tersedia");
      return;
    }

    // Check if selected day matches
    if (day !== selectedDay) {
      toast.error(`Silakan pilih tanggal untuk hari ${day}`);
      return;
    }

    const startTimeString = formatHoursToTimeString(clickedTimeDecimal);
    const loadingTimeHours = formData.Vehicle.durasiBongkar / 60;
    const endTimeDecimal = clickedTimeDecimal + loadingTimeHours;

    // Check if end time exceeds working hours
    const dateString = formatDateToString(selectedDate);
    const schedules = availableSchedulesByDay[dateString];
    const endMinutes = decimalToMinutes(endTimeDecimal);
    const scheduleEndMinutes = hhmmToMinutes(schedules[0].endTime);

    if (endMinutes > scheduleEndMinutes) {
      toast.error("Waktu selesai melebihi jam operasional");
      return;
    }

    if (!selectedDate) {
      toast.error("Silakan pilih tanggal terlebih dahulu");
      return;
    }

    if (!formData.Vehicle?.durasiBongkar) {
      toast.error("Durasi bongkar kendaraan tidak tersedia");
      return;
    }

    // Combine date with time
    const arrivalDateTime = new Date(selectedDate);
    const [hours, minutes] = startTimeString.split(":").map(Number);
    arrivalDateTime.setHours(hours, minutes, 0, 0);

    // Calculate estimated finish time based on durasiBongkar
    const finishDateTime = new Date(arrivalDateTime);
    finishDateTime.setMinutes(
      finishDateTime.getMinutes() + formData.Vehicle.durasiBongkar
    );

    // Update visual state
    setVisualStartTime(startTimeString);
    setVisualEndTime(
      `${String(finishDateTime.getHours()).padStart(2, "0")}:${String(
        finishDateTime.getMinutes()
      ).padStart(2, "0")}`
    );

    // Update form data
    onUpdateFormData({
      arrivalTime: arrivalDateTime.toString(),
      estimatedFinishTime: finishDateTime.toString(),
    });
  };

  // Auto-select current week when dock is selected
  useEffect(() => {
    if (formData?.dockId && !selectedWeek) {
      if (formData?.arrivalTime && mode === "preview") {
        // In preview mode, select the week of the booking's arrival time
        const arrivalDate = new Date(formData.arrivalTime);
        const bookingWeekStart = getStartOfWeek(arrivalDate);
        handleWeekSelect(bookingWeekStart);
        handleDateSelect(arrivalDate);
        // Set visual times from booking
        const arrivalTimeStr = `${String(arrivalDate.getHours()).padStart(
          2,
          "0"
        )}:${String(arrivalDate.getMinutes()).padStart(2, "0")}:00`;
        setVisualStartTime(arrivalTimeStr);
        if (formData.estimatedFinishTime) {
          const finishDate = new Date(formData.estimatedFinishTime);
          const finishTimeStr = `${String(finishDate.getHours()).padStart(
            2,
            "0"
          )}:${String(finishDate.getMinutes()).padStart(2, "0")}:00`;
          setVisualEndTime(finishTimeStr);
        }
      } else {
        const today = new Date();
        const currentWeekStart = getStartOfWeek(today);
        handleWeekSelect(currentWeekStart);
      }
    }
  }, [formData?.dockId, formData?.arrivalTime, mode]);

  // Auto-select first day of week when week is selected
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

  return (
    <div className="space-y-6 flex-1">
      {/* Dock Selector (only in create mode) */}
      {!isReadOnly &&
        availableDocks &&
        availableDocks.length &&
        mode == "justify" && (
          <div className="card bg-white shadow">
            <div className="card-body p-4">
              <label className="label">
                <span className="label-text font-medium">Pilih Dock/Gate</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.dockId || ""}
                onChange={(e) => handleDockChange(e.target.value)}
              >
                <option value="">Pilih dock...</option>
                {availableDocks
                  .filter((dock: IDock) => {
                    // Filter docks by vehicle type compatibility
                    if (!formData.Vehicle?.vehicleType || !dock.allowedTypes) {
                      return true;
                    }
                    return dock.allowedTypes.includes(
                      formData.Vehicle.vehicleType
                    );
                  })
                  .map((dock: IDock) => (
                    <option key={dock.id} value={dock.id}>
                      {dock.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

      <div className=" bg-white shadow">
        <div className="flex flex-col p-2">
          <h3 className="text-lg font-medium mb-4">
            {isReadOnly
              ? "Minggu Booking"
              : "Pilih Minggu (bisa book hingga 12 minggu kedepan)"}
          </h3>
          <div className="flex overflow-x-auto gap-2 pb-4">
            {availableWeeks.map((weekStart, index) => {
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              const isSelected =
                selectedWeek &&
                formatDateToString(selectedWeek) ===
                  formatDateToString(weekStart);

              return (
                <button
                  key={index}
                  onClick={() => !isReadOnly && handleWeekSelect(weekStart)}
                  disabled={isReadOnly}
                  className={`flex flex-col items-center justify-center p-4 min-w-[140px] rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : isReadOnly
                      ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xs font-medium opacity-80">
                    {index === 0 ? "Minggu Ini" : `Minggu ${index + 1}`}
                  </span>
                  <span className="text-sm font-bold mt-1">
                    {weekStart.getDate()} - {weekEnd.getDate()}{" "}
                    {weekStart.toLocaleDateString("id-ID", { month: "short" })}
                  </span>
                  <span className="text-xs opacity-80 mt-1">
                    {weekStart.getFullYear()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Slot Visualization */}
      {selectedWeek && (
        <div className="card bg-white shadow">
          <div className="card-body">
            <h3 className="text-lg font-medium mb-4">
              {isReadOnly ? "Waktu Kunjungan" : "Pilih Waktu Kunjungan"}{" "}
              {!isReadOnly && (
                <span className="text-sm text-gray-900">
                  (Catatan: Admin Warehouse bisa saja menggeser waktu anda untuk
                  efesiensi slot)
                </span>
              )}
            </h3>
            <div className="mb-4">
              {!isReadOnly && (
                <p className="text-sm text-gray-600 mb-2">
                  Klik pada area hijau untuk memilih waktu mulai kunjungan,
                  perhatikan tanggal yang anda pilih
                </p>
              )}
              <p className="text-sm font-medium">
                Durasi Bongkar:{" "}
                <span className="text-primary">
                  {formData?.Vehicle?.durasiBongkar || 0} menit
                </span>
              </p>
            </div>

            <div className="w-full">
              {loadingDock ? (
                <div className="flex justify-center items-center py-16">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : !formData?.dockId ? (
                <div className="text-center p-4 bg-base-300 rounded">
                  <p className="text-sm text-gray-600">
                    Silakan pilih dock terlebih dahulu
                  </p>
                </div>
              ) : weekDays.length === 0 ? (
                <div className="text-center p-4 bg-base-300 rounded">
                  <p className="text-sm text-gray-600">
                    Silakan pilih minggu terlebih dahulu
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex mb-2">
                    <div className="w-[14%] min-w-16"></div>
                    <div className="flex-1 grid grid-cols-12 border-b">
                      {hours?.map((hour) => (
                        <div
                          key={hour}
                          className="text-center text-xs font-medium"
                        >
                          {hour}:00
                        </div>
                      ))}
                    </div>
                  </div>

                  {weekDays.map((date, dayIdx) => {
                    const dateString = formatDateToString(date);
                    const dayName = getDayNameFromDate(date);
                    const schedules = availableSchedulesByDay[dateString] || [];
                    const isDateSelected =
                      selectedDate &&
                      formatDateToString(selectedDate) === dateString;

                    // Get busy times and bookings for this date
                    const applicableBusyTimes = getApplicableBusyTimes(date);
                    const dateBookings = getDateBookings(date);
                    const currentBooking = getCurrentBooking(date);

                    return (
                      <div key={dayIdx} className="mb-6">
                        {/* Day Header */}
                        <div className="mb-2">
                          <button
                            onClick={() =>
                              !isReadOnly && handleDateSelect(date)
                            }
                            disabled={isReadOnly}
                            className={`text-sm font-semibold px-3 py-1 rounded transition-all ${
                              isDateSelected
                                ? "bg-primary text-white"
                                : isReadOnly
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {dayName}, {date.getDate()}{" "}
                            {date.toLocaleDateString("id-ID", {
                              month: "short",
                            })}
                          </button>
                        </div>

                        {schedules.length === 0 ? (
                          <div className="text-center p-2 bg-gray-50 rounded text-xs text-gray-500">
                            Tidak ada jadwal tersedia
                          </div>
                        ) : (
                          schedules.map((schedule, idx) => {
                            const scheduleStartHour = parseTimeToHours(
                              schedule.startTime
                            );
                            const scheduleEndHour = parseTimeToHours(
                              schedule.endTime
                            );

                            if (
                              scheduleStartHour === null ||
                              scheduleEndHour === null
                            )
                              return null;

                            const startPercent =
                              getBarPosition(scheduleStartHour);
                            const endPercent = getBarPosition(scheduleEndHour);
                            const widthPercent = endPercent - startPercent;

                            // Prepare busy time events for this schedule
                            const scheduleBusyTimes = applicableBusyTimes
                              .map((bt: IDockBusyTime) => {
                                const btStart = parseTimeToHours(bt.from);
                                const btEnd = parseTimeToHours(bt.to);
                                if (btStart === null || btEnd === null)
                                  return null;

                                // Check if busy time overlaps with schedule
                                if (
                                  btEnd <= scheduleStartHour ||
                                  btStart >= scheduleEndHour
                                ) {
                                  return null;
                                }

                                return {
                                  description: bt.reason,
                                  start: Math.max(btStart, scheduleStartHour),
                                  end: Math.min(btEnd, scheduleEndHour),
                                };
                              })
                              .filter((e) => e !== null) as Array<{
                              description: string;
                              start: number;
                              end: number;
                            }>;

                            // Prepare booking events for this schedule
                            const scheduleBookings = dateBookings
                              .map((booking: any) => {
                                if (
                                  !booking.arrivalTime ||
                                  !booking.estimatedFinishTime
                                )
                                  return null;

                                const bookingDate = new Date(
                                  booking.arrivalTime
                                );
                                const bookingStart =
                                  bookingDate.getHours() +
                                  bookingDate.getMinutes() / 60;
                                const finishDate = new Date(
                                  booking.estimatedFinishTime
                                );
                                const bookingEnd =
                                  finishDate.getHours() +
                                  finishDate.getMinutes() / 60;

                                // Check if booking overlaps with schedule
                                if (
                                  bookingEnd <= scheduleStartHour ||
                                  bookingStart >= scheduleEndHour
                                ) {
                                  return null;
                                }

                                return {
                                  description: `Booking ${
                                    booking.id?.substring(0, 8) || ""
                                  }`,
                                  start: Math.max(
                                    bookingStart,
                                    scheduleStartHour
                                  ),
                                  end: Math.min(bookingEnd, scheduleEndHour),
                                };
                              })
                              .filter((e) => e !== null) as Array<{
                              description: string;
                              start: number;
                              end: number;
                            }>;

                            const allEvents = [
                              ...scheduleBusyTimes,
                              ...scheduleBookings,
                            ];

                            return (
                              <div key={idx} className="flex items-center mb-3">
                                <div className="w-[14%] min-w-16 text-sm font-medium">
                                  {schedule.startTime.substring(0, 5)} -{" "}
                                  {schedule.endTime.substring(0, 5)}
                                </div>
                                <div className="flex-1 relative h-10">
                                  {/* Background grid */}
                                  <div className="absolute inset-0 grid grid-cols-12 z-0">
                                    {hours.map((hour) => (
                                      <div
                                        key={hour}
                                        className="border-r border-gray-200 h-full"
                                      ></div>
                                    ))}
                                  </div>

                                  {/* Available slot bar (clickable area) */}
                                  <div
                                    onClick={(e) => {
                                      if (isReadOnly) return;
                                      // Only allow clicking if this date is selected
                                      const bar = e.currentTarget;
                                      const rect = bar.getBoundingClientRect();
                                      const clickX = e.clientX - rect.left;
                                      const clickPercent = Math.max(
                                        0,
                                        Math.min(1, clickX / rect.width)
                                      );
                                      const scheduleDuration =
                                        scheduleEndHour - scheduleStartHour;
                                      const clickedTimeDecimal =
                                        scheduleStartHour +
                                        clickPercent * scheduleDuration;

                                      // cek apakah ada event ditengah
                                      for (const event of allEvents) {
                                        const bookingDuration =
                                          (formData.Vehicle?.durasiBongkar ||
                                            0) / 60;
                                        if (
                                          clickedTimeDecimal < event.end &&
                                          clickedTimeDecimal + bookingDuration >
                                            event.start
                                        ) {
                                          toast.error(
                                            `Waktu yang dipilih bertabrakan dengan: ${event.description}`
                                          );
                                          return;
                                        }
                                      }

                                      handleClickOnTrack(
                                        schedule.day,
                                        clickedTimeDecimal
                                      );
                                    }}
                                    className={`absolute h-full rounded opacity-70 z-10 transition-opacity ${
                                      isReadOnly
                                        ? "bg-gray-300 cursor-not-allowed opacity-50"
                                        : isDateSelected
                                        ? "bg-success cursor-pointer hover:opacity-90"
                                        : "bg-gray-300 cursor-not-allowed opacity-50"
                                    }`}
                                    style={{
                                      left: `${startPercent}%`,
                                      width: `${widthPercent}%`,
                                    }}
                                  >
                                    <div className="text-xs text-white font-medium p-1 pointer-events-none">
                                      {schedule.startTime.substring(0, 5)} -{" "}
                                      {schedule.endTime.substring(0, 5)}
                                    </div>
                                  </div>

                                  {/* Busy times and bookings */}
                                  {allEvents.map((event, eventIdx) => {
                                    const eventStartPercent = getBarPosition(
                                      event.start
                                    );
                                    const eventEndPercent = getBarPosition(
                                      event.end
                                    );
                                    const eventWidthPercent =
                                      eventEndPercent - eventStartPercent;

                                    return (
                                      <div
                                        key={eventIdx}
                                        className="absolute h-full bg-error rounded z-20 pointer-events-none"
                                        style={{
                                          left: `${eventStartPercent}%`,
                                          width: `${Math.max(
                                            2,
                                            eventWidthPercent
                                          )}%`,
                                        }}
                                      >
                                        <div className="text-xs text-white font-medium p-1 truncate">
                                          {event.description}
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Selected time slot - only show if this date is selected */}
                                  {isDateSelected &&
                                    visualStartTime &&
                                    visualEndTime && (
                                      <div
                                        className="absolute h-full bg-primary rounded z-30 pointer-events-none"
                                        style={{
                                          left: `${getBarPosition(
                                            parseTimeToHours(visualStartTime) ||
                                              0
                                          )}%`,
                                          width: `${Math.max(
                                            2,
                                            getBarPosition(
                                              parseTimeToHours(visualEndTime) ||
                                                0
                                            ) -
                                              getBarPosition(
                                                parseTimeToHours(
                                                  visualStartTime
                                                ) || 0
                                              )
                                          )}%`,
                                        }}
                                      >
                                        <div className="text-xs text-white font-medium p-1 truncate">
                                          {visualStartTime.substring(0, 5)} -{" "}
                                          {visualEndTime.substring(0, 5)}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-success rounded mr-2"></div>
                  <span className="text-sm">Slot Tersedia</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-error rounded mr-2"></div>
                  <span className="text-sm">Waktu Sibuk / Booking</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-primary rounded mr-2"></div>
                  <span className="text-sm">Pilihan Anda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="card bg-white shadow">
        <div className="card-body">
          <h3 className="text-lg font-medium mb-4">Catatan Tambahan</h3>
          <textarea
            value={notes}
            disabled={mode == "preview" || mode == "justify"}
            onChange={handleNotesChange}
            placeholder="Tambahkan catatan atau instruksi khusus untuk kunjungan Anda..."
            className="textarea textarea-bordered border px-2 w-full h-32"
          />
          <p className="text-sm text-gray-500 mt-2">
            * Catatan ini akan dilihat oleh operator gudang
          </p>
        </div>
      </div>

      {/* Selected Time Summary */}
      {(formData?.arrivalTime || notes) && (
        <div className="card bg-primary text-primary-content shadow">
          <div className="card-body">
            <h3 className="text-lg font-medium mb-2">Ringkasan Booking</h3>
            {formData.arrivalTime && (
              <div className="mb-2">
                <p className="font-medium">Waktu Kunjungan:</p>
                <p>{new Date(formData.arrivalTime).toLocaleString("id-ID")}</p>
                {formData.estimatedFinishTime && (
                  <p className="text-sm opacity-90">
                    Estimasi Selesai:{" "}
                    {new Date(formData.estimatedFinishTime).toLocaleTimeString(
                      "id-ID"
                    )}
                  </p>
                )}
              </div>
            )}
            {notes && (
              <div>
                <p className="font-medium">Catatan:</p>
                <p className="text-sm">{notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewSlotDisplay;
