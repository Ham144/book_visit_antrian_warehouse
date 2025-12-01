export interface WarehouseCreateDto {
  name: string;
  location?: string;
  description?: string;
  warehouseAccess?: string[];
  isActive?: boolean;
}

export interface WarehouseUpdateDto {
  id: string;
  name?: string;
  location?: string;
  description?: string;
  warehouseAccess?: string[];
  isActive?: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  location?: string | null;
  description?: string | null;
  isActive?: boolean;
  budgets?: object[];
  flowLogs?: object[];
  members?: object[];
  warehouseAccess?: string[];
  docks?: object[];
  bookings?: object[];
  createdAt?: Date;
  updatedAt?: Date;
  organizationName?: string;
}

export interface GetWarehouseFilter {
  searchKey?: string;
  page?: number;
}
