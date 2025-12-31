import { ROLE } from "./shared.type";

export interface TokenPayload {
  username: string;
  role: ROLE;
  homeWarehouseId?: string;
  vendorName?: string;
  organizationName: string;
  iat?: number;
  exp?: number;
}
