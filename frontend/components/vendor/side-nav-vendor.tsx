"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Users,
  BarChart3,
  Truck,
  Rocket,
} from "lucide-react";

const vendorMenutItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/vendor/dashboard",
  },
  {
    id: "booking",
    label: "Plan Visit",
    icon: Rocket,
    href: "/vendor/booking",
  },
  {
    id: "history",
    label: "History Booking",
    icon: Clock,
    href: "/vendor/history",
  },
  {
    id: "warehouse",
    label: "Warehouse",
    icon: Users,
    href: "/vendor/warehouse",
  },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/vendor/reports" },
  { id: "vehicles", label: "Vehicles", icon: Truck, href: "/vendor/vehicles" },
];

export default function SideNavVendor() {
  const pathname = usePathname();

  return (
    <aside className=" bg-white border-r border-gray-200 shadow-sm min-h-screen ">
      <nav className="space-y-2 w-56">
        {vendorMenutItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-teal-100 text-teal-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
