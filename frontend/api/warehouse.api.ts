import axiosInstance from "@/lib/axios";
import { BookingFilter } from "@/types/booking.type";
import type {
  Warehouse,
  WarehouseFilter,
  WarehouseSetting,
} from "@/types/warehouse";

export const WarehouseApi = {
  createWarehouse: async (data: Warehouse): Promise<Warehouse> => {
    const response = await axiosInstance.post<Warehouse>(
      "/api/warehouse",
      data
    );
    return response.data;
  },

  updateWarehouse: async (data: Warehouse): Promise<Warehouse> => {
    const response = await axiosInstance.patch<Warehouse>(
      `/api/warehouse/${data.id}`,
      data
    );
    return response.data;
  },

  getWarehouses: async (filter?: WarehouseFilter): Promise<Warehouse[]> => {
    const params = new URLSearchParams();
    if (filter?.searchKey) {
      params.set("searchKey", filter.searchKey);
    }
    if (filter?.page) {
      params.set("page", filter.page.toString());
    }
    const response = await axiosInstance.get<Warehouse[]>("/api/warehouse", {
      params,
    });
    return response.data;
  },

  getWarehouseDetail: async (id: string): Promise<Warehouse> => {
    const response = await axiosInstance.get<Warehouse>(`/api/warehouse/${id}`);
    return response.data;
  },

  getMyWarehouseDetail: async (): Promise<Warehouse> => {
    const response = await axiosInstance.get<Warehouse>(
      `/api/warehouse/my-warehouse`
    );
    return response.data;
  },

  getMyAccessWarehouses: async () => {
    const response = await axiosInstance.get(
      "/api/warehouse/my-access-warehouses"
    );
    return response.data;
  },
  switchHomeWarehouse: async (id: string) => {
    const res = await axiosInstance.post(
      `/api/warehouse/switch-homeWarehouse`,
      {
        id,
      }
    );
    return res.data;
  },
  deleteWarehouse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/warehouse/${id}`);
  },

  getSettings: async (): Promise<WarehouseSetting> => {
    const response = await axiosInstance.get<WarehouseSetting>(
      `/api/warehouse/settings`
    );
    return response.data;
  },

  updateSetting: async (
    payload: WarehouseSetting
  ): Promise<WarehouseSetting> => {
    const response = await axiosInstance.put<WarehouseSetting>(
      `/api/warehouse/settings`,
      payload
    );
    return response.data;
  },
};
