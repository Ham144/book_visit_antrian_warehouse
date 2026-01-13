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
import { ROLE } from "@/types/shared.type";

const adminMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    roles: [ROLE.ADMIN_ORGANIZATION, ROLE.USER_ORGANIZATION],
  },
  {
    id: "queue",
    label: "Live Queue",
    icon: Tv2,
    href: "/admin/queue",
    roles: [ROLE.ADMIN_ORGANIZATION, ROLE.USER_ORGANIZATION],
  },
  {
    id: "slots",
    label: "Gate Management",
    icon: DoorOpen,
    href: "/admin/gate",
    roles: [ROLE.ADMIN_ORGANIZATION, ROLE.USER_ORGANIZATION],
  },
  {
    id: "busy-times",
    label: "Busy Times",
    icon: Clock,
    href: "/admin/busy-times",
    roles: [ROLE.ADMIN_ORGANIZATION, ROLE.USER_ORGANIZATION],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    href: "/admin/reports",
    roles: [ROLE.ADMIN_ORGANIZATION, ROLE.USER_ORGANIZATION],
  },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: Truck,
    href: "/admin/vehicles",
    roles: [ROLE.ADMIN_ORGANIZATION, ROLE.USER_ORGANIZATION],
  },
  {
    id: "my warehouse",
    label: "My Warehouse",
    icon: WarehouseIcon,
    href: "/admin/my-warehouse",
    roles: [ROLE.ADMIN_ORGANIZATION, ROLE.USER_ORGANIZATION],
  },
  {
    id: "warehouse setting",
    label: "Warehouse Setting",
    icon: Settings,
    href: "/admin/settings",
    roles: [ROLE.ADMIN_ORGANIZATION, ROLE.USER_ORGANIZATION],
  },
];

const ITOnlyMenus = [
  //IT Only---------
  {
    id: "All Warehouses",
    label: "All Warehouses",
    icon: Building2,
    href: "/admin/all-warehouse",
    roles: [ROLE.ADMIN_ORGANIZATION],
  },
  {
    id: "Organization Management",
    label: "Organization Management",
    icon: Crown,
    href: "/admin/organization-management",
    roles: [ROLE.ADMIN_ORGANIZATION],
  },
  {
    id: "members management",
    label: "members Management",
    icon: Users2Icon,
    href: "/admin/member-management",
    roles: [ROLE.ADMIN_ORGANIZATION],
  },
  {
    id: "Organization Setting",
    label: "Organization Setting",
    icon: Settings2Icon,
    href: "/admin/organization-settings",
    roles: [ROLE.ADMIN_ORGANIZATION],
  },
  {
    id: "Global Setting",
    label: "Global Setting",
    icon: PenTool,
    href: "/admin/global-settings",
    roles: [ROLE.ADMIN_ORGANIZATION],
  },
];

export const vendorMenutItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/vendor/dashboard",
    roles: [ROLE.DRIVER_VENDOR, ROLE.ADMIN_VENDOR, ROLE.ADMIN_ORGANIZATION],
  },
  {
    id: "booking",
    label: "Plan Visit",
    icon: Rocket,
    href: "/vendor/booking",
    roles: [ROLE.ADMIN_VENDOR, ROLE.ADMIN_ORGANIZATION],
  },
  {
    id: "history",
    label: "History Booking",
    icon: Clock,
    href: "/vendor/history",
    roles: [ROLE.ADMIN_VENDOR, ROLE.ADMIN_ORGANIZATION],
  },
  {
    id: "Members",
    label: "Member Management",
    icon: Users,
    href: "/vendor/member-management",
    roles: [ROLE.ADMIN_VENDOR, ROLE.ADMIN_ORGANIZATION],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    href: "/vendor/reports",
    roles: [ROLE.ADMIN_VENDOR, ROLE.ADMIN_ORGANIZATION],
  },
  {
    id: "driver menu",
    label: "Driver Menu",
    icon: Truck,
    href: "/vendor/driver-menu",
    roles: [ROLE.DRIVER_VENDOR, ROLE.ADMIN_ORGANIZATION],
  },
];

