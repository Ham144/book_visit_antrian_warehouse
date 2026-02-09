import axiosInstance from "@/lib/axios";
import { IDockBusyTime } from "@/types/busyTime.type";

export const BusyTimeApi = {
  create: async (body: IDockBusyTime) => {
    const res = await axiosInstance.post("/api/busy-time", body);
    return res.data;
  },
  update: async (id: string, body: IDockBusyTime) => {
    const res = await axiosInstance.patch(`/api/busy-time/${id}`, body);
    return res.data;
  },
  getAll: async (dockId: string): Promise<IDockBusyTime[]> => {
    const res = await axiosInstance.get(`/api/busy-time/${dockId}`);
    return res.data;
  },
  remove: async (id: string) => {
    const res = await axiosInstance.delete(`/api/busy-time/${id}`);
    return res.data;
  },
};
