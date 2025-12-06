import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Booking } from "@/types/booking.type";
import { BusyTimeApi } from "@/api/busyTime.api";
import { BookingApi } from "@/api/booking.api";
import { Calendar } from "lucide-react";
interface PreviewSlotDisplayProps {
  formData: Booking;
  onUpdateFormData: (updates: Partial<Booking>) => void;
}

const PreviewSlotDisplay = ({
  formData,
  onUpdateFormData,
}: PreviewSlotDisplayProps) => {
  // Internal state for visual representation
  const [visualStartTime, setVisualStartTime] = useState<string | null>(null);
  const [visualEndTime, setVisualEndTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [notes, setNotes] = useState(formData.notes || "");

  const { data: busyTimes } = useQuery({
    queryKey: ["busy-times", formData.warehouseId],
    queryFn: async () => await BusyTimeApi.getAll(formData.warehouseId),
    enabled: !!formData.warehouseId,
  });

  const { data: booked } = useQuery({
    queryKey: ["booked", formData.warehouseId],
    queryFn: async () =>
      await BookingApi.getAllBookings({
        warehouseId: formData.warehouseId,
      }),
    enabled: !!formData.warehouseId,
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

  // Get day name from date
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

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedDay(getDayNameFromDate(date));

    // Clear visual time when date changes
    setVisualStartTime(null);
    setVisualEndTime(null);
    onUpdateFormData({ arrivalTime: null, estimatedFinishTime: null });
  };

  // Handle time slot selection
  const handlePickTime = (startTime: string, endTime: string) => {
    if (!selectedDate) {
      toast.error("Silakan pilih tanggal terlebih dahulu");
      return;
    }

    // Combine date with time
    const arrivalDateTime = new Date(selectedDate);
    const [hours, minutes] = startTime.split(":").map(Number);
    arrivalDateTime.setHours(hours, minutes, 0, 0);

    const finishDateTime = new Date(selectedDate);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    finishDateTime.setHours(endHours, endMinutes, 0, 0);

    // Update visual state
    setVisualStartTime(startTime);
    setVisualEndTime(endTime);

    // Update form data
    onUpdateFormData({
      arrivalTime: arrivalDateTime,
      estimatedFinishTime: finishDateTime,
    });

    toast.success("Waktu berhasil dipilih!");
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onUpdateFormData({ notes: newNotes });
  };

  // Calendar setup - next 7 days
  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
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

  // Handle click on time track
  const handleClickOnTrack = (day: string, clickedTimeDecimal: number) => {
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
    if (endTimeDecimal > endHour) {
      toast.error("Waktu selesai melebihi jam operasional");
      return;
    }

    const endTimeString = formatHoursToTimeString(endTimeDecimal);
    handlePickTime(startTimeString, endTimeString);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold flex items-center mb-2">
          <Calendar className="w-6 h-6 mr-2 text-primary" />
          Pilih Tanggal & Waktu
        </h2>
        <p className="text-gray-600">
          Pilih tanggal kunjungan dan waktu slot yang tersedia
        </p>
      </div>

      {/* Date Selection */}
      <div className="card bg-white shadow">
        <div className="card-body">
          <h3 className="text-lg font-medium mb-4">Pilih Tanggal</h3>
          <div className="flex overflow-x-auto gap-2 pb-4">
            {next7Days.map((date, index) => {
              const dayName = getDayNameFromDate(date);
              const dateString = formatDateToString(date);
              const isSelected =
                selectedDate && formatDateToString(selectedDate) === dateString;

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`flex flex-col items-center justify-center p-4 min-w-[100px] rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm font-medium">{dayName}</span>
                  <span className="text-2xl font-bold mt-1">
                    {date.getDate()}
                  </span>
                  <span className="text-xs opacity-80 mt-1">
                    {date.toLocaleDateString("id-ID", { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Slot Visualization */}
      {selectedDate && (
        <div className="card bg-white shadow">
          <div className="card-body">
            <h3 className="text-lg font-medium mb-4">Pilih Waktu Kunjungan</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Klik pada area hijau untuk memilih waktu mulai kunjungan
              </p>
              <p className="text-sm font-medium">
                Durasi Bongkar:{" "}
                <span className="text-primary">
                  {formData.Vehicle?.durasiBongkar || 0} menit
                </span>
              </p>
            </div>

            <div className="w-full">
              <div className="flex mb-2">
                <div className="w-[14%] min-w-16"></div>
                <div className="flex-1 grid grid-cols-12 border-b">
                  {hours.map((hour) => (
                    <div key={hour} className="text-center text-xs font-medium">
                      {hour}:00
                    </div>
                  ))}
                </div>
              </div>

              {booked?.length === 0 ? (
                <div className="text-center p-4 bg-base-300 rounded">
                  <p className="text-sm text-gray-600">
                    Tidak ada jadwal tersedia
                  </p>
                </div>
              ) : (
                booked?.map((schedule, idx) => {
                  const scheduleStartHour = parseTimeToHours(
                    schedule.startTime
                  );
                  const scheduleEndHour = parseTimeToHours(schedule.endTime);

                  if (scheduleStartHour === null || scheduleEndHour === null)
                    return null;

                  const startPercent = getBarPosition(scheduleStartHour);
                  const endPercent = getBarPosition(scheduleEndHour);
                  const widthPercent = endPercent - startPercent;

                  const isDaySelected = selectedDay === schedule.day;

                  // Find busy times for this schedule
                  const events = [];
                  if (busyTimes && Array.isArray(busyTimes)) {
                    events.push(
                      ...busyTimes.filter(
                        (event) =>
                          event.day === schedule.day ||
                          event.scheduleId === schedule.id
                      )
                    );
                  }

                  // Prepare event times
                  const scheduleEventsDecimalTimes = events
                    .map((event) => ({
                      description: event.description || event.title || "Event",
                      start: parseTimeToHours(event.startTime),
                      end: parseTimeToHours(event.endTime),
                    }))
                    .filter((e) => e.start !== null && e.end !== null);

                  return (
                    <div
                      key={idx}
                      className={`flex items-center mb-3 ${
                        schedule.day !== selectedDay ? "opacity-50" : ""
                      }`}
                    >
                      <div className="w-[14%] min-w-16 text-sm font-medium">
                        {schedule.day}
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
                        {schedule.day === selectedDay && (
                          <div
                            onClick={(e) => {
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

                              // Check for overlap with events
                              for (const event of scheduleEventsDecimalTimes) {
                                if (
                                  clickedTimeDecimal < event.end &&
                                  clickedTimeDecimal +
                                    (formData.Vehicle?.durasiBongkar || 0) /
                                      60 >
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
                            className={`absolute h-full bg-success rounded opacity-70 z-10 cursor-pointer hover:opacity-90 transition-opacity ${
                              schedule.day === selectedDay
                                ? ""
                                : "pointer-events-none"
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
                        )}

                        {/* Busy events */}
                        {scheduleEventsDecimalTimes.map((event, eventIdx) => {
                          const eventStartPercent = getBarPosition(
                            event.start || 0
                          );
                          const eventEndPercent = getBarPosition(
                            event.end || 0
                          );
                          const eventWidthPercent =
                            eventEndPercent - eventStartPercent;

                          return (
                            <div
                              key={eventIdx}
                              className="absolute h-full bg-error rounded z-20 pointer-events-none"
                              style={{
                                left: `${eventStartPercent}%`,
                                width: `${Math.max(2, eventWidthPercent)}%`,
                              }}
                            >
                              <div className="text-xs text-white font-medium p-1 truncate">
                                {event.description}
                              </div>
                            </div>
                          );
                        })}

                        {/* Selected time slot */}
                        {isDaySelected && visualStartTime && visualEndTime && (
                          <div
                            className="absolute h-full bg-primary rounded z-30 pointer-events-none"
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

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-success rounded mr-2"></div>
                  <span className="text-sm">Slot Tersedia</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-error rounded mr-2"></div>
                  <span className="text-sm">Waktu Sibuk</span>
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
            onChange={handleNotesChange}
            placeholder="Tambahkan catatan atau instruksi khusus untuk kunjungan Anda..."
            className="textarea textarea-bordered w-full h-32"
          />
          <p className="text-sm text-gray-500 mt-2">
            * Catatan ini akan dilihat oleh operator gudang
          </p>
        </div>
      </div>

      {/* Selected Time Summary */}
      {(formData.arrivalTime || notes) && (
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
