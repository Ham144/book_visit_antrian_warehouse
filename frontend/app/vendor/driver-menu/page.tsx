"use client";
import { BookingApi } from "@/api/booking.api";
import BookingListCard from "@/components/shared-common/BookingListCard";
import DetailBookingModal from "@/components/shared-common/DetailBookingModal";
import { useUserInfo } from "@/components/UserContext";
import { Booking } from "@/types/booking.type";
import { BookingStatus } from "@/types/shared.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday } from "date-fns";
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
  Building2,
  AlertTriangle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const DriverMenu = () => {
  const { userInfo, socket } = useUserInfo();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
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

  const onTheWayBookingMemo = useMemo(
    () =>
      bookings?.find(
        (booking) =>
          booking.driverUsername === userInfo?.username &&
          new Date(booking.arrivalTime) >= startOfDay &&
          new Date(booking.arrivalTime) <= endOfDay,
      ),
    [bookings, startOfDay, endOfDay, userInfo],
  );

  // Query detail booking
  const { data: bookingDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["booking-detail", onTheWayBookingMemo?.id],
    queryFn: () => BookingApi.getDetailById(onTheWayBookingMemo?.id),
    enabled: !!onTheWayBookingMemo,
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
        queryKey: ["booking-detail", onTheWayBookingMemo?.id],
      });
      setShowConfirmation(false);
    },
  });

  // Format waktu
  const formatTime = (date: Date) =>
    format(new Date(date), "HH:mm", { locale: id });

  const hasArrived = !!bookingDetail?.actualArrivalTime;
  const isUnloading = bookingDetail?.status == BookingStatus.UNLOADING;
  const isFinished = bookingDetail?.status == BookingStatus.FINISHED;
  const isCanceled = bookingDetail?.status == BookingStatus.CANCELED;

  const queryClient = useQueryClient();

  //socket
  useEffect(() => {
    if (!socket || !bookingDetail?.warehouseId) return;

    const warehouseId = bookingDetail.warehouseId;

    const handleConnect = () => {
      socket.emit("join_warehouse", {
        warehouseId,
      });
    };

    const handleFindAllRefetch = () => {
      queryClient
        .invalidateQueries({
          queryKey: ["bookings", "driver", selectedDate],
        })
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: ["booking-detail", onTheWayBookingMemo?.id],
          });
        });
    };

    if (socket.connected) {
      socket.emit("join_warehouse", {
        warehouseId,
      });
    }

    socket.on("connect", handleConnect);
    socket.on("find-all", handleFindAllRefetch);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("find-all", handleFindAllRefetch);
      if (socket.connected) {
        socket.emit("leave_warehouse", {
          warehouseId,
        });
      }
    };
  }, [socket, queryClient, bookingDetail?.warehouseId]);

  if (isLoading || loadingDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  const BookingCard = () => {
    // Helper untuk menentukan apakah sudah waktunya menuju gudang
    const isTimeToGo = () => {
      if (!bookingDetail.arrivalTime) return false;
      const arrivalTime = new Date(bookingDetail.arrivalTime);
      const now = new Date();
      const timeDiff = arrivalTime.getTime() - now.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      // Jika kurang dari delay tolerance atau sudah lewat, tampilkan petunjuk
      return (
        minutesDiff <= bookingDetail.Warehouse?.delayTolerance ||
        minutesDiff < 0
      );
    };

    // Helper untuk mendapatkan instruksi berdasarkan status
    const getInstructions = () => {
      if (isCanceled) {
        return {
          title: "Pembongkaran Dibatalkan",
          subtitle: `${bookingDetail.code} telah dibatalkan`,
        };
      }

      if (isFinished) {
        return {
          title: "Telah Selesai",
          subtitle: `anda ${bookingDetail.code} telah menyelesaikan pembongakaran`,
        };
      }

      if (isUnloading) {
        return {
          title: "Sedang Pembongkaran",
          subtitle: `anda ${bookingDetail.code} sedang dalam pembongkaran di ${bookingDetail.Dock.name}`,
        };
      }

      if (hasArrived) {
        return {
          title: "SILAHKAN MASUK KE GUDANG",
          subtitle: `Tunggu instruksi lebih lanjut di ${bookingDetail.Dock?.name || "Gate"}`,
        };
      }

      return {
        title: "Sedang Menuju Gudang",
        subtitle: `Silakan menuju gate ${bookingDetail.Dock.name} ${bookingDetail.Warehouse.name} sekitar sebelum pukul ${formatTime(bookingDetail.arrivalTime)}`,
      };
    };

    const instructions = getInstructions();

    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Status Banner dengan instruksi */}
        <div
          className={`px-6 py-4 ${hasArrived ? "bg-green-500" : isTimeToGo() ? "bg-teal-600" : "bg-gray-500"}`}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Truck className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">
                {instructions.title}
              </span>
            </div>
            <p className="text-white/90 text-sm">{instructions.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Informasi Jadwal */}
          <div className="mb-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Target Tiba</p>
                <p className="text-lg font-bold text-gray-800">
                  {formatTime(new Date(bookingDetail.arrivalTime))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  est. Perkiraan selesai
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatTime(new Date(bookingDetail.estimatedFinishTime))}
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-xs text-gray-500 font-medium">
                  LOKASI BONGKAR MUAT
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <p className="text-lg font-bold text-gray-800">
                    {bookingDetail.Dock?.name || "Belum ditentukan"}
                  </p>
                </div>
              </div>
              <div className="col-span-1 bg-green-300 rounded-lg p-2">
                <p className="text-xs text-gray-500 font-medium">
                  Kode Booking
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Truck className="w-5 h-6 text-teal-600" />
                  <p className="text-lg font-bold text-gray-800">
                    {bookingDetail.code || "Belum ditentukan"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Menambahkan logika untuk DELAYED */}
          {(() => {
            if (
              bookingDetail.status !== "CANCELED" &&
              bookingDetail.status !== "FINISHED"
            ) {
              const now = new Date();
              const arrivalTime = new Date(bookingDetail.arrivalTime);
              const delayTolerance =
                bookingDetail.Warehouse?.delayTolerance || 15; // default 15 menit
              const maxAllowedTime = new Date(
                arrivalTime.getTime() + delayTolerance * 60 * 1000,
              );

              if (
                now > maxAllowedTime &&
                !hasArrived &&
                !bookingDetail.actualArrivalTime
              ) {
                return (
                  <div className="mt-2 p-2 my-2 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        TERLAMBAT: Silakan segera menuju gudang
                      </span>
                    </div>
                  </div>
                );
              }
            }
            return null;
          })()}

          <VehicleInfo booking={bookingDetail} />

          {/* Informasi Gudang */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">
                  {bookingDetail.Warehouse?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {bookingDetail.Warehouse?.location}
                </p>
                {bookingDetail.driver?.vendorName && (
                  <p className="text-sm text-gray-500 mt-1">
                    Vendor: {bookingDetail.driver.vendorName}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Status real-time */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Status:</span>
              <span
                className={`font-semibold ${
                  bookingDetail.status === "IN_PROGRESS"
                    ? "text-teal-600"
                    : bookingDetail.status === "UNLOADING"
                      ? "text-green-600"
                      : bookingDetail.status === "FINISHED"
                        ? "text-gray-600"
                        : bookingDetail.status === "CANCELED"
                          ? "text-red-600"
                          : "text-orange-600"
                }`}
              >
                {bookingDetail.status === "IN_PROGRESS"
                  ? "SEDANG MENUJU"
                  : bookingDetail.status === "UNLOADING"
                    ? "SEDANG BONGKAR MUAT"
                    : bookingDetail.status === "FINISHED"
                      ? "SELESAI"
                      : bookingDetail.status === "CANCELED"
                        ? "DIBATALKAN"
                        : "TERLAMBAT"}
              </span>
            </div>

            {bookingDetail.actualArrivalTime && (
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-500">Tiba:</span>
                <span className="font-medium">
                  {formatTime(new Date(bookingDetail.actualArrivalTime))}
                </span>
              </div>
            )}
            {bookingDetail.status === BookingStatus.CANCELED &&
              bookingDetail.canceledReason && (
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-500">Alasan:</span>
                  <span className="font-medium">
                    {bookingDetail.canceledReason}
                  </span>
                </div>
              )}
            {bookingDetail.actualStartTime && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-500">Mulai Bongkar:</span>
                <span className="font-medium">
                  {formatTime(new Date(bookingDetail.actualStartTime))}
                </span>
              </div>
            )}

            {bookingDetail.actualFinishTime && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-500">Selesai:</span>
                <span className="font-medium">
                  {formatTime(new Date(bookingDetail.actualFinishTime))}
                </span>
              </div>
            )}
          </div>

          {/* Tombol Konfirmasi */}
          <button
            onClick={() => !hasArrived && setShowConfirmation(true)}
            disabled={hasArrived || isConfirming}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-4 ${
              hasArrived
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
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
                <span>TELAH TIBA DI LOKASI</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1">
                <span>KONFIRMASI KEDATANGAN DI GUDANG</span>
                <span className="text-xs font-normal">
                  Tekan tombol saat Anda telah tiba
                </span>
              </div>
            )}
          </button>

          {/* Info tambahan */}
          <div className="text-center text-sm text-gray-500 mb-4">
            {!hasArrived && isTimeToGo() && (
              <p>
                Tekan tombol di atas saat Anda tiba di depan gate{" "}
                {bookingDetail.Dock?.name}
              </p>
            )}
          </div>

          {bookingDetail.notes && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">
                    Catatan admin vendor
                  </p>
                  <p className="text-sm text-yellow-700">
                    {bookingDetail.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-teal-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Tidak Ada Jadwal Aktif
      </h3>
      <p className="text-gray-600 text-sm">
        Saat ini tidak ada jadwal pengiriman yang aktif untuk Anda.
      </p>
      <div className="mt-6 p-4 bg-teal-50 rounded-lg">
        <p className="text-sm text-teal-700">
          Harap menunggu jadwal pengiriman selanjutnya.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white overflow-auto h-96">
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Driver Portal</h1>
        </div>

        {onTheWayBookingMemo && bookingDetail ? (
          <BookingCard />
        ) : (
          <EmptyState />
        )}

        {onTheWayBookingMemo && (
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
              "booking-list-modal",
            ) as HTMLDialogElement;
            modal?.showModal();
          }}
          className="flex-1 p-3 sm:p-4 bg-gray-50 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-teal-20 0 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-teal-600" />
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
                      "booking-list-modal",
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
      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
        <Truck className="w-5 h-5 text-teal-600" />
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
  <div className="fixed inset-0 bg-black/50 flex items-center ">
    <div className="bg-white rounded-2xl max-w-sm w-full p-6 mx-auto justify-center items-center">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-6 h-6 text-teal-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">
          Konfirmasi Kedatangan
        </h3>
        <p className="text-gray-600 mt-2">
          Apakah Anda sudah tiba di {bookingDetail.Dock?.name}?
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-teal-50 rounded-lg">
          <p className="text-sm font-medium text-teal-800">
            Booking: {bookingDetail.code}
          </p>
          <p className="text-sm text-teal-700">
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
            className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-medium hover:from-teal-700 hover:to-teal-800 transition-colors disabled:opacity-50"
          >
            {isConfirming ? "Memproses..." : "Ya, Saya Sudah Tiba"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DriverMenu;
