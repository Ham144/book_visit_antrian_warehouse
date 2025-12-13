import axiosInstance from "@/lib/axios";
import type { LoginRequestDto, LoginResponseDto, UserApp } from "@/types/auth";
import { BaseProps } from "@/types/shared.type";

export const AuthApi = {
  loginUserLdap: async (
    credentials: LoginRequestDto
  ): Promise<LoginResponseDto> => {
    const response = await axiosInstance.post<LoginResponseDto>(
      "/api/user/login/ldap",
      credentials
    );
    return response.data;
  },

  loginUserAPP: async (credentials: LoginRequestDto) => {
    const response = await axiosInstance.post<LoginResponseDto>(
      "/api/user/login/app",
      credentials
    );
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.delete("/api/user/logout");
    return response.data;
  },

  getUserInfo: async () => {
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

  getAllAccountForMemberManagement: async (
    page?: number,
    searchKey?: string
  ) => {
    let params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("searchKey", searchKey);
    const response = await axiosInstance.get(
      "/api/user/list-member-management",
      { params }
    );
    return response.data;
  },

  createAppUser: async (body: UserApp) => {
    const response = await axiosInstance.post("/api/user/create", body);
    return response.data;
  },
};
