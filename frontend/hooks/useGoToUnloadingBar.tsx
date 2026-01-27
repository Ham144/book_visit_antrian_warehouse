"use client";

import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { useEffect, useState } from "react";

export const useGoToUnloadingBar = (
  booking: Booking,
  updateInterval: number = 10000,
) => {
  const [remainingTime, setRemainingTime] = useState<string>("");

  useEffect(() => {
    function calculate() {
      if (booking.status != BookingStatus.IN_PROGRESS) {
        return;
      }
      try {
        const now = new Date();

        // Pastikan arrivalTime adalah Date object yang valid
        const arrivalTime = new Date(booking.arrivalTime);
        if (isNaN(arrivalTime.getTime())) {
          setRemainingTime("Time error");
        }

        // Hitung selisih antara arrivalTime dan now
        const diffMs = arrivalTime.getTime() - now.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        // Jika arrivalTime sudah lewat (di masa lalu)
        if (diffMs < 0) {
          const minutesPast = Math.abs(diffMinutes);
          return setRemainingTime(`+${minutesPast} min`); // atau "-{minutes} min" tergantung preferensi
        }

        // Jika masih di masa depan
        if (diffMinutes >= 60) {
          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          return setRemainingTime(`${hours}h ${minutes}m`);
        }

        setRemainingTime(`${diffMinutes} min`);
      } catch (error) {
        setRemainingTime("error");
      }
    }

    calculate();
    const interval = setInterval(calculate, updateInterval);

    return () => clearInterval(interval);
  }, [booking.actualStartTime, booking.status, updateInterval]);
  return { remainingTime };
};
