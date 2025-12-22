import { useQuery } from "@tanstack/react-query";
import { BookingApi } from "@/api/booking.api";
import {
  Calendar,
  Clock,
  Warehouse,
  Anchor,
  Car,
  User,
  CheckCircle,
  XCircle,
  Star,
  FileText,
  Hash,
  BarChart3,
  Timer,
  Thermometer,
  AlertTriangle,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const DetailBookingModal = ({ id }: { id: string }) => {
  const { data: booking, isLoading: isLoadingBooking } = useQuery({
    queryKey: ["bookings", id],
    queryFn: async () => await BookingApi.getDetailById(id),
    enabled: !!id,
  });

  if (isLoadingBooking) {
    return (
      <div className="flex w-full justify-center items-center mx-auto">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  // Status badge styling
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Timer className="w-4 h-4" />,
          label: "Sedang Berjalan",
        };
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="w-4 h-4" />,
          label: "Menunggu",
        };
      case "COMPLETED":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Selesai",
        };
      case "CANCELLED":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className="w-4 h-4" />,
          label: "Dibatalkan",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Info className="w-4 h-4" />,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(booking?.status);

  return (
    <dialog
      id="DetailBookingModal"
      className="modal modal-bottom sm:modal-middle"
    >
      {booking && (
        <div className="modal-box max-w-5xl max-h-[90vh] overflow-hidden p-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Detail Booking
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="font-mono font-bold text-gray-700">
                      {booking?.code}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.color}`}
                  >
                    {statusConfig.icon}
                    <span className="font-medium">{statusConfig.label}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                  {booking?.organizationName}
                </div>
                <form method="dialog">
                  <button className="btn btn-ghost btn-circle">✕</button>
                </form>
              </div>
            </div>
          </div>

          {/* Content dengan scroll */}
          <div
            className="overflow-y-auto p-6"
            style={{ maxHeight: "calc(90vh - 80px)" }}
          >
            {/* Timeline Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Jadwal Booking
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Waktu Kedatangan</p>
                      <p className="text-xl font-bold">
                        {new Date(booking?.arrivalTime).toLocaleString(
                          "id-ID",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Waktu Kedatangan</p>
                      <p className="text-xl font-bold">
                        {new Date(booking?.arrivalTime).toLocaleString(
                          "id-ID",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {booking?.actualFinishTime && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Waktu Selesai Aktual
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(
                            booking.actualFinishTime
                          ).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress Booking</span>
                  <span>{booking?.status}</span>
                </div>
              </div>
            </div>

            {/* Grid Layout untuk Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom 1: Informasi Kendaraan */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Card */}
                  <div className="card bg-white border border-gray-200 shadow-sm">
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Car className="w-5 h-5 text-primary" />
                          Informasi Kendaraan
                        </h5>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Merek</span>
                          <span className="font-medium">
                            {booking?.Vehicle.brand}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tipe</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {booking?.Vehicle?.vehicleType}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tahun</span>
                          <span className="font-medium">
                            {booking.Vehicle.productionYear}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Durasi Bongkar</span>
                          <span className="font-medium">
                            {booking.Vehicle.durasiBongkar} menit
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Requires Dock</span>
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              booking.Vehicle.requiresDock === "NONE"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {booking.Vehicle.requiresDock}
                          </span>
                        </div>
                        {booking.Vehicle.isReefer && (
                          <div className="flex items-center gap-2 text-sm text-cyan-700 bg-cyan-50 p-2 rounded">
                            <Thermometer className="w-4 h-4" />
                            <span>Kendaraan Reefer (Pendingin)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warehouse Card */}
                  <div className="card bg-white border border-gray-200 shadow-sm">
                    <div className="card-body">
                      <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Warehouse className="w-5 h-5 text-primary" />
                        Informasi Gudang
                      </h5>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Nama</span>
                          <span className="font-medium">
                            {booking.Warehouse.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Lokasi</span>
                          <span className="font-medium">
                            {booking.Warehouse.location}
                          </span>
                        </div>
                        {booking.Warehouse.description && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              {booking.Warehouse.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dock Card */}
                  <div className="card bg-white border border-gray-200 shadow-sm">
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Anchor className="w-5 h-5 text-primary" />
                          Informasi Dock
                        </h5>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < booking.Dock.priority
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Nama</span>
                          <span className="font-medium">
                            {booking.Dock.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tipe</span>
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              booking.Dock.dockType === "REEFER"
                                ? "bg-cyan-100 text-cyan-800"
                                : booking.Dock.dockType === "SIDE"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.Dock.dockType}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status</span>
                          <span
                            className={`badge p-2 ${
                              booking.Dock.isActive
                                ? "badge-success"
                                : "badge-error"
                            }`}
                          >
                            {booking.Dock.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>

                        {booking.Dock.allowedTypes &&
                          booking.Dock.allowedTypes.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600 mb-2">
                                Tipe Kendaraan yang Diizinkan:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {booking.Dock.allowedTypes.map((type, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                  >
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Driver Info Card */}
                  <div className="card bg-white border border-gray-200 shadow-sm">
                    <div className="card-body">
                      <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-primary" />
                        Informasi Driver
                      </h5>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Username</span>
                          <span className="font-medium">
                            {booking.driverUsername}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 2: Metadata & Notes */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Booking Metadata */}
                  <div className="card bg-white border border-gray-200 shadow-sm">
                    <div className="card-body">
                      <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Metadata Booking
                      </h5>

                      <div className="space-y-3">
                        <div className="flex flex-col gap-2">
                          <span className="text-gray-600">ID Booking</span>
                          <span className="font-mono text-sm">
                            {booking.id}
                          </span>
                          <span className="text-gray-600">Dibuat</span>
                          <span className="text-sm">
                            {format(
                              new Date(booking.createdAt || new Date()),
                              "dd/MM/yy HH:mm"
                            )}
                          </span>
                          <span className="text-gray-600">Organisasi</span>
                          <span className="font-medium">
                            {booking.organizationName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="card bg-white border border-gray-200 shadow-sm">
                    <div className="card-body">
                      <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-primary" />
                        Catatan & Informasi
                      </h5>

                      <div className="space-y-4">
                        {booking.notes ? (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700">{booking.notes}</p>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <p>Tidak ada catatan</p>
                          </div>
                        )}

                        {booking.canceledReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-red-800">
                              <AlertTriangle className="w-5 h-5" />
                              <span className="font-semibold">
                                Alasan Pembatalan
                              </span>
                            </div>
                            <p className="text-red-700">
                              {booking.canceledReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal backdrop close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default DetailBookingModal;
