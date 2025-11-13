"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Clock,
  Users,
  BarChart3,
  Truck,
  DoorOpen,
  Settings,
} from "lucide-react";

interface SideNavProps {
  role: "admin" | "vendor";
  currentPage?: string;
}

const adminMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    id: "slots",
    label: "Dock Management",
    icon: DoorOpen,
    href: "/admin/dock",
  },
  {
    id: "busy-times",
    label: "Busy Times",
    icon: Clock,
    href: "/admin/busy-times",
  },
  { id: "queue", label: "Live Queue", icon: Users, href: "/admin/queue" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/admin/reports" },
  { id: "vehicles", label: "Vehicles", icon: Truck, href: "/admin/vehicles" },
];

const ITOnlyMenus = [
  //IT Only---------
  {
    id: "Warehouse Management",
    label: "Warehouse Management",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    id: "Global Setting",
    label: "Global Setting",
    icon: Settings,
    href: "/admin/global-settings",
  },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className=" bg-white border-r border-gray-200 shadow-sm min-h-screen p-4">
      <nav className="space-y-2">
        {adminMenuItems.map((item) => {
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
        <div className="divider">IT menus</div>
        {ITOnlyMenus.map((item) => {
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
