"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subDays, addDays } from "date-fns";

interface DateRangePickerProps {
  value: {
    startDate: Date;
    endDate: Date;
  };
  onChange: (range: { startDate: Date; endDate: Date }) => void;
  className?: string;
}

export default function DateRangePicker({
  value,
  onChange,
  className = "",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const quickRanges = [
    { label: "Today", days: 0 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];

  const handleQuickSelect = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    onChange({ startDate, endDate });
    setIsOpen(false);
  };

  const handleDateChange = (type: "start" | "end", date: Date) => {
    const newRange = { ...value };
    if (type === "start") {
      newRange.startDate = date;
      if (date > newRange.endDate) {
        newRange.endDate = addDays(date, 1);
      }
    } else {
      newRange.endDate = date;
      if (date < newRange.startDate) {
        newRange.startDate = subDays(date, 1);
      }
    }
    onChange(newRange);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        <Calendar size={18} className="text-gray-500" />
        <span className="text-gray-700">
          {format(value.startDate, "MMM dd, yyyy")} -{" "}
          {format(value.endDate, "MMM dd, yyyy")}
        </span>
        <ChevronRight size={18} className="text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[320px]">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Select</h3>
              <div className="flex flex-wrap gap-2">
                {quickRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handleQuickSelect(range.days)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={format(value.startDate, "yyyy-MM-dd")}
                  onChange={(e) =>
                    handleDateChange("start", new Date(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={format(value.endDate, "yyyy-MM-dd")}
                  onChange={(e) =>
                    handleDateChange("end", new Date(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {Math.ceil(
                  (value.endDate.getTime() - value.startDate.getTime()) /
                    (1000 * 3600 * 24)
                )}{" "}
                days selected
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
