import { FilterVehicle } from "@/app/admin/vehicles/page";
import axiosInstance from "@/lib/axios";
import { BaseProps } from "@/types/shared.type";
import type { IVehicle } from "@/types/vehicle";

type VehiclePayload = Omit<IVehicle, "id" | "createdAt" | "updatedAt">;

export const VehicleApi = {
  createVehicle: async (data: VehiclePayload): Promise<IVehicle> => {
    const response = await axiosInstance.post<IVehicle>("/api/vehicle", data);
    return response.data;
  },

  updateVehicle: async (
    id: string,
    data: Partial<VehiclePayload>
  ): Promise<IVehicle> => {
    const response = await axiosInstance.patch<IVehicle>(
      `/api/vehicle/${id}`,
      data
    );
    return response.data;
  },

  getVehicles: async (filter: FilterVehicle): Promise<IVehicle[]> => {
    const params = new URLSearchParams();
    if (filter.searchKey) params.set("searchKey", filter.searchKey);
    if (filter.page) params.set("page", filter.page.toString());
    const response = await axiosInstance.get<IVehicle[]>("/api/vehicle", {
      params,
    });
    return response.data;
  },
  getVendorVehicles: async (filter: BaseProps) => {
    const params = new URLSearchParams();
    if (filter.page) params.set("page", filter.page.toString());
    if (filter.searchKey) params.set("searchKey", filter.searchKey);
    const res = await axiosInstance.get("/api/vehicle/vendor-vehicles", {
      params,
    });
    return res.data;
  },
  getVehicleDetail: async (id: string): Promise<IVehicle> => {
    const response = await axiosInstance.get<IVehicle>(
      `/api/vehicle/detail/${id}`
    );
    return response.data;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/vehicle/${id}`);
  },
};
