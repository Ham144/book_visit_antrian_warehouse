import { DockApi } from "@/api/dock.api";
import { IDock } from "@/types/dock.type";
import {
  QueryObserverResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

interface DockOptionModalProps {
  selectedDockId: string;
  refecthDock: () => Promise<QueryObserverResult<any, Error>>;
}

const DockOptionModal = ({
  selectedDockId,
  refecthDock,
}: DockOptionModalProps) => {
  // Fetch dock details
  const { data: dockData, isLoading } = useQuery({
    queryKey: ["dock", selectedDockId],
    queryFn: () => DockApi.getDockDetail(selectedDockId),
    enabled: !!selectedDockId,
  });

  const [dockOnEdit, setDockOnEdit] = useState<IDock | null>(null);

  // Toggle status mutation
  const { mutateAsync: handleUpdate, isPending: isToggling } = useMutation({
    mutationKey: ["bookings", "dock", selectedDockId],
    mutationFn: async () => {
      if (!dockOnEdit) throw new Error("No dock data available");
      await DockApi.updateDock(selectedDockId, dockOnEdit);
      return;
    },
    onSuccess: () => {
      refecthDock();
      (
        document.getElementById("dock-option-modal") as HTMLDialogElement
      )?.close();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memperbarui dock");
      // Show error message if needed
    },
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (dockData) {
      setDockOnEdit(dockData);
    }
  }, [dockData]);

  const router = useRouter();
  // Handler for adding busy time
  const handleAddBusyTime = () => {
    router.push("/admin/busy-times");
  };

  // Handler for editing opening hours
  const handleEditOpeningHours = () => {
    router.push("/admin/gate");
    // Implement your logic here
  };

  // Handler for closing modal
  const handleClose = () => {
    const modal = document.getElementById(
      "dock-option-modal",
    ) as HTMLDialogElement;
    modal?.close();
  };

  if (!selectedDockId) {
    return null;
  }

  return (
    <dialog
      id="dock-option-modal"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box bg-base-100 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-gray-800">
            {isLoading
              ? "Loading..."
              : `Dock Options - ${dockOnEdit?.name || "Dock Details"}`}
          </h3>
          <button
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Dock Status Card */}
        {dockOnEdit && (
          <div className="bg-base-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      dockOnEdit.isActive ? "bg-success" : "bg-error"
                    }`}
                  />
                  <span className="font-medium">
                    {dockOnEdit.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setDockOnEdit((prev) => ({
                    ...prev,
                    isActive: !prev.isActive,
                  }))
                }
                disabled={isToggling}
                className={`btn btn-sm ${
                  dockOnEdit.isActive ? "btn-error" : "btn-success"
                }`}
              >
                {isToggling ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  `Set to ${dockOnEdit.isActive ? "Inactive" : "Active"}`
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jenis Status</p>

                <div className="font-semibold mb-1">Jenis Kendaraan:</div>
                <div className="flex flex-wrap gap-1 z-20">
                  {dockOnEdit.allowedTypes.map((type) => (
                    <span
                      key={type}
                      className="px-1.5 py-0.5 badge badge-lg text-black rounded z-20"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleAddBusyTime}
            className="btn btn-outline btn-primary w-full justify-start gap-2"
          >
            <Plus className="w-7 h-6" />
            Tambah Waktu Sibuk
          </button>

          <button
            onClick={handleEditOpeningHours}
            className="btn btn-outline btn-secondary w-full justify-start gap-2"
          >
            <Pencil className="w-5 h-6" />
            Edit Waktu Operasional
          </button>
        </div>

        {/* Modal Actions */}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost">Cancel</button>
          </form>
          <button onClick={() => handleUpdate()} className="btn btn-primary">
            Confirm
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
      <Toaster />
    </dialog>
  );
};

export default DockOptionModal;
