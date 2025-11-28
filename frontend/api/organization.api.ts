import axiosInstance from "@/lib/axios";

export const OrganizationApi = {
  getMyOrganizations: async () => {
    const res = await axiosInstance.get("/api/organization/my-organizations");
    return res?.data;
  },
  switchOrganization: async (id: string) => {
    const res = await axiosInstance.post("/api/organization/switch", {
      id,
    });
    return res.data;
  },
};
