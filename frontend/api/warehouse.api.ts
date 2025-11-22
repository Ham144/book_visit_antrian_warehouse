import axiosInstance from "@/lib/axios";
import type {
  WarehouseCreateDto,
  WarehouseUpdateDto,
  Warehouse,
  GetWarehouseFilter,
} from "@/types/warehouse";

export const WarehouseApi = {
  createWarehouse: async (data: WarehouseCreateDto): Promise<Warehouse> => {
    const response = await axiosInstance.post<Warehouse>("/api/warehouse", data);
    return response.data;
  },

  updateWarehouse: async (data: WarehouseUpdateDto): Promise<Warehouse> => {
    const response = await axiosInstance.patch<Warehouse>(
      `/api/warehouse/${data.id}`,
      data,
    );
    return response.data;
  },

  getWarehouses: async (filter?: GetWarehouseFilter): Promise<Warehouse[]> => {
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
    const response = await axiosInstance.get<Warehouse>(`/api/warehouse/${id}`);
    return response.data;
  },

  deleteWarehouse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/warehouse/${id}`);
  },
};
