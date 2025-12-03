import axiosInstance from "@/lib/axios";

export const BookingApi = {
  createBooking: async () => {
    const res = await axiosInstance.post("/api/booking");
    return res.data;
  },
  getAllBookings: async () => {
    const res = await axiosInstance.get("/api/booking");
    return res.data;
  },
  getDetail: async () => {
    const res = await axiosInstance.get("/api/booking");
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
  cancelBooking: async (id: string) => {
    const res = await axiosInstance.delete(`/api/booking/cancel/${id}`);
    return res.data;
  },
  deleteBooking: async (id: string) => {
    const res = await axiosInstance.delete(`/api/booking/${id}`);
    return res.data;
  },
};
