// components/DockStatusCard.jsx
import { Clock, Users, Coffee, Power, AlertCircle } from "lucide-react";

const DockStatusSection = ({ dock }) => {
  const getStatusConfig = (status) => {
    const configs = {
      "SIBUK/ISTIRAHAT": {
        color: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
        textColor: "text-amber-700 dark:text-amber-400",
        badgeColor:
          "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
        icon: Coffee,
        iconColor: "text-amber-500",
        label: "Istirahat",
      },
      KOSONG: {
        color: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        textColor: "text-emerald-700 dark:text-emerald-400",
        badgeColor:
          "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
        icon: Users,
        iconColor: "text-emerald-500",
        label: "Tersedia",
      },
      "TIDAK AKTIF": {
        color: "bg-gray-50 dark:bg-gray-800/50",
        borderColor: "border-gray-200 dark:border-gray-700",
        textColor: "text-gray-500 dark:text-gray-400",
        badgeColor:
          "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
        icon: Power,
        iconColor: "text-gray-400",
        label: "Tidak Aktif",
      },
    };
    return configs[status] || configs["TIDAK AKTIF"];
  };

  const config = getStatusConfig(dock.status);
  const StatusIcon = config.icon;

  // Format remaining minutes
  const formatRemainingTime = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0
      ? `${hours} jam ${remainingMins} menit`
      : `${hours} jam`;
  };

  const remainingTime = formatRemainingTime(dock.remainingMinutes);

  return (
    <div
      className={`
      relative group
      ${config.color} 
      border ${config.borderColor}
      rounded-xl overflow-hidden
      transition-all duration-300
      hover:shadow-lg hover:scale-[1.02] hover:border-opacity-50
    `}
    >
      {/* Progress Bar for Busy/Resting Docks */}
      {dock.status === "SIBUK/ISTIRAHAT" && dock.remainingMinutes > 0 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-200 dark:bg-amber-800">
          <div
            className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
            style={{
              width: `${Math.min(100, (dock.remainingMinutes / 60) * 100)}%`,
            }}
          />
        </div>
      )}

      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Icon Container */}
            <div
              className={`
              p-2.5 rounded-lg
              bg-white dark:bg-gray-800
              shadow-sm
              ${config.borderColor} border
            `}
            >
              <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
            </div>

            {/* Dock Name */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                {dock.dockName}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`
            px-2.5 py-1 text-xs font-medium rounded-full
            ${config.badgeColor}
            border ${config.borderColor}
          `}
          >
            {config.label}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Vendor Info (if available) */}
          {dock.vendorName && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {dock.vendorName}
              </span>
            </div>
          )}

          {/* Remaining Time (if available) */}
          {remainingTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sisa Waktu
                </p>
                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {remainingTime}
                </p>
              </div>
            </div>
          )}

          {/* Empty State for Available Docks */}
          {dock.status === "KOSONG" && (
            <div className="flex items-center justify-center py-2">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Siap menerima antrian
              </p>
            </div>
          )}

          {/* Inactive State */}
          {dock.status === "TIDAK AKTIF" && (
            <div className="flex items-center gap-2 py-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dock tidak beroperasi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DockStatusSection;
