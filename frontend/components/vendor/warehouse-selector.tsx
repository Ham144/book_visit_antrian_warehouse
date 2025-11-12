"use client";

import { useState } from "react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { mockWarehouses } from "@/lib/mock-data";

interface WarehouseSelectorProps {
  onSelect: (warehouseId: string) => void;
}

export default function WarehouseSelector({
  onSelect,
}: WarehouseSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (warehouseId: string) => {
    setSelectedId(warehouseId);
    setTimeout(() => onSelect(warehouseId), 300);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Pilih Gudang</h2>
        <p className="text-gray-600 text-sm mt-2">
          Pilih gudang tempat Anda ingin melakukan kunjungan
        </p>
      </div>

      {/* Warehouse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockWarehouses.map((warehouse) => (
          <div
            key={warehouse.id}
            onClick={() => handleSelect(warehouse.id)}
            className={`card bg-white shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
              selectedId === warehouse.id
                ? "border-blue-500 bg-blue-50"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <div className="card-body p-6">
              {/* Warehouse Name */}
              <h3 className="text-xl font-bold mb-3">{warehouse.name}</h3>

              {/* Address */}
              <div className="flex gap-3 mb-4">
                <MapPin
                  size={20}
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {warehouse.address}
                  </p>
                </div>
              </div>

              {/* Open Hours */}
              <div className="flex gap-3 mb-4">
                <Clock
                  size={20}
                  className="text-green-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Jam Operasional: {warehouse.openHours.start} -{" "}
                    {warehouse.openHours.end}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Zona: {warehouse.timezone}
                  </p>
                </div>
              </div>

              {/* Available Slots Count */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-600 mb-1">Kapasitas</p>
                <p className="text-lg font-bold text-gray-800">
                  3 Slot Tersedia
                </p>
              </div>

              {/* Select Button */}
              <button
                className={`btn w-full gap-2 ${
                  selectedId === warehouse.id
                    ? "btn-primary"
                    : "btn-outline btn-primary"
                }`}
              >
                {selectedId === warehouse.id ? (
                  <>
                    <span>Lanjutkan Pemesanan</span>
                    <ArrowRight size={18} />
                  </>
                ) : (
                  "Pilih Gudang Ini"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="alert alert-info">
        <div>
          <p className="text-sm">
            <strong>Catatan:</strong> Setiap gudang memiliki jam operasional
            berbeda. Pastikan memilih waktu pemesanan yang sesuai dengan jam
            kerja gudang.
          </p>
        </div>
      </div>
    </div>
  );
}
