"use client"

import { QrCode, Edit, X, Truck } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

const mockBookings = [
  {
    id: "BK-001234",
    date: "2025-11-12",
    time: "09:00",
    warehouse: "Gudang Jakarta Barat",
    slot: "Dock A",
    status: "completed" as const,
    plate: "B1234CD",
    duration: "45 menit",
  },
  {
    id: "BK-005678",
    date: "2025-11-15",
    time: "10:30",
    warehouse: "Gudang Jakarta Barat",
    slot: "Dock B",
    status: "confirmed" as const,
    plate: "B5678EF",
    duration: "60 menit",
  },
  {
    id: "BK-009012",
    date: "2025-11-18",
    time: "14:00",
    warehouse: "Gudang Jakarta Barat",
    slot: "Gate 1",
    status: "pending" as const,
    plate: "B9012GH",
    duration: "30 menit",
  },
]

const statusText = {
  completed: "Selesai",
  confirmed: "Dikonfirmasi",
  pending: "Menunggu",
  cancelled: "Dibatalkan",
}

const statusColors = {
  completed: "badge-success",
  confirmed: "badge-primary",
  pending: "badge-warning",
  cancelled: "badge-error",
}

export default function BookingHistory() {
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)

  const handleCancel = (id: string) => {
    toast.success(`Pemesanan ${id} dibatalkan`)
  }

  const handleEdit = (id: string) => {
    toast.info(`Edit pemesanan ${id}`)
  }

  const handleShowQR = (id: string) => {
    toast.info(`Menampilkan QR untuk ${id}`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pemesanan Saya</h2>

      {mockBookings.length === 0 ? (
        <div className="card bg-white shadow">
          <div className="card-body text-center py-12">
            <Truck size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Belum ada pemesanan</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {mockBookings.map((booking) => (
            <div
              key={booking.id}
              className="card bg-white shadow hover:shadow-lg transition"
              onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold">{booking.id}</span>
                      <span className={`badge ${statusColors[booking.status]}`}>{statusText[booking.status]}</span>
                    </div>
                    <p className="text-sm text-gray-600">{booking.warehouse}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{booking.date}</p>
                    <p className="text-sm text-gray-600">{booking.time}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded mb-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Slot</p>
                      <p className="font-semibold">{booking.slot}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Plat</p>
                      <p className="font-semibold">{booking.plate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Durasi</p>
                      <p className="font-semibold">{booking.duration}</p>
                    </div>
                  </div>
                </div>

                {selectedBooking === booking.id && (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-primary flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShowQR(booking.id)
                      }}
                    >
                      <QrCode size={16} /> Tampilkan QR
                    </button>
                    {booking.status === "pending" && (
                      <>
                        <button
                          className="btn btn-sm btn-outline flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(booking.id)
                          }}
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error btn-outline flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancel(booking.id)
                          }}
                        >
                          <X size={16} /> Batal
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
