"use client"

import { Download, TrendingUp } from "lucide-react"
import { toast } from "sonner"

const mockReports = [
  { metric: "On-Time Delivery Rate", value: "92%", trend: "+5%", period: "Last 7 days" },
  { metric: "Avg Unload Time", value: "45 min", trend: "-3 min", period: "Last 7 days" },
  { metric: "No-Shows", value: "1", trend: "-2", period: "Last 7 days" },
  { metric: "Total Bookings", value: "168", trend: "+12", period: "Last 7 days" },
]

const slotMetrics = [
  { slot: "Dock A", bookings: 45, avgTime: 47, onTime: 91 },
  { slot: "Dock B", bookings: 42, avgTime: 43, onTime: 94 },
  { slot: "Gate 1", bookings: 38, avgTime: 35, onTime: 89 },
  { slot: "Gate 2", bookings: 43, avgTime: 48, onTime: 93 },
]

export default function ReportsPage() {
  const handleExport = (format: "csv" | "pdf") => {
    toast.success(`Exported as ${format.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-gray-600">Performance metrics for last 7 days</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExport("csv")} className="btn btn-outline">
                  <Download size={20} /> CSV
                </button>
                <button onClick={() => handleExport("pdf")} className="btn btn-outline">
                  <Download size={20} /> PDF
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockReports.map((report, i) => (
                <div key={i} className="card bg-white shadow">
                  <div className="card-body">
                    <p className="text-gray-600 text-sm">{report.metric}</p>
                    <p className="text-3xl font-bold mt-2">{report.value}</p>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <TrendingUp size={16} /> {report.trend}
                      </span>
                      <span className="text-gray-500">{report.period}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slot Performance */}
            <div className="card bg-white shadow">
              <div className="card-body">
                <h2 className="text-xl font-bold mb-4">Slot Performance</h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="border-b">
                        <th>Slot</th>
                        <th>Bookings</th>
                        <th>Avg Unload Time</th>
                        <th>On-Time Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slotMetrics.map((slot, i) => (
                        <tr key={i} className="border-b">
                          <td className="font-semibold">{slot.slot}</td>
                          <td>{slot.bookings}</td>
                          <td>{slot.avgTime} min</td>
                          <td>
                            <span className="badge badge-success">{slot.onTime}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

