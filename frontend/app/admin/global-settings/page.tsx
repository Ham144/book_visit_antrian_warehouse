"use client";
import { GlobalsettingApi } from "@/api/global-setting.api";
import { OrganizationApi } from "@/api/organization.api";
import { useUserInfo } from "@/components/UserContext";
import { IGlobalSettings } from "@/types/global-settings.type";
import { MyOrganizationSettings } from "@/types/organization";
import { ROLE } from "@/types/shared.type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const GlobalSettingsPage = () => {
  const [settingsData, setSettingsData] = useState<IGlobalSettings>();

  const { userInfo } = useUserInfo();
  const isAdmin = userInfo?.role == ROLE.ADMIN_ORGANIZATION;

  const { data: globalSettings, isLoading } = useQuery({
    queryKey: ["global-settings"],
    queryFn: async () => {
      const data = await GlobalsettingApi.getGlobalSetting();
      setSettingsData(data);
      return data;
    },
    enabled: !!isAdmin,
  });

  const { mutateAsync: handleSubmit, isPending } = useMutation({
    mutationKey: ["global-settings"],
    mutationFn: async () => {
      const res = await GlobalsettingApi.updateGlobalsetting(settingsData);
      return res;
    },
    onSuccess: () => {
      toast.success(
        "Berhasil memperbarui, pengaturan akan berlaku untuk semua akun"
      );
    },
    onError: (er) => {
      toast.error(er.message);
    },
  });

  if (isLoading) {
    <div className="flex w-full min-h-screen justify-center items-center">
      <span className="loading loading-ring loading-lg"></span>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 p-4 md:p-6">
      <div className="container mx-auto">
        <form
          id="settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-teal-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Global Settings</h2>
              <p className="text-teal-100 text-sm mt-1">
                Konfigurasi seluruh tenant
              </p>
            </div>

            {/* Form Footer */}
            <div className="bg-teal-50 px-6 py-4 border-t border-teal-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalSettingsPage;
