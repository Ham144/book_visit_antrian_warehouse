import { FormatTimeIndonesian } from "@/lib/constant";

const AlertItem = ({ alert }) => {
  const severityColors = {
    HIGH: "border-l-red-500 bg-red-50",
    MEDIUM: "border-l-amber-500 bg-amber-50",
    LOW: "border-l-blue-500 bg-blue-50",
  };

  return (
    <div className={`p-3 border-l-4 ${severityColors[alert.severity]} mb-2`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{alert.type.replace("_", " ")}</span>
            <span className="text-xs text-gray-500">
              {FormatTimeIndonesian(alert.timestamp)}
            </span>
          </div>
          <p className="text-sm mt-1">{alert.message}</p>
          {alert.bookingCode && (
            <span className="text-xs font-medium">{alert.bookingCode}</span>
          )}
        </div>
        <button className="text-sm px-3 py-1 bg-white border rounded hover:bg-gray-50">
          {alert.type === "OVERDUE" ? "Force Complete" : "Acknowledge"}
        </button>
      </div>
    </div>
  );
};

export default AlertItem;
