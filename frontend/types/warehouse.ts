export interface Warehouse {
  id?: string;
  name: string;
  location?: string | null;
  description?: string | null;
  isActive?: boolean;
  budgets?: object[];
  flowLogs?: object[];
  homeMembers?: object[];
  userWarehouseAccesses?: string[];
  docks?: object[];
  bookings?: object[];
  delayTolerance?: number;
  intervalMinimalQueueu?: number;
  createdAt?: Date;
  updatedAt?: Date;
  organizationName?: string;
  isAutoEfficientActive?: boolean;
  maximumWeekSelection?: number;
}

export interface WarehouseSetting {
  id?: number;
  name?: string;
  intervalMinimalQueueu?: number;
  delayTolerance?: number;
  isAutoEfficientActive?: boolean;
  maximumWeekSelection?: number;
}

export interface WarehouseFilter {
  searchKey?: string;
  page?: number;
}
