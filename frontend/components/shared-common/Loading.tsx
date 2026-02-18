import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full space-y-4">
      {/* Container untuk Animasi Icon Warehouse/Logistik */}
      <div className="relative">
        {/* Spinner Utama */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600"></div>

        {/* Icon Tengah (Opsional: Bisa diganti Lucide Icon Box/Building) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-teal-600 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
      </div>

      {/* Teks Loading */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Sinkronisasi Data Warehouse
        </h3>
        <div className="flex items-center space-x-1 mt-1 justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Memuat antrean
          </p>
          <span className="flex space-x-1">
            <span className="h-1 w-1 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-1 w-1 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-1 w-1 bg-teal-500 rounded-full animate-bounce"></span>
          </span>
        </div>
      </div>

      {/* Indikator Progress Halus */}
      <div className="w-48 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-teal-500 animate-[loading_2s_ease-in-out_infinite] w-full origin-left"></div>
      </div>
    </div>
  );
};

export default Loading;
