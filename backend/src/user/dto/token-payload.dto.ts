export interface TokenPayload {
  username: string;
  description: string;
  homeWarehouseId: string | null;
  organizationName: string;
  vendorName: string | null;
  jti: string;
}
