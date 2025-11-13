"use client";

import { Phone, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const mockQueue = [
  {
    id: "b-1",
    slot: "Dock A",
    vendor: "PT ABC",
    plate: "B1234CD",
    status: "occupied",
    timeRemaining: "15 min",
  },
  {
    id: "b-2",
    slot: "Dock B",
    vendor: "PT XYZ",
    plate: "B5678EF",
    status: "delayed",
    timeRemaining: "+25 min",
  },
  {
    id: "b-3",
    slot: "Gate 1",
    vendor: "PT DEF",
    plate: "B9012GH",
    status: "booked",
    timeRemaining: "45 min",
  },
];

export default function QueuePage() {
  const handleAction = (action: string, vendorName: string) => {
    toast.success(`${action} - ${vendorName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Live Queue Board</h1>
              <p className="text-gray-600">Real-time warehouse activity</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main Queue */}
              <div className="lg:col-span-2 space-y-3">
                {mockQueue.map((item) => {
                  const isDelayed = item.status === "delayed";
                  return (
                    <div
                      key={item.id}
                      className={`card ${
                        isDelayed
                          ? "border-2 border-red-300 bg-red-50"
                          : "bg-white"
                      }`}
                    >
                      <div className="card-body p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-lg">
                                {item.slot}
                              </span>
                              {isDelayed && (
                                <AlertTriangle
                                  className="text-red-600"
                                  size={20}
                                />
                              )}
                            </div>
                            <p className="font-semibold">{item.vendor}</p>
                            <p className="text-sm text-gray-600">
                              {item.plate}
                            </p>
                          </div>
                          <div
                            className={`text-right ${
                              isDelayed ? "text-red-600 font-bold" : ""
                            }`}
                          >
                            <p className="text-2xl font-bold">
                              {item.timeRemaining}
                            </p>
                            <p className="text-sm capitalize text-gray-600">
                              {item.status}
                            </p>
                          </div>
                        </div>

                        {item.status === "occupied" && (
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-primary flex-1"
                              onClick={() =>
                                handleAction("Called", item.vendor)
                              }
                            >
                              <Phone size={16} /> Call
                            </button>
                            <button
                              className="btn btn-sm btn-success flex-1"
                              onClick={() =>
                                handleAction("Completed", item.vendor)
                              }
                            >
                              <CheckCircle size={16} /> Complete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-3">
                <div className="card bg-green-50 border-2 border-green-300">
                  <div className="card-body p-4">
                    <p className="text-sm text-gray-600">On-Time</p>
                    <p className="text-3xl font-bold text-green-600">22</p>
                  </div>
                </div>
                <div className="card bg-orange-50 border-2 border-orange-300">
                  <div className="card-body p-4">
                    <p className="text-sm text-gray-600">Delayed</p>
                    <p className="text-3xl font-bold text-orange-600">2</p>
                  </div>
                </div>
                <div className="card bg-blue-50 border-2 border-blue-300">
                  <div className="card-body p-4">
                    <p className="text-sm text-gray-600">In Queue</p>
                    <p className="text-3xl font-bold text-blue-600">6</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
