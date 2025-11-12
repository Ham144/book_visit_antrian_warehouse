"use client";

import KPICards from "@/components/admin/kpi-cards";
import SlotGrid from "@/components/admin/slot-grid";
import SideNav from "@/components/shared-common/side-nav";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SideNav role="admin" currentPage="dashboard" />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Warehouse Jakarta Barat</p>
            </div>
            <KPICards />
            <SlotGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
