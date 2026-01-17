const DockStatusCard = ({ dock }) => {
  const statusConfig = {
    IN_PROGRESS: { color: "bg-blue-100 text-blue-800", icon: "🔄" },
    IDLE: { color: "bg-green-100 text-green-800", icon: "✅" },
    BLOCKED: { color: "bg-red-100 text-red-800", icon: "🚫" },
    COMPLETED: { color: "bg-gray-100 text-gray-800", icon: "✓" },
  };

  const timeConfig = {
    green: "text-green-600",
    yellow: "text-amber-600",
    red: "text-red-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{dock.dockName}</h4>
          <span
            className={`text-xs px-2 py-1 rounded ${
              statusConfig[dock.status].color
            }`}
          >
            {statusConfig[dock.status].icon} {dock.status.replace("_", " ")}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">⋮</button>
      </div>

      {dock.bookingCode && (
        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium">{dock.bookingCode}</p>
          <p className="text-xs text-gray-500">{dock.vendorName}</p>
        </div>
      )}

      {dock.remainingMinutes !== undefined && (
        <div className={`mt-3 font-medium ${timeConfig[dock.colorStatus]}`}>
          {dock.remainingMinutes > 0
            ? `${dock.remainingMinutes}m remaining`
            : `${Math.abs(dock.remainingMinutes)}m overdue`}
        </div>
      )}
    </div>
  );
};

export default DockStatusCard;
