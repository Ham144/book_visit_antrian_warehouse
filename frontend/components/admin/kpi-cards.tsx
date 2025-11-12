import { CheckCircle, Clock, AlertCircle } from "lucide-react"

const mockKPIs = [
  { label: "Total Bookings Today", value: "24", icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "On-Time Rate", value: "92%", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  { label: "Avg Unload Time", value: "45 min", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Delays", value: "2", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
]

import { Truck } from "lucide-react"

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockKPIs.map((kpi, i) => {
        const Icon = kpi.icon
        return (
          <div key={i} className="card bg-white shadow">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">{kpi.label}</p>
                  <p className="text-3xl font-bold mt-2">{kpi.value}</p>
                </div>
                <div className={`${kpi.bg} p-3 rounded-lg`}>
                  <Icon className={`${kpi.color}`} size={24} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
