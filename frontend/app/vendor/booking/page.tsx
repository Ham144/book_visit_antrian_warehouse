"use client";

import type React from "react";
import { useState } from "react";
import { Clock, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import BookingQRModal from "@/components/shared-common/booking-qr-modal";
import WarehouseSelector from "@/components/vendor/warehouse-selector";
import {
  mockUserVehicles,
  mockVehicleTypes,
  mockWarehouses,
} from "@/lib/mock-data";

type BookingStep = "warehouse" | "details";

export default function BookingPage() {
  const [step, setStep] = useState<BookingStep>("warehouse");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null
  );
  const [showQR, setShowQR] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    time: "09:00",
    vehicleId: "",
    notes: "",
  });

  const handleWarehouseSelect = (warehouseId: string) => {
    setSelectedWarehouse(warehouseId);
    setStep("details");
  };

  const handleBackToWarehouse = () => {
    setStep("warehouse");
    setSelectedWarehouse(null);
    setFormData({ date: "", time: "09:00", vehicleId: "", notes: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedWarehouse ||
      !formData.date ||
      !formData.time ||
      !formData.vehicleId
    ) {
      toast.error("Silakan isi semua bidang yang diperlukan");
      return;
    }

    const newBookingId = `BK-${Date.now().toString().slice(-6)}`;
    setBookingId(newBookingId);
    setShowQR(true);
    toast.success("Pemesanan berhasil dibuat!");
  };

  const warehouseName = selectedWarehouse
    ? mockWarehouses.find((w) => w.id === selectedWarehouse)?.name
    : "";

  if (step === "warehouse") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <WarehouseSelector onSelect={handleWarehouseSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="card bg-white shadow">
              <div className="card-body">
                {/* Header with Back Button */}
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={handleBackToWarehouse}
                    className="btn btn-sm btn-ghost"
                  >
                    Kembali
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold">Buat Pemesanan</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {warehouseName}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tanggal
                    </label>
                    <select
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="select select-bordered w-full"
                    >
                      <option value="">Pilih Tanggal</option>
                      {availableDates.map((date) => (
                        <option key={date} value={date}>
                          {formatDateIndonesian(date)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Jam
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="select select-bordered w-full"
                    >
                      <option value="">Pilih Jam</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Pilih Kendaraan
                    </label>
                    {mockUserVehicles.length === 0 ? (
                      <div className="alert alert-warning">
                        <AlertCircle size={18} />
                        <div>
                          <p className="text-sm">
                            Belum ada kendaraan terdaftar
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Silakan tambahkan kendaraan di menu Kelola Kendaraan
                            terlebih dahulu
                          </p>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={formData.vehicleId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleId: e.target.value,
                          })
                        }
                        className="select select-bordered w-full"
                      >
                        <option value="">Pilih Kendaraan</option>
                        {mockUserVehicles.map((vehicle) => {
                          const vehicleType = mockVehicleTypes.find(
                            (vt) => vt.id === vehicle.vehicleTypeId
                          );
                          return (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.brand} ({vehicle.licensePlate}) -{" "}
                              {vehicleType?.name}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      placeholder="Tambahkan catatan atau permintaan khusus"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="textarea textarea-bordered w-full"
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      !formData.date || !formData.time || !formData.vehicleId
                    }
                    className="btn btn-primary w-full"
                  >
                    Lanjut ke Konfirmasi
                    <ChevronRight size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Available Slots Info */}
          <div>
            <div className="card bg-white shadow">
              <div className="card-body">
                <h3 className="font-bold text-lg mb-4">Slot Tersedia</h3>
                {!formData.date || !formData.time ? (
                  <div className="text-center py-8">
                    <Clock size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-600">
                      Pilih tanggal dan jam untuk melihat slot
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableSlots.map((slot, i) => (
                      <div
                        key={i}
                        className={`p-3 border-2 rounded-lg transition ${
                          slot.isAvailable
                            ? "border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer"
                            : "border-red-300 bg-red-50 opacity-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock
                                size={16}
                                className={
                                  slot.isAvailable
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              />
                              <span className="font-bold">
                                {slot.startTime}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {slot.slot.name}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Durasi: {slot.vehicleType.defaultUnloadMinutes}{" "}
                              menit
                            </p>
                          </div>
                          {!slot.isAvailable && (
                            <span className="text-xs font-bold text-red-600">
                              Penuh
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <BookingQRModal
          isOpen={showQR}
          bookingId={bookingId}
          onClose={() => setShowQR(false)}
        />
      </div>
    </div>
  );
}
