const SummaryCard = ({ metric, value, status, trend }) => {
  const statusColors = {
    normal: "border-l-blue-500",
    warning: "border-l-amber-500",
    critical: "border-l-red-500",
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 ${statusColors[status]} shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{metric}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-gray-400">{/* Icon based on metric */}</div>
      </div>
      {trend && (
        <div
          className={`text-xs mt-2 ${
            trend > 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
