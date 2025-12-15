import { UserApp, UserInfo } from "./auth";

export interface IVendor {
  name: string;
  organization?: string;
  members: UserApp[] | UserInfo[];
}
