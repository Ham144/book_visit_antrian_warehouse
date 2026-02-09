import { BookingApi } from "@/api/booking.api";
import { Booking } from "@/types/booking.type";
import { useQuery } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import React from "react";

interface Props {
  booking: Booking;
}

const MoveTraceList = ({ booking }: Props) => {
  const { data: moveTraceList, refetch: moveTraceListRefetch } = useQuery({
    queryKey: ["move-trace-list", booking?.id],
    queryFn: async () => BookingApi.getMoveTraceList(booking?.id),
    enabled: !!booking?.id,
  });

  return (
    <dialog id="move-trace-modal" className="modal">
      <div className="modal-box max-w-4xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-base-100 p-6 border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl text-gray-800">
                Booking History
              </h3>
              {moveTraceList && moveTraceList.length > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="badge badge-lg badge-primary px-4 py-2">
                    <span className="font-bold">
                      {booking.code} {booking.notes ? `(${booking.notes})` : ""}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {moveTraceList.length} events
                  </div>
                </div>
              )}
            </div>
            <button
              className="btn btn-sm btn-primary hover:bg-gray-100"
              onClick={() => moveTraceListRefetch()}
              title="Refresh"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {moveTraceList && moveTraceList.length > 0 ? (
            <div className="space-y-6">
              {/* Timeline Container */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Timeline Items */}
                {moveTraceList.map((trace, index) => {
                  const date = new Date(trace.createdAt);
                  const isLast = index === moveTraceList.length - 1;

                  return (
                    <div
                      key={trace.id}
                      className="relative flex gap-4 mb-6 last:mb-0"
                    >
                      {/* Timeline Dot */}
                      <div className="relative z-10">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            index === 0
                              ? "bg-primary text-primary-content ring-4 ring-primary/20"
                              : "bg-green-400"
                          }`}
                        >
                          {isLast ? (
                            <CheckCheck color="green" />
                          ) : index === 0 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="font-semibold">{index + 1}</span>
                          )}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900">
                                  {trace.doer}
                                </span>
                                <span className="text-xs text-gray-500">
                                  performed action
                                </span>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-800">
                                {trace.detailMovement}
                              </h4>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-600">
                                {date.toLocaleDateString("id-ID", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </div>
                              <div className="text-xs text-gray-400">
                                {date.toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Status Change */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">
                                From Status
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="font-medium text-gray-700">
                                  {trace.fromStatus}
                                </span>
                              </div>
                              {trace.fromArrivalTime && (
                                <div className="text-xs text-gray-400 mt-1">
                                  move from :{" "}
                                  {new Date(
                                    trace.fromArrivalTime
                                  ).toLocaleString("id-ID")}
                                </div>
                              )}
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="text-xs text-blue-600 mb-1">
                                To Status
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="font-medium text-blue-700">
                                  {trace.toStatus}
                                </span>
                              </div>
                              {trace.toArrivalTime && (
                                <div className="text-xs text-blue-500 mt-1">
                                  move to:{" "}
                                  {new Date(trace.toArrivalTime).toLocaleString(
                                    "id-ID"
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-1 text-gray-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Event #{index + 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No History Found
              </h3>
              <p className="text-gray-400 text-sm">
                There are no movement records for this booking.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-10 bg-base-100 p-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={() =>
                (
                  document.getElementById(
                    "move-trace-modal"
                  ) as HTMLDialogElement
                )?.close()
              }
              className="btn btn-primary"
            >
              Close History
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default MoveTraceList;
