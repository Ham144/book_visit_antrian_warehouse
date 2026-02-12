"use client";

import { Truck, Search, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Booking, BookingFilter } from "@/types/booking.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookingApi } from "@/api/booking.api";
import ConfirmationWithInput from "@/components/shared-common/ConfirmationWithInput";
import { useUserInfo } from "@/components/UserContext";
import { BookingStatus } from "@/types/shared.type";
import BookingRow from "@/components/shared-common/BookingRow";
import MyWarehouseActionModal from "@/components/admin/my-warehouse-action-modal";
import PaginationFullTable from "@/components/shared-common/PaginationFullTable";

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

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
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
      <div className="mx-auto p-6 container">
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
                {Object.keys(BookingStatus)
                  .slice(0, -1)
                  .map((status) => (
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
        {/* TABLE Section */}
        <div className="rounded-lg border border-gray-200">
          {bookings?.length > 0 ? (
            <div>
              {/* Header Table (Fixed) */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Booking Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Vehicle & Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Warehouse Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Gate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Body Table (Scrollable) */}
              <div className="overflow-x-auto max-h-[60vh] min-h-[60vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-100">
                    {bookings.map((booking: Booking) => (
                      <BookingRow
                        key={booking?.id}
                        booking={booking}
                        setSelectedBookingId={setSelectedBookingId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-3">📅</div>
              <p className="text-gray-500 font-medium">No bookings available</p>
              <p className="text-gray-400 text-sm mt-1">
                Start by creating a new booking
              </p>
            </div>
          )}
        </div>{" "}
        <PaginationFullTable
          data={bookings}
          filter={filter}
          isLoading={isLoadingBookings}
          setFilter={setFilter}
          key={"my-warehouse-pagination"}
        />
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
      <MyWarehouseActionModal
        key={"action-modal"}
        onModifyAndConfirm={() => toast.error("tidak diizinkan")}
        selectedBooking={bookings?.find((b) => b.id === selectedBookingId)}
      />
    </div>
  );
}
