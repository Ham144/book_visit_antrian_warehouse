import { ROLE } from 'src/common/shared-enum';

export interface TokenPayload {
  username: string;
  role: ROLE;
  homeWarehouseId?: string;
  vendorName?: string;
  organizationName: string;
  jti?: string;
}
