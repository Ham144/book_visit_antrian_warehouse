"use client";

import { useState } from "react";
import {
  CheckCircle2,
  QrCode,
  Phone,
  MapPin,
  Clock,
  Truck,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockWarehouses,
  mockVehicleTypes,
  mockUserVehicles,
} from "@/lib/mock-data";

interface BookingConfirmationProps {
  bookingId: string;
  warehouseId: string;
  vehicleId: string;
  date: string;
  time: string;
  notes: string;
  onClose: () => void;
}

export default function BookingConfirmation({
  bookingId,
  warehouseId,
  vehicleId,
  date,
  time,
  notes,
  onClose,
}: BookingConfirmationProps) {
  const [showQR, setShowQR] = useState(true);

  const warehouse = mockWarehouses.find((w) => w.id === warehouseId);
  const vehicle = mockUserVehicles.find((v) => v.id === vehicleId);
  const vehicleType = vehicle
    ? mockVehicleTypes.find((vt) => vt.id === vehicle.vehicleTypeId)
    : null;

  // Calculate end time
  const [hours, minutes] = time.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(
    startDate.getTime() + (vehicleType?.defaultUnloadMinutes || 30) * 60000
  );

  const handleDownload = () => {
    toast.success("File pemesanan sedang diunduh...");
  };

  const handleShare = () => {
    toast.success("Link pemesanan telah disalin ke clipboard");
  };

  const handleContactOps = () => {
    toast.info("Menghubungi tim operasi...");
    // In real app, this would open messaging or call interface
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Pemesanan Berhasil!</h2>
        <p className="text-gray-600">
          Nomor pemesanan Anda:{" "}
          <span className="font-bold text-lg">{bookingId}</span>
        </p>
      </div>

      {/* QR Code Section */}
      {showQR && (
        <div className="card bg-white shadow-lg">
          <div className="card-body p-6 text-center">
            <h3 className="font-bold text-lg mb-4">Kode QR Check-In</h3>
            <div className="bg-gray-100 p-8 rounded-lg mb-4 flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center">
                  <div className="text-center">
                    <QrCode size={64} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-xs text-gray-600">
                      [QR Code: {bookingId}]
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Tunjukkan kode QR ini saat tiba di gudang
            </p>
            <button
              onClick={() => setShowQR(false)}
              className="btn btn-outline btn-sm"
            >
              Tutup QR
            </button>
          </div>
        </div>
      )}

      {/* Booking Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Warehouse Info */}
        <div className="card bg-white shadow">
          <div className="card-body">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Lokasi Gudang
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Gudang</p>
                <p className="font-semibold">{warehouse?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Alamat</p>
                <p className="text-sm">{warehouse?.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Jam Operasional</p>
                <p className="text-sm font-semibold">
                  {warehouse?.openHours.start} - {warehouse?.openHours.end}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Info */}
        <div className="card bg-white shadow">
          <div className="card-body">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-green-600" />
              Jadwal Kunjungan
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Tanggal</p>
                <p className="font-semibold">
                  {new Date(date).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Jam Masuk</p>
                <p className="text-sm font-semibold">{time}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Durasi & Jam Keluar</p>
                <p className="text-sm font-semibold">
                  {vehicleType?.defaultUnloadMinutes} menit (~
                  {endDate.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  )
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="card bg-white shadow">
        <div className="card-body">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Truck size={20} className="text-orange-600" />
            Informasi Kendaraan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Merek</p>
              <p className="font-semibold text-sm">{vehicle?.brand}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Plat Nomor</p>
              <p className="font-semibold text-sm">{vehicle?.licensePlate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Jenis Kendaraan</p>
              <p className="font-semibold text-sm">{vehicleType?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Deskripsi</p>
              <p className="font-semibold text-sm">
                {vehicle?.description || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="card bg-blue-50 shadow">
          <div className="card-body">
            <h3 className="font-bold mb-2">Catatan Anda</h3>
            <p className="text-sm text-gray-700">{notes}</p>
          </div>
        </div>
      )}

      {/* Important Info */}
      <div className="alert alert-info">
        <div>
          <p className="text-sm mb-2 font-medium">Informasi Penting:</p>
          <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
            <li>
              Harap tiba 5-10 menit lebih awal sebelum jadwal yang ditentukan
            </li>
            <li>Tunjukkan kode QR ini saat check-in di gudang</li>
            <li>Jika ada perubahan, hubungi tim operasi sesegera mungkin</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={handleDownload} className="btn btn-outline gap-2">
          <Download size={18} />
          Unduh Tiket
        </button>
        <button onClick={handleShare} className="btn btn-outline gap-2">
          <Share2 size={18} />
          Bagikan
        </button>
        <button
          onClick={handleContactOps}
          className="btn btn-outline btn-primary gap-2"
        >
          <Phone size={18} />
          Hubungi Ops
        </button>
      </div>

      {/* Close Button */}
      <button onClick={onClose} className="btn btn-primary w-full">
        Selesai
      </button>
    </div>
  );
}
