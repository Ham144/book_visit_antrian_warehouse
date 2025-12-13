import axiosInstance from "@/lib/axios";
import { Organization } from "@/types/organization";
import { BaseProps } from "@/types/shared.type";

export const OrganizationApi = {
  registerOrganization: async (body: Organization) => {
    const res = await axiosInstance.post("/api/organization", body);
    return res?.data;
  },
  getMyOrganizations: async () => {
    const res = await axiosInstance.get("/api/organization/my-organizations");
    return res?.data;
  },

  updateOrganization: async (name: string, body: Organization) => {
    const res = await axiosInstance.patch(`/api/organization/${name}`, body);
    return res?.data;
  },
  switchOrganization: async (name: string) => {
    const res = await axiosInstance.post("/api/organization/switch", { name });
    return res.data;
  },
  getAllOrganizations: async (filter: BaseProps): Promise<Organization[]> => {
    const params = new URLSearchParams();
    const { page, searchKey } = filter;
    if (searchKey) params.set("searchKey", searchKey);
    if (page) params.set("page", page.toString());

    const res = await axiosInstance.get("/api/organization", {
      params,
    });
    return res?.data;
  },
  deleteOrganization: async (name: string) => {
    const res = await axiosInstance.delete(`/api/organization/${name}`);
    return res?.data;
  },
};
