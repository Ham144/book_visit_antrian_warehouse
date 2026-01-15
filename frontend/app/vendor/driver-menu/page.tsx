"use client";
import { BookingApi } from "@/api/booking.api";
import BookingListCard from "@/components/shared-common/BookingListCard";
import DetailBookingModal from "@/components/shared-common/DetailBookingModal";
import { useUserInfo } from "@/components/UserContext";
import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, format, isToday, subDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  CheckCircle,
  Clock,
  MapPin,
  Truck,
  User,
  AlertCircle,
  ArrowLeft,
  Calendar,
  ArrowRight,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
const DriverMenu = () => {
  const { userInfo } = useUserInfo();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPastBooking, setSelectedPastBooking] =
    useState<Booking | null>(null);

  // Cari booking yang sedang OTW
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", "driver", selectedDate],
    queryFn: () =>
      BookingApi.getAllBookingsList({
        date: selectedDate,
        page: 1,
        vendorName: userInfo?.vendorName,
      }),
    enabled: !!userInfo,
  });

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const onTheWayBooking = bookings?.find(
    (booking) =>
      booking.status === BookingStatus.IN_PROGRESS &&
      booking.driverUsername === userInfo?.username &&
      new Date(booking.arrivalTime) >= startOfDay &&
      new Date(booking.arrivalTime) <= endOfDay
  );

  // Query detail booking
  const { data: bookingDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["booking-detail", onTheWayBooking?.id],
    queryFn: () => BookingApi.getDetailById(onTheWayBooking?.id),
    enabled: !!onTheWayBooking,
  });

  const qq = useQueryClient();
  // Mutation untuk konfirmasi datang
  const { mutateAsync: confirmArrival, isPending: isConfirming } = useMutation({
    mutationFn: async () =>
      await BookingApi.updateBookingStatus({
        id: bookingDetail?.id,
        status: BookingStatus.IN_PROGRESS,
        actualArrivalTime: bookingDetail?.actualArrivalTime ? null : new Date(),
        actualFinishTime: null,
      }),
    onSuccess: () => {
      qq.invalidateQueries({
        queryKey: ["booking-detail", onTheWayBooking?.id],
      });
      setShowConfirmation(false);
    },
  });

  // Format waktu
  const formatTime = (date: Date) =>
    format(new Date(date), "HH:mm", { locale: id });

  const hasArrived = !!bookingDetail?.actualArrivalTime;

  if (isLoading || loadingDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  const BookingCard = () => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Status Banner */}
      <div
        className={`px-6 py-3 ${hasArrived ? "bg-green-500" : "bg-orange-500"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">
              {hasArrived ? "TELAH TIBA DI LOKASI" : "MENUJU LOKASI"}
            </span>
          </div>
          <div className="text-white font-bold text-lg">
            {bookingDetail.code}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <VehicleInfo booking={bookingDetail} />
        <ArrivalStatus
          booking={bookingDetail}
          hasArrived={hasArrived}
          formatTime={formatTime}
        />

        <button
          onClick={() => !hasArrived && setShowConfirmation(true)}
          disabled={hasArrived || isConfirming}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            hasArrived
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
          }`}
        >
          {isConfirming ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Memproses...</span>
            </div>
          ) : hasArrived ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>TELAH TIBA</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>KONFIRMASI KEDATANGAN</span>
            </div>
          )}
        </button>

        {bookingDetail.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Catatan: </span>
              {bookingDetail.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Tidak Ada Jadwal Aktif
      </h3>
      <p className="text-gray-600 text-sm">
        Saat ini tidak ada jadwal pengiriman yang aktif untuk Anda.
      </p>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          Harap menunggu jadwal pengiriman selanjutnya.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Driver Portal</h1>
        </div>

        {onTheWayBooking && bookingDetail ? <BookingCard /> : <EmptyState />}

        {onTheWayBooking && (
          <>
            <DriverInfo userInfo={userInfo} />
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Pastikan Anda telah tiba di lokasi sebelum mengkonfirmasi
                kedatangan
              </p>
            </div>
          </>
        )}
      </div>

      {/* list triger and pagination */}
      <div className="flex items-center justify-between gap-2 mb-6 px-3 max-w-lg mx-auto">
        {/* Tombol Kiri */}
        <button
          onClick={() =>
            setSelectedDate((prev) => {
              const newDate = new Date(prev);
              newDate.setDate(newDate.getDate() - 1);
              return newDate.toISOString().split("T")[0];
            })
          }
          className="btn btn-primary"
          aria-label="Tanggal sebelumnya"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Tanggal & Picker */}
        <button
          onClick={() => {
            const modal = document.getElementById(
              "booking-list-modal"
            ) as HTMLDialogElement;
            modal?.showModal();
          }}
          className="flex-1 p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-800  sm:text-xs">
                {format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Klik untuk melihat daftar booking
              </p>
            </div>
          </div>
        </button>

        {/* Tombol Kanan */}
        <button
          onClick={() =>
            setSelectedDate((prev) => {
              const newDate = new Date(prev);
              newDate.setDate(newDate.getDate() + 1);
              return newDate.toISOString().split("T")[0];
            })
          }
          className="btn btn-primary"
          aria-label="Tanggal berikutnya"
          disabled={isToday(selectedDate)} // Disable jika sudah tanggal hari ini
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      <DetailBookingModal
        id="detail-booking-modal"
        key={"detail-booking-modal"}
      />
      {showConfirmation && bookingDetail && (
        <ConfirmationModal
          bookingDetail={bookingDetail}
          formatTime={formatTime}
          isConfirming={isConfirming}
          onConfirm={confirmArrival}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
      <dialog id="booking-list-modal" className="modal w-screen">
        <div className="modal-box max-h-[80vh] overflow-y-auto mx-auto justify-center relative">
          {/* header */}
          <div className="flex items-center justify-between px-2 mb-4 sticky z-10 top-1 translate-y-[-40px] bg-white p-2">
            <h3 className="font-bold text-lg">
              {new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(selectedDate))}
            </h3>
            <div className="modal-action">
              <button
                className="btn bg-red-200"
                onClick={() => {
                  setSelectedPastBooking(null);
                  (
                    document.getElementById(
                      "booking-list-modal"
                    ) as HTMLDialogElement
                  )?.close();
                }}
              >
                X
              </button>
            </div>
          </div>
          {bookings?.length &&
            bookings.map((booking: Booking) => (
              <div key={booking.id}>
                <BookingListCard
                  booking={booking}
                  setSelectedBookingId={setSelectedPastBooking}
                  selectedBookingId={selectedPastBooking?.id}
                  key={booking.id}
                />
              </div>
            ))}
        </div>
      </dialog>
    </div>
  );
};

// Komponen-komponen kecil
const VehicleInfo = ({ booking }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <Truck className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800">
          {booking.Vehicle?.brand} - {booking.Vehicle?.vehicleType}
        </h3>
        <p className="text-sm text-gray-600">
          Durasi bongkar: {booking.Vehicle?.durasiBongkar} menit
        </p>
      </div>
    </div>
  </div>
);

const ArrivalStatus = ({ booking, hasArrived, formatTime }) => (
  <div
    className={`mb-6 p-4 border rounded-lg ${
      hasArrived
        ? "bg-green-50 border-green-200"
        : "bg-orange-50 border-orange-200"
    }`}
  >
    <div className="flex items-center gap-3">
      {hasArrived ? (
        <>
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">Telah Tiba</p>
            <p className="text-sm text-green-700">
              Dikonfirmasi pada {formatTime(booking.actualArrivalTime)} WIB
            </p>
          </div>
        </>
      ) : (
        <>
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <div>
            <p className="font-semibold text-orange-800">Menuju Lokasi</p>
            <p className="text-sm text-orange-700">
              Konfirmasi kedatangan Anda saat tiba di gudang
            </p>
          </div>
        </>
      )}
    </div>
  </div>
);

const DriverInfo = ({ userInfo }) => (
  <div className="mt-6 bg-white rounded-xl shadow p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-800">Informasi Driver</h3>
      <User className="w-5 h-5 text-gray-400" />
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Username:</span>
        <span className="font-medium">{userInfo?.username}</span>
      </div>
    </div>
  </div>
);

const ConfirmationModal = ({
  bookingDetail,
  formatTime,
  isConfirming,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center">
    <div className="bg-white rounded-2xl max-w-sm w-full p-6">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">
          Konfirmasi Kedatangan
        </h3>
        <p className="text-gray-600 mt-2">
          Apakah Anda sudah tiba di {bookingDetail.Dock?.name}?
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">
            Booking: {bookingDetail.code}
          </p>
          <p className="text-sm text-blue-700">
            Waktu: {formatTime(new Date())} WIB
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={isConfirming}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-colors disabled:opacity-50"
          >
            {isConfirming ? "Memproses..." : "Ya, Saya Sudah Tiba"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DriverMenu;
