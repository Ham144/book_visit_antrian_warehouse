import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";

function isDelayed(booking: Booking, now: number, delayTolerance: number) {
  if (booking.status !== BookingStatus.IN_PROGRESS) return false;
  const arrival = new Date(booking.arrivalTime).getTime();
  return (now - arrival > delayTolerance) && !booking.actualArrivalTime && !booking.actualStartTime;
}

export default isDelayed;
