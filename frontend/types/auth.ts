import { Organization } from "./organization";
import { Warehouse } from "./warehouse";

export interface LoginRequestLdapDto {
  username: string;
  password: string;
  organization: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  description: string;
  username: string;
  displayName?: string;
  homeWarehouse: Warehouse; //ini adalah warehouse yang sedang di login-in
  isActive?: boolean;
  organizationName: Organization;
  // Tambahkan field lain sesuai kebutuhan
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}
