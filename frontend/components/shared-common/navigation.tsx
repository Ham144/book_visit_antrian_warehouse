"use client";

import { LogIn, LogOut, Settings, Truck, User2 } from "lucide-react";
import { useUserInfo } from "../UserContext";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthApi } from "@/api/auth";
import { toast, Toaster } from "sonner";

export default function Navigation() {
  const { userInfo, setUserInfo } = useUserInfo();

  const [formData, setFormData] = useState({
    username: "yafizham",
    password: "Catur2025!",
    organization: "CATUR SUKSES INTERNASIONAL",
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

            {/* Navigation Links */}
            {userInfo && userInfo.description !== "IT" && (
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <a
                  href="/vendor/dashboard"
                  className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium rounded-lg transition-all duration-200 hover:bg-teal-50"
                >
                  Dashboard
                </a>
                <a
                  href="/vendor/booking"
                  className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium rounded-lg transition-all duration-200 hover:bg-teal-50"
                >
                  Pemesanan
                </a>
                <a
                  href="/vendor/history"
                  className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium rounded-lg transition-all duration-200 hover:bg-teal-50"
                >
                  History
                </a>
                <a
                  href="/vendor/vehicles"
                  className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium rounded-lg transition-all duration-200 hover:bg-teal-50"
                >
                  Kendaraan
                </a>
              </div>
            )}
          </div>

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
              <div
                onClick={() => {}}
                tabIndex={0}
                className="dropdown dropdown-end"
              >
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-gray-800 text-sm">
                      {userInfo?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userInfo?.description ? "operator" : "Vendor"}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-200">
                      {userInfo?.description ? "A" : "V"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                </div>

                <ul className="dropdown-content z-[1] menu p-3 shadow-2xl bg-white rounded-2xl w-64 mt-2 border border-gray-100">
                  <li className="border-b border-gray-100">
                    <div className="px-4 py-3">
                      <p className="font-semibold text-gray-800">
                        {userInfo?.displayName || userInfo?.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {userInfo?.description}
                      </p>
                    </div>
                  </li>
                  <button
                    onClick={() =>
                      (
                        document.getElementById(
                          "profile_modal"
                        ) as HTMLDialogElement
                      ).showModal()
                    }
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-all duration-200"
                  >
                    <User2 />
                    <span>
                      Profil{" "}
                      {userInfo?.description === "admin" ? "Admin" : "Vendor"}
                    </span>
                  </button>
                  <li>
                    <a className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-all duration-200">
                      <Settings />
                      <span>Pengaturan</span>
                    </a>
                  </li>
                  <li className="border-t border-gray-100 mt-2">
                    <a
                      onClick={() => handleLogout()}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <LogOut />
                      <span>Keluar</span>
                    </a>
                  </li>
                </ul>
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
