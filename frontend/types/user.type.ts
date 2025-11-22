export interface UserApp {
  id?: string;
  username: string;

  password?: string;
  passwordConfirm?: string;

  description?: string;

  isActive?: boolean;

  displayName?: string;

  driverPhone?: string;

  driverLicense?: string;
  homeWarehouseId?: string;
}
