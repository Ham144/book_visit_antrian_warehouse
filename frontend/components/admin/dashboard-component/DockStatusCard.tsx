
import { CheckCircle2, Clock, AlertCircle, Coffee, Moon } from 'lucide-react';

const DockStatusCard = ({ dock }) => {
  // Helper untuk mendapatkan styling berdasarkan status
  const getStatusStyle = (status) => {
    switch (status) {
      case "KOSONG":
        return {
          bg: "bg-teal-50 dark:bg-teal-900/20",
          text: "text-teal-700 dark:text-teal-300",
          border: "border-teal-200 dark:border-teal-800",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />
        };
      case "SEDANG MEMBONGKAR":
        return {
          bg: "bg-amber-50 dark:bg-amber-900/20",
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800",
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case "TIDAK AKTIF":
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-600 dark:text-gray-400",
          border: "border-gray-300 dark:border-gray-700",
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
      case "SIBUK/ISTIRAHAT":
        return {
          bg: "bg-purple-50 dark:bg-purple-900/20",
          text: "text-purple-700 dark:text-purple-300",
          border: "border-purple-200 dark:border-purple-800",
          icon: <Coffee className="w-3.5 h-3.5" />
        };
      case "DILUAR JAM KERJA":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          text: "text-blue-700 dark:text-blue-300",
          border: "border-blue-200 dark:border-blue-800",
          icon: <Moon className="w-3.5 h-3.5" />
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800",
          text: "text-gray-600 dark:text-gray-400",
          border: "border-gray-200 dark:border-gray-700",
          icon: null
        };
    }
  };

  // Format waktu Indonesia
  const formatTimeIndonesian = (minutes) => {
    if (minutes >= 60) {
      const jam = Math.floor(minutes / 60);
      const menit = minutes % 60;
      return `${jam} jam ${menit > 0 ? `${menit} menit` : ''}`.trim();
    }
    return `${minutes} menit`;
  };

  // Render waktu tersisa
  const renderRemainingTime = () => {
    if (dock.remainingMinutes === undefined || dock.remainingMinutes === null) return null;

    if (dock.status === "KOSONG" && dock.remainingMinutes === 0) {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Siap digunakan</span>
        </div>
      );
    }

    if (dock.status === "SEDANG MEMBONGKAR") {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {formatTimeIndonesian(dock.remainingMinutes)} tersisa
            </span>
          </div>
          {dock.estimatedFinishTime && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Estimasi selesai: {new Date(dock.estimatedFinishTime).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </div>
          )}
        </div>
      );
    }

    if (dock.remainingMinutes > 0) {
      return (
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          <span className="font-medium">{dock.remainingMinutes}m</span> menunggu
        </div>
      );
    }

    return null;
  };

  const statusStyle = getStatusStyle(dock.status);

  return (
    <div className={`
      relative p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200
      ${statusStyle.bg} ${statusStyle.border}
      hover:translate-y-[-2px] hover:border-opacity-70
    `}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2">
            {dock.dockName}
          </h3>
          
          <div className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
            ${statusStyle.border} ${statusStyle.text}
          `}>
            {statusStyle.icon}
            <span className="text-xs font-semibold tracking-wide uppercase">
              {dock.status}
            </span>
          </div>
        </div>
        
        <button className={`
          p-1.5 rounded-lg transition-colors
          hover:bg-white/50 dark:hover:bg-gray-800/50
          text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
        `}>
          <span className="text-lg">⋮</span>
        </button>
      </div>

      {/* Konten - Vendor & Booking Code */}
      {(dock.vendorName || dock.bookingCode) && (
        <div className="mb-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
          {dock.bookingCode && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {dock.bookingCode}
              </span>
            </div>
          )}
          {dock.vendorName && dock.vendorName.trim() && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {dock.vendorName}
            </p>
          )}
        </div>
      )}

      {/* Waktu Tersisa */}
      <div className="mt-4">
        {renderRemainingTime()}
      </div>

      {/* Overdue Indicator */}
      {dock.isOverdue && (
        <div className={`
          absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold
          bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300
          animate-pulse
        `}>
          ⚠️ OVERDUE
        </div>
      )}

      {/* Progress Bar untuk SEDANG MEMBONGKAR */}
      {dock.status === "SEDANG MEMBONGKAR" && dock.remainingMinutes && (
        <div className="mt-3">
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (dock.remainingMinutes / 180) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DockStatusCard;