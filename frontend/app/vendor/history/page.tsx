"use client";

import { Truck, Search, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Booking, BookingFilter } from "@/types/booking.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookingApi } from "@/api/booking.api";
import DetailBookingModal from "@/components/shared-common/DetailBookingModal";
import ConfirmationWithInput from "@/components/shared-common/ConfirmationWithInput";
import { useUserInfo } from "@/components/UserContext";
import BookingListCard from "@/components/shared-common/BookingListCard";
import { BookingStatus } from "@/types/shared.type";

export default function HistoryPage() {
  const [selectedBookingId, setSelectedBookingId] = useState<string>(null);

  const { userInfo } = useUserInfo();

  //pagination
  const [filter, setFilter] = useState<BookingFilter>({
    searchKey: "",
    page: 1,
    status: "all",
  });

  //cancel states
  const [canceledReason, setCanceledReason] = useState<string>("");

  const { data: bookings } = useQuery({
    queryKey: ["bookings", filter],
    queryFn: async () => await BookingApi.getAllBookingsList(filter),
    enabled: !!userInfo,
  });

  const qq = useQueryClient();
  const { mutateAsync: handleCancel } = useMutation({
    mutationKey: ["bookings"],
    mutationFn: async () => {
      if (!selectedBookingId || !canceledReason) {
        toast.error("Mohon isi alasan pembatalan");
        throw new Error("Mohon isi alasan pembatalan");
      }
      await BookingApi.cancelBooking(selectedBookingId, canceledReason);
    },
    onSuccess: async () => {
      qq.invalidateQueries({
        queryKey: ["bookings"],
      });
      setCanceledReason("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">Riwayat Pemesanan</h1>
            <p className="text-gray-600">Lihat semua pemesanan Anda</p>
            <div className="border-b border-gray-200">
              <div className="flex space-x-1">
                <button
                  key={"all"}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 relative ${
                    filter.status === "all"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setFilter({ ...filter, status: "all" })}
                >
                  Semua
                  {filter.status === "all" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                  )}
                </button>
                {Object.keys(BookingStatus).map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 relative ${
                      filter.status === status
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setFilter({ ...filter, status: status as any })
                    }
                  >
                    {status}
                    {filter.status === status && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="relative">
            <input
              type="text"
              placeholder="Cari supir/kode/brand mobil.."
              className="input md:w-[400px] border px-2 rounded-md"
              value={filter?.searchKey}
              onChange={(e) =>
                setFilter({ ...filter, searchKey: e.target.value })
              }
            />
            <div className="absolute top-0 right-0 w-10 h-full flex items-center justify-center">
              <Search />
            </div>
          </label>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-auto">
          {bookings?.length === 0 ? (
            <div className="card bg-white shadow">
              <div className="card-body text-center py-12">
                <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Belum ada pemesanan</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 flex flex-col ">
              {bookings?.map((booking: Booking) => (
                <BookingListCard
                  booking={booking}
                  selectedBookingId={selectedBookingId}
                  setSelectedBookingId={setSelectedBookingId}
                  key={booking.id}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center p-3 justify-between space-x-2">
          <button
            onClick={() => {
              if (filter.page > 1) {
                setFilter((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }));
              }
            }}
            className="btn btn-primary w-40"
          >
            <ArrowLeft size={16} className="mr-1" /> Previous page
          </button>
          <span className="text-lg font-bold  border px-5 py-2 bg-primary text-white rounded-md">
            {filter.page}
          </span>
          <button
            onClick={() => {
              setFilter((prev) => ({
                ...prev,
                page: prev.page + 1,
              }));
            }}
            className="btn btn-primary w-40"
          >
            Next page
            <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

      <ConfirmationWithInput
        modalId="cancel-confirmation"
        message="Konfirmasi Pembatalan. tuliskan suatu alasan"
        onConfirm={handleCancel}
        title={"Apakaha kamu yakin akan membatalkan Booking ini? "}
        input={canceledReason}
        setInput={setCanceledReason}
        key={"cancel-confirmation"}
      />
      <DetailBookingModal id={selectedBookingId} key={"DetailBookingModal"} />
    </div>
  );
}
