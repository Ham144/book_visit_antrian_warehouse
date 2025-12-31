export interface BaseProps {
  page?: number;
  searchKey?: string;
}

export interface BookingFilter {
  searchKey?: string | null;
  warehouseId?: string | null; //untuk admin warehouse
  page?: number;
  vendorName?: string | null; //untuk admin vendor
  date?: string | null;
}
