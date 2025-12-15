export interface TokenPayload {
  username: string;
  description: string;
  isOperator: boolean;
  homeWarehouseId?: string;
  vendorName?: string;
  organizationName: string;
  iat?: number;
  exp?: number;
}
