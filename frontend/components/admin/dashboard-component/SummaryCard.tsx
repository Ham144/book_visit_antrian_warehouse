import { MessageCircleQuestion } from "lucide-react";

const SummaryCard = ({ metric, value, status, tooltip }) => {
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
          <div className="flex items-center justify-between gap-x-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">{metric}</p>
          {tooltip && (
  <div className="relative group">
    <MessageCircleQuestion
      size={14}
      className="text-gray-400 cursor-pointer"
    />

    <div className="
      absolute bottom-full left-1/2 -translate-x-1/2 mb-2
      hidden group-hover:block
      bg-gray-800 text-white text-xs rounded px-3 py-2
      flex-wrap w-96  z-50
    ">
      {tooltip}
    </div>
  </div>
)}


          </div>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-gray-400">{/* Icon based on metric */}</div>
      </div>
    </div>
  );
};

export default SummaryCard;
