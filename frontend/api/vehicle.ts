import axiosInstance from "@/lib/axios";
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

  getVehicles: async (): Promise<IVehicle[]> => {
    const response = await axiosInstance.get<IVehicle[]>("/api/vehicle");
    return response.data;
  },

  getVehicle: async (id: string): Promise<IVehicle> => {
    const response = await axiosInstance.get<IVehicle>(`/api/vehicle/${id}`);
    return response.data;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/vehicle/${id}`);
  },
};

