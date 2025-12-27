import axiosInstance from "@/lib/axios";
import type { LoginRequestDto, UserApp, UserInfo } from "@/types/auth";
import { BaseProps } from "@/types/shared.type";

export const AuthApi = {
  loginUserLdap: async (credentials: LoginRequestDto): Promise<UserInfo> => {
    const response = await axiosInstance.post<UserInfo>(
      "/api/user/login/ldap",
      credentials
    );
    return response.data;
  },

  loginUserAPP: async (credentials: LoginRequestDto): Promise<UserApp> => {
    const response = await axiosInstance.post<UserApp>(
      "/api/user/login/app",
      credentials
    );
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.delete("/api/user/logout");
    return response.data;
  },

  getUserInfo: async (): Promise<UserApp | UserInfo> => {
    const response = await axiosInstance.get("/api/user/get-user-info");
    return response.data;
  },

  updateAccount: async (body: UserApp) => {
    const response = await axiosInstance.patch("/api/user/update", body);
    return response.data;
  },

  getAllAccount: async ({ page, searchKey }: BaseProps) => {
    let params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("searchKey", searchKey);
    const response = await axiosInstance.get("/api/user/list", { params });
    return response.data;
  },

  getAllMyDrivers: async ({ page, searchKey }: BaseProps) => {
    let params = new URLSearchParams();
    if (page) {
      params.set("page", page.toString());
    }
    if (searchKey) {
      params.set("searchKey", searchKey);
    }
    const res = await axiosInstance.get("/api/user/my-drivers", { params });
    return res.data;
  },

  getAllAccountForMemberManagement: async ({
    page = 1,
    searchKey = "",
  }: BaseProps) => {
    let params = new URLSearchParams();
    if (page) {
      params.set("page", page.toString());
    }
    if (searchKey) {
      params.set("searchKey", searchKey);
    }
    const response = await axiosInstance.get(
      "/api/user/list-member-management",
      { params }
    );
    return response.data;
  },

  getVendorMemberOnly: async ({ page = 1, searchKey = "" }: BaseProps) => {
    let params = new URLSearchParams();
    if (page) {
      params.set("page", page.toString());
    }
    if (searchKey) {
      params.set("searchKey", searchKey);
    }
    const response = await axiosInstance.get("/api/user/list-member-vendor", {
      params,
    });
    return response.data;
  },

  createAppUser: async (body: UserApp) => {
    const response = await axiosInstance.post("/api/user/create", body);
    return response.data;
  },
  deleteAppUser: async (id: string) => {
    const res = await axiosInstance.delete("/api/user/delete/" + id);
    return res.data;
  },
};
