import axiosInstance from "@/lib/axios";
import { IGlobalSettings } from "@/types/global-settings.type";

export const GlobalsettingApi = {
  getGlobalSetting: async (): Promise<IGlobalSettings> => {
    const res = await axiosInstance.get("/api/global-setting");
    return res.data;
  },
  updateGlobalsetting: async (body: IGlobalSettings) => {
    const res = await axiosInstance.put("/api/global-setting");
    return res.data;
  },
};