const SideNav = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // full
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { userInfo } = useUserInfo();

  // open when hover
  useEffect(() => {
    const handleMouseEnter = () => {
      setIsOpen(true);
    };
    const handleMouseLeave = () => {
      setIsOpen(false);
    };
    sidebarRef.current?.addEventListener("mouseenter", handleMouseEnter);
    sidebarRef.current?.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      sidebarRef.current?.removeEventListener("mouseenter", handleMouseEnter);
      sidebarRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="max-h-screen  flex flex-col w-full">
      <div className="flex flex-1">
        {/* SIDEBAR - Fixed dengan efek glassy */}
        <aside
          ref={sidebarRef}
          className={`
            fixed left-0 top-13 h-screen z-20
            bg-gradient-to-b from-emerald-50/90 to-white/90
            backdrop-blur-lg border-r border-emerald-100/50
            shadow-lg shadow-emerald-100/30
            transition-all duration-500 ease-in-out overflow-hidden
            no-scrollbar
            ${isOpen ? "w-64" : "w-16"}
            relative
            before:absolute before:inset-0 
            before:bg-gradient-to-r
           `}
        >
          {/* tombol tutup buka  */}
          {/* <div className="p-3 relative">
            <button
              onClick={() => setIsOpen((v) => !v)}
              type="button"
              className={`
                w-full flex items-center justify-center
                transition-all duration-300
                rounded-xl
                ${
                  isOpen
                    ? "bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 px-4 py-3"
                    : "p-3"
                }
                hover:from-emerald-500/20 hover:to-emerald-400/20
                active:scale-95
                relative overflow-hidden
                before:absolute before:inset-0 
                before:bg-gradient-to-r before:from-emerald-500/20 before:to-transparent
                before:opacity-0 hover:before:opacity-100
                before:transition-opacity before:duration-300
              `}
            >
              {isOpen ? (
                <span className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-emerald-700">
                    Tutup Menu
                  </span>
                  <div className="w-6 h-6 flex items-center justify-center bg-emerald-100 rounded-lg">
                    <ArrowLeft size={14} className="text-emerald-600" />
                  </div>
                </span>
              ) : (
                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm px-1">
                  <ArrowRight size={26} className="text-white" />
                </div>
              )}
            </button>
          </div> */}

          {/* Navigation */}
          <nav className="flex-1 overflow-auto px-2 max-h-screen pb-32 ">
            {adminMenuItems
              .filter((item) =>
                item.roles.some((role) => userInfo?.role === role)
              )
              .map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-3 rounded-xl mx-1 my-1
                      transition-all duration-300 relative overflow-hidden
                      ${
                        active
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-md shadow-emerald-200"
                          : "text-emerald-700 hover:bg-emerald-50/80 hover:shadow-sm"
                      }
                      ${isOpen ? "justify-start" : "justify-center"}
                    `}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-300 rounded-r-full"></div>
                    )}

                    {/* Icon with glow effect */}
                    <div
                      className={`
                      flex items-center justify-center transition-all duration-300
                      ${
                        active
                          ? "text-white"
                          : "text-emerald-500 group-hover:text-emerald-600"
                      }
                    `}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                    </div>

                    {isOpen && (
                      <span
                        className={`
                        truncate ml-3 text-sm font-medium transition-all duration-300
                        ${active ? "text-white" : "text-emerald-700"}
                      `}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Hover glow effect */}
                    {!active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </Link>
                );
              })}

            {ITOnlyMenus.filter((item) =>
              item.roles.some((role) => userInfo?.role === role)
            ).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                      group flex items-center px-3 py-3 rounded-xl mx-1 my-1
                      transition-all duration-300 relative overflow-hidden
                      ${
                        active
                          ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-md shadow-blue-200"
                          : "text-blue-700 hover:bg-blue-50/80 hover:shadow-sm"
                      }
                      ${isOpen ? "justify-start" : "justify-center"}
                    `}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-300 rounded-r-full"></div>
                  )}

                  <div
                    className={`
                      flex items-center justify-center transition-all duration-300
                      ${
                        active
                          ? "text-white"
                          : "text-blue-500 group-hover:text-blue-600"
                      }
                    `}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                  </div>

                  {isOpen && (
                    <span
                      className={`
                        truncate ml-3 text-sm font-medium transition-all duration-300
                        ${active ? "text-white" : "text-blue-700"}
                      `}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}

            {vendorMenutItems
              .filter((item) =>
                item.roles.some((role) => userInfo?.role === role)
              )
              .map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`
                    group flex items-center px-3 py-3 rounded-xl mx-1 my-1
                    transition-all duration-300 relative overflow-hidden
                    ${
                      active
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-md shadow-amber-200"
                        : "text-amber-700 hover:bg-amber-50/80 hover:shadow-sm"
                    }
                    ${isOpen ? "justify-start" : "justify-center"}
                  `}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-300 rounded-r-full"></div>
                    )}

                    <div
                      className={`
                    flex items-center justify-center transition-all duration-300
                    ${
                      active
                        ? "text-white"
                        : "text-amber-500 group-hover:text-amber-600"
                    }
                  `}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                    </div>

                    {isOpen && (
                      <span
                        className={`
                      truncate ml-3 text-sm font-medium transition-all duration-300
                      ${active ? "text-white" : "text-amber-700"}
                    `}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
          </nav>

          {/* Glassy bottom effect */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/50 to-transparent pointer-events-none"></div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-hidden max-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default SideNav;
