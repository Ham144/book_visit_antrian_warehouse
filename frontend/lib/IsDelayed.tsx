import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";

function isDelayed(booking: Booking, now: Date, delayTolerance: number) {
  if (booking.status !== BookingStatus.IN_PROGRESS) return false;
  const arrival = new Date(booking.arrivalTime).getTime();
  return (
    now.getTime() - arrival > delayTolerance * 60000 &&
    !booking.actualArrivalTime &&
    !booking.actualStartTime
  );
}

export default isDelayed;
