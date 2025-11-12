"use client"

import { X, Download, Calendar } from "lucide-react"
import { toast } from "sonner"

interface BookingQRModalProps {
  isOpen: boolean
  bookingId: string
  onClose: () => void
}

export default function BookingQRModal({ isOpen, bookingId, onClose }: BookingQRModalProps) {
  if (!isOpen) return null

  const handleDownload = () => {
    toast.success("QR code downloaded!")
  }

  const handleAddCalendar = () => {
    toast.success("Added to calendar!")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Booking Confirmed</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
            <div className="w-48 h-48 bg-white border-2 border-gray-300 flex items-center justify-center text-center">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">QR Code</p>
                <p className="text-2xl font-bold text-teal-600">{bookingId}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Booking Reference</p>
            <p className="text-xl font-bold text-blue-600 font-mono">{bookingId}</p>
            <p className="text-xs text-gray-600 mt-2">Show this QR code at warehouse check-in</p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              Booking Date: <span className="font-semibold">11 Nov 2025, 09:00</span>
            </p>
            <p className="text-gray-600">
              Estimated Duration: <span className="font-semibold">1 hour</span>
            </p>
            <p className="text-gray-600">
              Slot: <span className="font-semibold">Dock A</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={handleDownload} className="btn btn-outline flex-1">
              <Download size={16} /> Download
            </button>
            <button onClick={handleAddCalendar} className="btn btn-outline flex-1">
              <Calendar size={16} /> Calendar
            </button>
          </div>

          <button onClick={onClose} className="btn btn-primary w-full">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
