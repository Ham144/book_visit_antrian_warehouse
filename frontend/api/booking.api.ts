import axiosInstance from "@/lib/axios";
import { Booking, BookingFilter } from "@/types/booking.type";
import { BookingStatus, DragAndDropPayload } from "@/types/shared.type";

export const BookingApi = {
  createBooking: async (formData: Booking) => {
    const res = await axiosInstance.post("/api/booking", formData);
    return res.data;
  },
  getAllBookingsList: async (filter: BookingFilter) => {
    const params = new URLSearchParams();
    if (filter?.searchKey) params.set("searchKey", filter.searchKey);
    if (filter.warehouseId) params.set("warehouseId", filter.warehouseId);
    if (filter.page) params.set("page", filter.page.toString());
    if (filter.date) params.set("date", filter.date);

    const res = await axiosInstance.get("/api/booking/list", { params });
    return res.data;
  },
  semiDetailList: async (filter: BookingFilter) => {
    const params = new URLSearchParams();
    if (filter.warehouseId) params.set("warehouseId", filter.warehouseId);
    if (filter.date) params.set("date", filter.date);

    const res = await axiosInstance.get("/api/booking/semi-detail-list", {
      params,
    });
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
  justifyBooking: async (id: string, data: Partial<Booking>) => {
    const res = await axiosInstance.put(`/api/booking/justify/${id}`, data);
    return res.data;
  },
  dragAndDrop: async (id: string, data: DragAndDropPayload) => {
    const res = await axiosInstance.put(
      `/api/booking/drag-and-drop/${id}`,
      data
    );
    return res.data;
  },
  updateBookingStatus: async (
    id: string,
    status: BookingStatus,
    actualFinishTime?: Date
  ) => {
    const res = await axiosInstance.patch(`/api/booking/updateStatus/${id}`, {
      status,
      actualFinishTime,
    });
    return res.data;
  },
  getStatsForDriver: async () => {
    const res = await axiosInstance.get("/api/booking/stats/stats-for-driver");
    return res.data;
  },
  getStatsForAdminVendor: async () => {
    const res = await axiosInstance.get(
      "/api/booking/stats/stats-for-admin-vendor"
    );
    return res.data;
  },
  getStatsForUserOrganizations: async () => {
    const res = await axiosInstance.get(
      "/api/booking/stats/stats-for-user-organizations"
    );
    return res.data;
  },
};
