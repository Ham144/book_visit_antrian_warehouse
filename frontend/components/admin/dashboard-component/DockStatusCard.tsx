const DockStatusCard = ({ dock }) => {
  // Konfigurasi status
  const statusConfig = {
    IDLE: {
      color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
      icon: "🟢",
      label: "Idle"
    },
    IN_PROGRESS: {
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      icon: "🟡",
      label: "In Progress"
    }
  };

  // Konfigurasi warna waktu berdasarkan colorStatus
  const timeColorConfig = {
    green: "text-green-600 dark:text-green-400",
    yellow: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400"
  };

  // Format waktu untuk IN_PROGRESS
  const formatRemainingTime = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {dock.dockName}
          </h4>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 ${
              statusConfig[dock.status]?.color || "bg-gray-100 text-gray-800"
            }`}
          >
            {statusConfig[dock.status]?.icon || "⚪"}
            {statusConfig[dock.status]?.label || dock.status.replace("_", " ")}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          ⋮
        </button>
      </div>

      {dock.bookingCode && (
        <div className="mt-4 mb-3 space-y-1.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {dock.bookingCode}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {dock.vendorName}
          </p>
        </div>
      )}

      {dock.remainingMinutes !== undefined && dock.remainingMinutes !== null && (
        <div className={`mt-3 text-sm font-medium ${timeColorConfig[dock.colorStatus] || "text-gray-600"}`}>
          {dock.status === "IN_PROGRESS" ? (
            <>
              {formatRemainingTime(dock.remainingMinutes)}
              {dock.estimatedFinishTime && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Est: {new Date(dock.estimatedFinishTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </>
          ) : dock.remainingMinutes === 0 ? (
            <span className="text-gray-500">Ready</span>
          ) : (
            `${dock.remainingMinutes}m remaining`
          )}
        </div>
      )}

      {dock.isOverdue && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
          ⚠️ Overdue
        </div>
      )}
    </div>
  );
};

export default DockStatusCard;