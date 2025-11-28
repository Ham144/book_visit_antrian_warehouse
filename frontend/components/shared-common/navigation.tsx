"use client";

import {
  ChevronDown,
  LogIn,
  LogOut,
  Settings,
  Truck,
  User2,
  Building2,
  Check,
  WarehouseIcon,
  Search,
} from "lucide-react";
import { useUserInfo } from "../UserContext";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthApi } from "@/api/auth";
import { toast, Toaster } from "sonner";
import { OrganizationApi } from "@/api/organization.api";
import { WarehouseApi } from "@/api/warehouse.api";
import { Organization } from "@/types/organization";
import { Warehouse } from "@/types/warehouse";

export default function Navigation() {
  const { userInfo, setUserInfo } = useUserInfo();
  const searchBar = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    username: "yafizham",
    password: "Catur2025!",
    organization: "CATUR SUKSES INTERNASIONAL",
  });

  const { data: warehouseAccess } = useQuery({
    queryKey: ["my-access-warehouses"],
    queryFn: WarehouseApi.getMyAccessWarehouses,
  });

  const { data: myOrganizations } = useQuery({
    queryKey: ["my-organizations"],
    queryFn: OrganizationApi.getMyOrganizations,
  });

  const router = useRouter();

  const { mutateAsync: handeLogin } = useMutation({
    mutationKey: ["userInfo"],
    mutationFn: async () => {
      const res = await AuthApi.loginUserLdap(formData);
      return res;
    },
    onSuccess: (res: any) => {
      setUserInfo(res);
      (document.getElementById("login_modal") as any)?.close();
      if (res?.description) {
        router.push("/admin/dashboard");
      } else {
        router.push("/vendor/dashboard");
      }
    },
    onError: (er: any) => {
      console.log(er);
      toast.error(er?.response?.data?.message || "Gagal login");
    },
  });

  const { mutateAsync: handleLogout } = useMutation({
    mutationKey: ["userInfo"],
    mutationFn: AuthApi.logout,
    onSuccess: () => {
      setUserInfo(null);
      window.location.href = "/";
    },
    onError: (er: any) => {
      window.location.href = "/";
    },
  });

  const { mutateAsync: handleSwitchWarehouse } = useMutation({
    mutationKey: ["userInfo"],
    mutationFn: async (id: string) =>
      await WarehouseApi.switchHomeWarehouse(id),
    onSuccess: (res) => {
      setUserInfo(res);
    },
    onError: (re: any) => {
      toast.error(re?.response.data.message);
    },
  });

  const { mutateAsync: handleSwitchOrganization } = useMutation({
    mutationKey: ["userInfo"],
    mutationFn: async (id: string) =>
      await OrganizationApi.switchOrganization(id),
    onSuccess: (res) => {
      setUserInfo(res);
    },
    onError: (re: any) => {
      toast.error(re?.response.data.message);
    },
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault(); // cegah Chrome / Edge membuka search bar
        e.stopPropagation();
        searchBar.current?.focus();
      }
    }

    // pakai capture: true supaya override behaviour browser
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50 ">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-2.5 rounded-xl shadow-lg">
                <Truck className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-teal-600 bg-clip-text text-transparent">
                  Antrian Gudang
                </h1>
                <p className="max-md:hidden text-xs text-gray-500 font-medium">
                  {userInfo?.description ? "Portal Operator" : "Portal Vendor"}
                </p>
              </div>
            </div>
          </div>

          {userInfo && (
            <div className="relative group max-md:hidden">
              <input
                type="text"
                ref={searchBar}
                placeholder="Cari Menu..."
                className="xl:w-[500px] lg:w-[300px] pl-8 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
              />

              {/* Search Icon */}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              {/* Keyboard Shortcut Hint */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded text-gray-500">
                  Ctrl
                </kbd>
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded text-gray-500">
                  K
                </kbd>
              </div>
            </div>
          )}

          {/* Right Section - Login/User Menu */}
          <div className="flex items-center space-x-4">
            {/* Login Button (when not logged in) */}
            {!userInfo && (
              <button
                onClick={() =>
                  (
                    document.getElementById("login_modal") as HTMLDialogElement
                  ).showModal()
                }
                className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-3 btn md:p-2"
              >
                <LogIn />
                <span className="max-md:hidden">Login</span>
              </button>
            )}

            {/* User Menu (when logged in) */}
            {userInfo && (
              <div className="flex items-center gap-x-4">
                {/* Organization & Warehouse Switcher */}
                <div className="flex items-center gap-x-3">
                  {/* Organization Switcher */}
                  <div className="dropdown dropdown-end">
                    <div
                      tabIndex={0}
                      className="flex items-center gap-x-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group min-w-[160px]"
                    >
                      <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {userInfo?.organizationName as any}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Organization
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                    </div>

                    <ul className="dropdown-content z-[1] menu p-2 shadow-2xl bg-white rounded-xl w-80 mt-2 border border-gray-100">
                      {myOrganizations?.length > 0 &&
                        myOrganizations?.map((org: Organization) => (
                          <li key={org.name}>
                            <button
                              onClick={() => org.name}
                              className={`flex items-center gap-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                                (org.name as string) ===
                                (userInfo?.organizationName as any)
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              <Building2
                                className={`w-4 h-4 flex-shrink-0 ${
                                  (org.name as any) ===
                                  (userInfo?.organizationName as any)
                                    ? "text-blue-500"
                                    : "text-gray-400"
                                }`}
                              />
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">
                                  {org.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Organization
                                </p>
                              </div>
                              {org.name ===
                                (userInfo?.organizationName as any) && (
                                <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              )}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Warehouse Switcher */}
                  <div className="dropdown dropdown-end">
                    <div
                      tabIndex={0}
                      className="flex items-center gap-x-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer group min-w-[160px]"
                    >
                      <WarehouseIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {userInfo?.homeWarehouse.name || "Main Warehouse"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Warehouse
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors duration-200" />
                    </div>

                    <ul className="dropdown-content z-[1] menu p-2 shadow-2xl bg-white rounded-xl w-80 mt-2 border border-gray-100">
                      {warehouseAccess?.length > 0 &&
                        warehouseAccess?.map((warehouse: Warehouse) => (
                          <li key={warehouse.id}>
                            <button
                              onClick={() =>
                                handleSwitchWarehouse(warehouse.id)
                              }
                              className={`flex items-center gap-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                                warehouse.id === userInfo?.homeWarehouse.id
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              <WarehouseIcon
                                className={`w-4 h-4 flex-shrink-0 ${
                                  warehouse.id === userInfo?.homeWarehouse.id
                                    ? "text-green-500"
                                    : "text-gray-400"
                                }`}
                              />
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">
                                  {warehouse.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {warehouse.location}
                                </p>
                              </div>
                              {warehouse.id === userInfo?.homeWarehouse.id && (
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              )}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* User Profile Dropdown */}
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-white/80 backdrop-blur-sm transition-all duration-300"
                  >
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-gray-800 text-sm">
                        {userInfo?.username}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {userInfo?.description || "Vendor"}
                      </p>
                    </div>
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        {userInfo?.displayName?.charAt(0) ||
                          userInfo?.username?.charAt(0) ||
                          "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                  </div>

                  <ul className="dropdown-content z-[1] menu p-3 shadow-2xl bg-white rounded-2xl w-72 mt-2 border border-gray-100">
                    {/* User Info Header */}
                    <li className="border-b border-gray-100">
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {userInfo?.displayName?.charAt(0) ||
                              userInfo?.username?.charAt(0) ||
                              "U"}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {userInfo?.displayName || userInfo?.username}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {userInfo?.description || "Vendor"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {userInfo?.organizationName as any}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>

                    {/* Profile Button */}
                    <li>
                      <button
                        onClick={() =>
                          (
                            document.getElementById(
                              "profile_modal"
                            ) as HTMLDialogElement
                          ).showModal()
                        }
                        className="flex items-center gap-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 group"
                      >
                        <User2 className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        <span>
                          Profile{" "}
                          {userInfo?.description === "admin"
                            ? "Admin"
                            : "Vendor"}
                        </span>
                      </button>
                    </li>

                    {/* Settings */}
                    <li>
                      <button className="flex items-center gap-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 group">
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        <span>Pengaturan</span>
                      </button>
                    </li>

                    {/* Logout */}
                    <li className="border-t border-gray-100 mt-2">
                      <button
                        onClick={() => handleLogout()}
                        className="flex items-center gap-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <dialog id="login_modal" className="modal">
        <div className="modal-box p-0 overflow-hidden max-w-md">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white">
            <h3 className="font-bold text-xl">Login ke Sistem</h3>
            <p className="text-teal-100 mt-1">Masuk ke portal Antrian Gudang</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handeLogin();
            }}
            className="p-6 space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="ham"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="******"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
            </div>

            <button className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Login Sekarang
            </button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
              >
                Masuk dengan akun non AD?
              </a>
            </div>
          </form>

          <div className="modal-action p-4 bg-gray-50">
            <form method="dialog">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                Tutup
              </button>
            </form>
          </div>
        </div>
        <Toaster key={"login"} />
      </dialog>

      <dialog id="profile_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Profile!</h3>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </nav>
  );
}
