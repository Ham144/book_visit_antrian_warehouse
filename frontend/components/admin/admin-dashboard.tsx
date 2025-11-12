"use client";

import { useState } from "react";
import KPICards from "@/components/admin/kpi-cards";
import SlotGrid from "@/components/admin/slot-grid";
import SideNav from "@/components/shared-common/side-nav";
import SlotManagement from "@/components/admin/slot-management";
import BusyTimeManagement from "@/components/admin/busy-time-management";
import LiveQueueBoard from "@/components/admin/live-queue-board";
import Reports from "@/components/admin/reports";
import VehicleManagement from "@/components/admin/vehicle-management";

type AdminPage =
  | "dashboard"
  | "docks"
  | "busy-times"
  | "queue"
  | "reports"
  | "vehicles";

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SideNav
          role="admin"
          currentPage={currentPage}
          onPageChange={setCurrentPage as any}
        />
        <main className="flex-1 p-6">
          {currentPage === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-gray-600">Warehouse Jakarta Barat</p>
              </div>
              <KPICards />
              <SlotGrid />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
