import { FormatTimeIndonesian } from "@/lib/constant";
import { Booking } from "@/types/booking.type";

const QueueTableRow = ({ booking }: { booking: Booking }) => {
  const now = new Date();

  const isOverdue = booking.estimatedFinishTime
    ? now.getTime() > booking.estimatedFinishTime.getTime()
    : false;
  return (
    <tr
      className={`border-b hover:bg-gray-50 ${
        booking.code ? "bg-amber-50" : ""
      }`}
    >
      <td className="py-2 px-3">
        <span>{booking.Dock?.name}</span>
      </td>
      <td className="py-2 px-3 font-medium">{booking.code}</td>
      <td className="py-2 px-3">{booking.driver?.vendorName}</td>
      <td className="py-2 px-3">
        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
          {FormatTimeIndonesian(booking.arrivalTime)}
        </span>
      </td>
      <td className="py-2 px-3">
        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
          {FormatTimeIndonesian(new Date(booking.Vehicle?.durasiBongkar))}
        </span>
      </td>
    </tr>
  );
};

export default QueueTableRow;
