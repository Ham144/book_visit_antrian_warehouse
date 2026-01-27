import React from "react";
import { useUserInfo } from "../UserContext";
import { useRouter } from "next/navigation";

const WarehouseSettingPreview = () => {
  const router = useRouter();
  const { userInfo } = useUserInfo();

  if (!userInfo) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center space-x-6 text-sm whitespace-nowrap overflow-x-auto cursor-pointer"
      onClick={() => router.push("/admin/settings")}
    >
      <span className="text-gray-300">|</span>
      <p className="flex items-center">
        <span className="text-gray-600">Jarak Waktu Antar Booking:</span>
        <span className="ml-1 font-medium">
          {userInfo.homeWarehouse.intervalMinimalQueueu}m
        </span>
      </p>
      <span className="text-gray-300">|</span>
      <p className="flex items-center">
        <span className="text-gray-600">
          Penyesuaian Jam efektif Otomatis :
        </span>
        <span
          className={`ml-1 font-medium ${userInfo.homeWarehouse.isAutoEfficientActive ? "text-green-600" : "text-red-500"}`}
        >
          {userInfo.homeWarehouse.isAutoEfficientActive ? "Aktif" : "Non-Aktif"}
        </span>
      </p>
      <span className="text-gray-300">|</span>
      <p className="flex items-center">
        <span className="text-gray-600">Toleransi Keterlambatan:</span>
        <span className="ml-1 font-medium">
          {userInfo.homeWarehouse.delayTolerance}m
        </span>
      </p>
    </div>
  );
};

export default WarehouseSettingPreview;
