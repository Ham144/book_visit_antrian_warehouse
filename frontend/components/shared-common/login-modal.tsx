"use client";

import { AccountType, UserApp, UserInfo } from "@/types/auth";
import React, { Suspense, useState } from "react";
import { toast, Toaster } from "sonner";
import { Key, WarehouseIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { AuthApi } from "@/api/auth";
import { useRouter } from "next/navigation";
import Loading from "./Loading";

const LoginModal = () => {
  const [accountType, setAccountType] = useState<AccountType>(AccountType.AD);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    organization: "CATUR SUKSES INTERNASIONAL",
  });

  const router = useRouter();

  const { mutateAsync: handeLoginAD } = useMutation({
    mutationKey: ["userInfo"],
    mutationFn: async () => {
      const res = await AuthApi.loginUserLdap(formData);
      return res;
    },
    onSuccess: (res: UserInfo) => {
      (document.getElementById("login_modal") as any)?.close();
      if (!res?.vendorName && res?.homeWarehouse) {
        router.push("/admin/dashboard");
      } else {
        router.push("/vendor/dashboard");
      }
      window.location.reload();
    },
    onError: (er: any) => {
      toast.error(er?.response?.data?.message || "Gagal login");
    },
  });

  const { mutateAsync: handeLoginAPP } = useMutation({
    mutationKey: ["userInfo"],
    mutationFn: async () => {
      const res = await AuthApi.loginUserAPP(formData);
      return res;
    },
    onSuccess: (res: UserApp) => {
      (document.getElementById("login_modal") as any)?.close();
      window.location.reload();
      if (!res?.vendorName && res?.homeWarehouse) {
        router.push("/admin/dashboard");
      } else {
        router.push("/vendor/dashboard");
      }
    },
    onError: (er: any) => {
      toast.error(er?.response?.data?.message || "Gagal login");
    },
  });

  const onSubmitLogin = () => {
    if (accountType === AccountType.AD) {
      handeLoginAD();
    } else {
      handeLoginAPP();
    }
  };

  return (
    <>
      <dialog id="login_modal" className="modal">
        <div className="modal-box p-0 overflow-hidden max-w-md">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white">
            <h3 className="font-bold text-xl">Login ke Sistem</h3>
            <p className="text-teal-100 mt-1">Masuk ke portal Antrian Gudang</p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-teal-50 rounded-xl border border-teal-100 shadow-inner">
            <button
              onClick={() => {
                setAccountType(AccountType.AD);
                setFormData({
                  ...formData,
                  username: "",
                  password: "",
                });
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                accountType === AccountType.AD
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg scale-[1.02]"
                  : "bg-white text-teal-700 border border-teal-200 hover:bg-teal-50 hover:border-teal-300 hover:shadow-md"
              }`}
            >
              <WarehouseIcon />
              <span className="max-md:text-xs">Active Director</span>
            </button>

            <button
              onClick={() => {
                setAccountType(AccountType.APP);
                setFormData({
                  ...formData,
                  username: "",
                  password: "mockuser",
                });
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                accountType === AccountType.APP
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg scale-[1.02]"
                  : "bg-white text-teal-700 border border-teal-200 hover:bg-teal-50 hover:border-teal-300 hover:shadow-md"
              }`}
            >
              <Key />
              <span className="max-md:text-xs">App</span>
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitLogin();
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
                href="/forgot-password"
                className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
              >
                Lupa Password ?
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
        <Suspense fallback={<Loading />}>
          <Toaster key={"login"} position="top-center" />
        </Suspense>
      </dialog>
    </>
  );
};

export default LoginModal;
