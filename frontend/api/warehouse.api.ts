import axiosInstance from "@/lib/axios";
import type { Warehouse, WarehouseFilter } from "@/types/warehouse";

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

  getWarehouse: async (id: string): Promise<Warehouse> => {
    const response = await axiosInstance.get<Warehouse>(
      `/api/warehouse/detail/${id}`
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
};
