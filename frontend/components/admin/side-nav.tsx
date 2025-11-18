"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Users,
  BarChart3,
  Truck,
  DoorOpen,
  Settings,
  WarehouseIcon,
  Settings2Icon,
  Users2Icon,
  SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Tv2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUserInfo } from "../UserContext";

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
  { id: "queue", label: "Live Queue", icon: Tv2, href: "/admin/queue" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/admin/reports" },
  { id: "vehicles", label: "Vehicles", icon: Truck, href: "/admin/vehicles" },
  {
    id: "my warehouse",
    label: "My Warehouse",
    icon: WarehouseIcon,
    href: "/admin/vehicles",
  },
  {
    id: "members management",
    label: "members Management",
    icon: Users2Icon,
    href: "/admin/member-management",
  },
  {
    id: "warehouse setting",
    label: "Warehouse Setting",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    id: "All Warehouses",
    label: "All Warehouses",
    icon: WarehouseIcon,
    href: "/admin/all-warehouse",
  },
];

const ITOnlyMenus = [
  //IT Only---------
  {
    id: "Global Setting",
    label: "Global Setting",
    icon: SettingsIcon,
    href: "/admin/global-settings",
  },
  {
    id: "Organization Setting",
    label: "Organization Setting",
    icon: Settings2Icon,
    href: "/admin/organization-settings",
  },
];

export default function SideNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // full
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { userInfo } = useUserInfo();
  // Collapse when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      {/* SIDEBAR */}
      <aside
        ref={sidebarRef}
        className={`
           z-20 h-screen bg-base-100 border-r border-base-300 shadow-md
          transition-all duration-300 overflow-hidden
          ${isOpen ? "w-64" : "w-12"}
        `}
      >
        {/* Expand / Collapse Button */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="btn btn-ghost w-full flex items-center justify-between px-4 py-3"
        >
          {isOpen ? (
            <>
              <span className="font-semibold">
                {userInfo?.organization?.name || "Org's name"}
              </span>
              <ChevronLeft size={20} />
            </>
          ) : (
            <ChevronRight size={20} className="mx-auto" />
          )}
        </button>

        {/* Navigation */}
        <nav className="mt-4 space-y-1">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-y-2 px-3 gap-x-2 py-2 rounded-lg transition-all
                  ${
                    active
                      ? "bg-primary/20 text-primary gapx3"
                      : "hover:bg-base-200"
                  }
                `}
              >
                <Icon size={20} />

                {/* Hide text if collapsed */}
                {isOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          {/* Divider */}
          {isOpen && <div className="divider my-2">IT Only</div>}

          {ITOnlyMenus.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                  ${active ? "bg-primary/20 text-primary" : "hover:bg-base-200"}
                `}
              >
                <Icon size={20} />
                {isOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
