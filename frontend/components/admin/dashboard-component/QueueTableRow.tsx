import { FormatTimeIndonesian } from "@/lib/constant";

const QueueTableRow = ({ booking }) => {
  const priorityColors = {
    HIGH: "bg-red-50 text-red-700 border-red-200",
    NORMAL: "bg-blue-50 text-blue-700 border-blue-200",
    LOW: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <tr
      className={`border-b hover:bg-gray-50 ${
        booking.isOverdue ? "bg-amber-50" : ""
      }`}
    >
      <td className="py-2 px-3">
        <span
          className={`text-xs px-2 py-1 rounded border ${
            priorityColors[booking.priority]
          }`}
        >
          {booking.priority}
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
