import { FormatTimeIndonesian } from "@/lib/constant";

const QueueTableRow = ({ booking }) => {

  return (
    <tr
      className={`border-b hover:bg-gray-50 ${
        booking.isOverdue ? "bg-amber-50" : ""
      }`}
    >
      <td className="py-2 px-3">
        <span
        >
          {booking.dock.name}
        </span>
      </td>
      <td className="py-2 px-3 font-medium">{booking.code}</td>
      <td className="py-2 px-3">{booking.vendorName}</td>
      <td className="py-2 px-3">
        <span className={booking.isOverdue ? "text-red-600 font-medium" : ""}>
          {FormatTimeIndonesian(booking.arrivalTime)}
        </span>
      </td>
      <td className="py-2 px-3">
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            Assign Dock
          </button>
          <button className="text-amber-600 hover:text-amber-800 text-sm">
            Mark Issue
          </button>
        </div>
      </td>
    </tr>
  );
};

export default QueueTableRow;
