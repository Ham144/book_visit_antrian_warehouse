import axiosInstance from "@/lib/axios";

export const VendorApi = {
  getAllVendors: async () => {
    const res = await axiosInstance("/api/vendor/list");
    return res.data;
  },
  getVendorDetail: async (name: string) => {
    const res = await axiosInstance(`/api/vendor/${name}`);
    return res.data;
  },
};
