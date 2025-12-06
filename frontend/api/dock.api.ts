import axiosInstance from "@/lib/axios";
import { DockFilter, IDock } from "@/types/dock.type";

export const DockApi = {
  registerDock: async (data: IDock) => {
    const res = await axiosInstance.post("/api/dock", data);
    return res.data;
  },
  getDocksByWarehouseId: async (warehouseId: string) => {
    const res = await axiosInstance.get(`/api/dock/warehouse/${warehouseId}`);
    return res.data;
  },

  getDockDetail: async (id: string) => {
    const res = await axiosInstance.get(`/api/dock/detail/${id}`);
    return res.data;
  },
  getAllDocks: async (filter: DockFilter) => {
    const params = new URLSearchParams();
    Object.keys((f) => filter[f] && params.append(f, filter[f]));
    const res = await axiosInstance.get("/api/dock", { params });
    return res.data;
  },
  updateDock: async (id: string, data: IDock) => {
    const res = await axiosInstance.patch(`/api/dock/${id}`, data);
    return res.data;
  },
  deleteDock: async (id: string) => {
    const res = await axiosInstance.delete(`/api/dock/${id}`);
    return res.data;
  },
};
