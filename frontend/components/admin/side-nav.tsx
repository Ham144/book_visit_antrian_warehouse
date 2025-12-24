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
  Rocket,
  Building2,
  PenTool,
  Crown,
  ArrowRight,
  ArrowLeft,
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
    href: "/admin/my-warehouse",
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
    icon: Building2,
    href: "/admin/all-warehouse",
  },
];

const ITOnlyMenus = [
  //IT Only---------

  {
    id: "Organization Management",
    label: "Organization Management",
    icon: Crown,
    href: "/admin/organization-management",
  },
  {
    id: "Organization Setting",
    label: "Organization Setting",
    icon: Settings2Icon,
    href: "/admin/organization-settings",
  },
  {
    id: "Global Setting",
    label: "Global Setting",
    icon: PenTool,
    href: "/admin/global-settings",
  },
];

export const vendorMenutItems = [
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
    id: "Members",
    label: "Member Management",
    icon: Users,
    href: "/vendor/member-management",
  },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/vendor/reports" },
];

export default function SideNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // full
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { userInfo } = useUserInfo();

  const am_i_vendor = userInfo?.vendorName ? true : false;

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
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 pt-13">
        {/* SIDEBAR - Fixed */}
        <aside
          ref={sidebarRef}
          className={`
    fixed left-0 top-13 h-[calc(100vh-52px)] z-20
    bg-base-100 border-r border-base-300 shadow-md
    transition-all duration-300 overflow-auto
    no-scrollbar
    ${isOpen ? "w-64" : "w-14"}
  `}
        >
          {/* Expand / Collapse Button */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            type="button"
            className="btn btn-ghost w-full flex items-center justify-between  transition-colors translate-x-2 "
          >
            {isOpen ? (
              <span className="flex justify-between w-full px-3 text-slate-700">
                Tutup
                <ArrowLeft />
              </span>
            ) : (
              <span className="flex justify-between px-3 font-bold text-slate-700">
                <ArrowRight />
              </span>
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 overflow-auto">
            {!am_i_vendor &&
              adminMenuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg mx-2 my-1 transition-all
                    ${active ? "text-teal-600" : "hover:bg-base-200"}
                  `}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {isOpen && (
                      <span className="truncate ml-2 text-sm">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}

            {/* Divider */}
            {isOpen && !am_i_vendor && (
              <div className="divider py-3 border-b-2 border-t-2 my-2 mx-2 text-xs text-gray-500">
                IT Only
              </div>
            )}

            {!am_i_vendor &&
              ITOnlyMenus.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg mx-2 my-1 transition-all
                    ${active ? "text-teal-600" : "hover:bg-base-200"}
                  `}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {isOpen && (
                      <span className="truncate ml-2 text-sm">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}

            {/* Divider */}
            {isOpen && !am_i_vendor && (
              <div className="divider py-3 border-b-2 border-t-2 my-2 mx-2 text-xs text-gray-500">
                Vendor Only Menu
              </div>
            )}

            {vendorMenutItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg mx-2 my-1 transition-all
                     ${active ? "text-teal-600" : "hover:bg-base-200"}
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isOpen && (
                    <span className="truncate ml-2 text-sm">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT - Scrollable */}
        <main
          className={`
            flex-1 transition-all duration-300 overflow-auto
            ${isOpen ? "ml-64" : "ml-12"}
            bg-gray-50
          `}
        ></main>
      </div>
    </div>
  );
}
