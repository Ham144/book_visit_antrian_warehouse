"use client"

import { useState } from "react"
import { Plus, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"

const mockBusyTimes = [
  { id: "bt-1", reason: "Lunch Break", start: "12:00", end: "13:00", recurring: true },
  { id: "bt-2", reason: "Maintenance", start: "2025-11-15 08:00", end: "2025-11-15 10:00", recurring: false },
]

export default function BusyTimeManagement() {
  const [busyTimes, setBusyTimes] = useState(mockBusyTimes)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    reason: "",
    start: "12:00",
    end: "13:00",
    recurring: true,
  })

  const handleAdd = () => {
    if (!formData.reason) {
      toast.error("Please enter a reason")
      return
    }
    const newBusyTime = {
      id: `bt-${busyTimes.length + 1}`,
      ...formData,
    }
    setBusyTimes([...busyTimes, newBusyTime])
    setFormData({ reason: "", start: "12:00", end: "13:00", recurring: true })
    setShowForm(false)
    toast.success("Busy time added")
  }

  const handleDelete = (id: string) => {
    setBusyTimes(busyTimes.filter((bt) => bt.id !== id))
    toast.success("Busy time removed")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Busy Time Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={20} /> Add Busy Time
        </button>
      </div>

      {showForm && (
        <div className="card bg-white shadow">
          <div className="card-body">
            <h3 className="font-bold text-lg mb-4">Add Busy Time</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Reason (e.g., Lunch Break)"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="input input-bordered w-full"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Start</label>
                  <input
                    type="time"
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End</label>
                  <input
                    type="time"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="checkbox"
                />
                <span>Recurring (Daily)</span>
              </label>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="btn btn-primary flex-1">
                  Add
                </button>
                <button onClick={() => setShowForm(false)} className="btn btn-outline flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {busyTimes.map((bt) => (
          <div key={bt.id} className="card bg-white shadow">
            <div className="card-body p-4 flex flex-row justify-between items-center">
              <div className="flex items-center gap-3">
                <Calendar className="text-orange-600" size={24} />
                <div>
                  <p className="font-bold">{bt.reason}</p>
                  <p className="text-sm text-gray-600">
                    {bt.start} - {bt.end} {bt.recurring && "(Daily)"}
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(bt.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
