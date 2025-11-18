"use client";

import KPICards from "@/components/admin/kpi-cards";
import SlotGrid from "@/components/admin/slot-grid";
import { useUserInfo } from "@/components/UserContext";

export default function AdminDashboard() {
  const { userInfo } = useUserInfo();

  console.log(userInfo);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600">{userInfo.homeWarehouse.name}</p>
            </div>
            <KPICards />
            <SlotGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
