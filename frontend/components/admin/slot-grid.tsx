"use client"

import { useState } from "react"
import { Phone, CheckCircle, Clock, Zap, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const mockSlots = [
  {
    id: "s-1",
    name: "Dock A",
    type: "dock",
    status: "occupied" as const,
    currentBooking: { vendor: "PT ABC", plate: "B1234CD", eta: "09:30", timeRemaining: "15 min" },
    nextBooking: "PT XYZ - 10:00",
  },
  {
    id: "s-2",
    name: "Dock B",
    type: "dock",
    status: "available" as const,
  },
  {
    id: "s-3",
    name: "Gate 1",
    type: "gate",
    status: "booked" as const,
    currentBooking: { vendor: "PT DEF", eta: "10:15" },
  },
  {
    id: "s-4",
    name: "Gate 2",
    type: "gate",
    status: "available" as const,
  },
]

const statusConfig = {
  available: {
    bg: "bg-green-50",
    border: "border-green-300",
    label: "Available",
    icon: CheckCircle,
    color: "text-green-600",
  },
  booked: { bg: "bg-blue-50", border: "border-blue-300", label: "Booked", icon: Clock, color: "text-blue-600" },
  occupied: { bg: "bg-orange-50", border: "border-orange-300", label: "Occupied", icon: Zap, color: "text-orange-600" },
  busy: { bg: "bg-red-50", border: "border-red-300", label: "Busy", icon: AlertTriangle, color: "text-red-600" },
}

export default function SlotGrid() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const handleAction = (action: string, slotName: string) => {
    toast.success(`${action} on ${slotName}`)
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Live Slots Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockSlots.map((slot) => {
          const config = statusConfig[slot.status]
          const Icon = config.icon

          return (
            <div
              key={slot.id}
              onClick={() => setSelectedSlot(slot.id)}
              className={`card cursor-pointer transition-all border-2 ${config.bg} ${config.border} ${selectedSlot === slot.id ? "ring-2 ring-primary" : ""}`}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{slot.name}</h3>
                  <div className={`badge badge-lg ${config.color.replace("text-", "badge-")}`}>{config.label}</div>
                </div>

                {slot.currentBooking && (
                  <div className="bg-white bg-opacity-60 p-2 rounded text-sm mb-2">
                    <p className="font-semibold">{slot.currentBooking.vendor}</p>
                    {slot.currentBooking.plate && <p className="text-gray-600">{slot.currentBooking.plate}</p>}
                    <div className="flex justify-between mt-1 text-xs">
                      <span>ETA: {slot.currentBooking.eta}</span>
                      {slot.currentBooking.timeRemaining && (
                        <span className="font-bold text-orange-600">{slot.currentBooking.timeRemaining}</span>
                      )}
                    </div>
                  </div>
                )}

                {slot.nextBooking && <p className="text-xs text-gray-600 mb-3">Next: {slot.nextBooking}</p>}

                {slot.status === "occupied" && (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-outline btn-ghost flex-1"
                      onClick={() => handleAction("Called", slot.name)}
                    >
                      <Phone size={16} /> Call
                    </button>
                    <button
                      className="btn btn-sm btn-error btn-ghost flex-1"
                      onClick={() => handleAction("Marked complete", slot.name)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
