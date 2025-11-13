"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const mockDocks = [
  {
    id: "d-1",
    name: "Dock A",
    type: "dock",
    maxVehicle: "large",
    status: "active",
  },
  {
    id: "d-2",
    name: "Dock B",
    type: "dock",
    maxVehicle: "medium",
    status: "active",
  },
  {
    id: "d-3",
    name: "Gate 1",
    type: "gate",
    maxVehicle: "large",
    status: "active",
  },
];

export default function DocksPage() {
  const [docks, setDocks] = useState(mockDocks);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "dock",
    maxVehicle: "medium",
  });

  const handleAddDock = () => {
    if (!formData.name) {
      toast.error("Please enter dock name");
      return;
    }
    const newDock = {
      id: `d-${docks.length + 1}`,
      ...formData,
      status: "active",
    };
    setDocks([...docks, newDock]);
    setFormData({ name: "", type: "dock", maxVehicle: "medium" });
    setShowForm(false);
    toast.success("Dock created successfully");
  };

  const handleDelete = (id: string) => {
    setDocks(docks.filter((d) => d.id !== id));
    toast.success("Dock deleted");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Dock Management</h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn btn-primary"
              >
                <Plus size={20} /> New Dock
              </button>
            </div>

            {showForm && (
              <div className="card bg-white shadow">
                <div className="card-body">
                  <h3 className="font-bold text-lg mb-4">Create New Dock</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Dock Name (e.g., Dock A)"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input input-bordered w-full"
                    />
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="select select-bordered w-full"
                    >
                      <option value="dock">Dock</option>
                      <option value="gate">Gate</option>
                    </select>
                    <select
                      value={formData.maxVehicle}
                      onChange={(e) =>
                        setFormData({ ...formData, maxVehicle: e.target.value })
                      }
                      className="select select-bordered w-full"
                    >
                      <option value="small">Small Truck</option>
                      <option value="medium">Medium Truck</option>
                      <option value="large">Large Truck</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddDock}
                        className="btn btn-primary flex-1"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowForm(false)}
                        className="btn btn-outline flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="table w-full bg-white">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th>Doc Name</th>
                    <th>Type</th>
                    <th>Max Vehicle</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docks.map((dock) => (
                    <tr key={dock.id} className="border-b">
                      <td className="font-semibold">{dock.name}</td>
                      <td>
                        <span className="badge">{dock.type}</span>
                      </td>
                      <td>{dock.maxVehicle}</td>
                      <td>
                        <span className="badge badge-success">
                          {dock.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-sm">
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() => handleDelete(dock.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
