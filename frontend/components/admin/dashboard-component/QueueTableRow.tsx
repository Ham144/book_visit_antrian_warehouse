import { FormatTimeIndonesian } from "@/lib/constant";
import { Booking } from "@/types/booking.type";

const QueueTableRow = ({ booking }: { booking: Booking }) => {
  const now = new Date();

  // Normalisasi tipe tanggal (bisa datang sebagai string dari API)
  const arrivalTime = booking.arrivalTime
    ? new Date(booking.arrivalTime)
    : null;

  const estimatedFinishTime = booking.estimatedFinishTime
    ? new Date(booking.estimatedFinishTime)
    : null;

  const isOverdue = estimatedFinishTime
    ? now.getTime() > estimatedFinishTime.getTime()
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
      <td className="py-2 px-3 font-medium">{booking.code}</td>
      <td className="py-2 px-3">{booking.driver?.vendorName}</td>
      <td className="py-2 px-3">
        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
          {arrivalTime ? FormatTimeIndonesian(arrivalTime) : "-"}
        </span>
      </td>
      <td className="py-2 px-3">
        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
          {booking.Vehicle?.durasiBongkar !== undefined
            ? `${booking.Vehicle?.durasiBongkar} m`
            : "-"}
        </span>
      </td>
    </tr>
  );
};

export default QueueTableRow;
