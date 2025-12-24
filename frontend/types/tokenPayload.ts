export interface TokenPayload {
  username: string;
  role: ROLE;
  homeWarehouseId?: string;
  vendorName?: string;
  organizationName: string;
  iat?: number;
  exp?: number;
}

export enum ROLE {
  DRIVER_VENDOR = "DRIVER_VENDOR",
  ADMIN_VENDOR = "ADMIN_VENDOR",
  ADMIN_ORGANIZATION = "ADMIN_ORGANIZATION",
  USER_ORGANIZATION = "USER_ORGANIZATION",
}
