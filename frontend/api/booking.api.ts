import axiosInstance from "@/lib/axios";
import { Booking, BookingFilter } from "@/types/booking.type";

export const BookingApi = {
  createBooking: async (formData: Booking) => {
    const res = await axiosInstance.post("/api/booking", formData);
    return res.data;
  },
  getAllBookings: async (filter: BookingFilter) => {
    const params = new URLSearchParams();
    if (filter?.searchKey) params.set("searchKey", filter.searchKey);
    if (filter.warehouseId) params.set("warehouseId", filter.warehouseId);
    const res = await axiosInstance.get("/api/booking", { params });
    return res.data;
  },
  getDetailById: async (id: string): Promise<Booking> => {
    const res = await axiosInstance.get(`/api/booking/detail/${id}`);
    return res.data;
  },
  unload: async (id: string) => {
    const res = await axiosInstance.patch(`api/booking/unload/${id}`);
    return res.data;
  },
  finish: async (id: string) => {
    const res = await axiosInstance.patch(`/api/booking/finish/${id}`);
    return res.data;
  },
  getUpcomingBookings: async () => {
    const res = await axiosInstance.get("/api/booking/upcoming");
    return res.data;
  },
  cancelBooking: async (id: string, canceledReason: string) => {
    const res = await axiosInstance.delete(`/api/booking/cancel/${id}`, {
      data: { canceledReason },
    });
    return res.data;
  },
};
