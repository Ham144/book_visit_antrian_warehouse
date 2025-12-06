"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  ChevronRight,
  AlertCircle,
  WarehouseIcon,
  MapPin,
  Truck,
  ArrowLeft,
  Calendar,
  Ruler,
  Star,
  Activity,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WarehouseApi } from "@/api/warehouse.api";
import { VehicleApi } from "@/api/vehicle.api";
import { DockApi } from "@/api/dock.api";
import { Booking } from "@/types/booking.type";
import { useUserInfo } from "@/components/UserContext";
import { Warehouse } from "@/types/warehouse";
import { IVehicle } from "@/types/vehicle";
import { IDock } from "@/types/dock.type";
import { useRouter, useSearchParams } from "next/navigation";
import PreviewSlotDisplay from "@/components/vendor/PreviewSlotDisplay";
import { BookingApi } from "@/api/booking.api";

type BookingStep = "warehouse" | "vehicle" | "dock" | "detail";

export default function BookingPage() {
  const { userInfo } = useUserInfo();
  const [bookingStep, setBookingStep] = useState<BookingStep>("warehouse");
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const router = useRouter();

  const initialBookingState = {
    vehicleId: "",
    warehouseId: "",
    dockId: "",
    arrivalTime: null,
    estimatedFinishTime: null,
    driverId: userInfo?.id || "",
    notes: "",
  };

  //url state query
  const params = useSearchParams();
  const vehicleIdParam = params.get("vehicleId");
  const warehouseIdParam = params.get("warehouseId");
  const dockIdParam = params.get("dockId");
  const arrivalTimeParam = params.get("arrivalTime");
  const driverIdParam = params.get("driverId");
  const notesParam = params.get("notes");

  const [formData, setFormData] = useState<Booking>(initialBookingState);

  const { data: warehouses = [], isLoading: loadingWarehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => await WarehouseApi.getWarehouses(),
  });

  const { data: myVehicles = [], isLoading: loadingMyVehicles } = useQuery({
    queryKey: ["my-vehicle"],
    queryFn: async () => await VehicleApi.getMyVehicles(),
    enabled: !!userInfo,
  });

  const { data: allVehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () =>
      await VehicleApi.getVehicles({
        page: 1,
        searchKey: "",
      }),
    enabled: myVehicles.length === 0,
  });

  const { data: activeDocks, isLoading: loadingDocks } = useQuery({
    queryKey: ["docks", formData.warehouseId],
    queryFn: async () => {
      if (!formData.warehouseId) return [];
      return await DockApi.getAllDocks({
        page: 1,
        warehouseId: formData.warehouseId,
      });
    },
  });

  const qq = useQueryClient();

  const { mutateAsync: handleSubmitBooking } = useMutation({
    mutationKey: ["booking"],
    mutationFn: async () => BookingApi.createBooking(formData),
    onSuccess: () => {
      toast.success("Booking created successfully");
      router.push("/vendor/history");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleWarehouseSelect = (warehouse: Warehouse) => {
    setFormData({
      ...formData,
      warehouseId: warehouse.id,
      Warehouse: warehouse,
    });
    setBookingStep("vehicle");
    router.push(`/vendor/booking?warehouseId=${warehouse.id}`);
  };

  const handleVehicleSelect = (vehicle: IVehicle) => {
    if (!vehicle.id) return;
    setFormData({ ...formData, vehicleId: vehicle.id, Vehicle: vehicle });
    setBookingStep("dock");
    let full = window.location.href + `&vehicleId=${vehicle.id}`;
    router.push(full);
  };

  const handleDockSelect = (dock: IDock) => {
    if (!dock.id) return;
    setFormData({ ...formData, dockId: dock.id, Dock: dock });
    setBookingStep("detail");
    let full = window.location.href + `&dockId=${dock.id}`;
    router.push(full);
  };

  const handleBack = () => {
    let full = window.location.href;
    const base = full.split("?")[0];
    const data = full.split("?")[1].split("&");
    if (bookingStep === "vehicle") {
      setBookingStep("warehouse");
      data.splice(data.indexOf("vehicleId"), 1);
      router.push(base + "?" + data.join("&"));
      setFormData({ ...formData, warehouseId: "", Warehouse: null });
    } else if (bookingStep === "dock") {
      setBookingStep("vehicle");
      data.splice(data.indexOf("dockId"), 1);
      router.push(base + "?" + data.join("&"));
      setFormData({ ...formData, vehicleId: "", Vehicle: null });
    } else if (bookingStep === "detail") {
      data.splice(data.indexOf("arrivalTime"), 1);
      data.splice(data.indexOf("notes"), 1);
      router.push(base + "?" + data.join("&"));
      setBookingStep("dock");
      setFormData({ ...formData, arrivalTime: null, notes: "" });
    }
  };

  const getSteps = () => {
    const steps = [
      {
        id: "warehouse",
        label: "Pilih Gudang",
        completed: !!formData.Warehouse,
      },
      {
        id: "vehicle",
        label: "Pilih Kendaraan",
        completed: !!formData.Vehicle,
      },
      { id: "dock", label: "Pilih Dock", completed: !!formData.Dock },
      { id: "detail", label: "Detail", completed: !!formData.arrivalTime },
    ];
    return steps;
  };

  const getCurrentStepIndex = () => {
    return getSteps().findIndex((s) => s.id === bookingStep);
  };

  const handleUpdateFormData = (updates: Partial<Booking>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };
  const displayVehicles = myVehicles.length > 0 ? myVehicles : allVehicles;
  const isLoadingVehicles =
    myVehicles.length > 0 ? loadingMyVehicles : loadingVehicles;

  useEffect(() => {
    if (
      vehicleIdParam ||
      warehouseIdParam ||
      dockIdParam ||
      driverIdParam ||
      notesParam
    ) {
      setFormData({
        ...formData,
        vehicleId: vehicleIdParam || "",
        warehouseId: warehouseIdParam || "",
        dockId: dockIdParam || "",
        driverId: driverIdParam || "",
        notes: notesParam || "",
      });
    }
  }, []);

  useEffect(() => {
    if (!formData.warehouseId) {
      setBookingStep("warehouse");
    } else if (!formData.vehicleId) {
      setBookingStep("vehicle");
    } else if (!formData.dockId) {
      setBookingStep("dock");
    } else if (!formData.arrivalTime) {
      setBookingStep("detail");
    }
  }, [formData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Buat Booking Baru
          </h1>
          <p className="text-gray-600 mt-2">
            Pilih gudang, kendaraan, dock, tanggal, dan waktu untuk booking Anda
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {getSteps().map((step, index) => {
              const currentIndex = getCurrentStepIndex();
              const isActive = step.id === bookingStep;
              const isCompleted = step.completed;
              const isPast = index < currentIndex;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? "border-primary bg-primary text-white"
                          : isCompleted || isPast
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      {isCompleted || isPast ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span className="font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        isActive ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < getSteps().length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${
                        isCompleted || isPast ? "bg-primary" : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        {bookingStep !== "warehouse" && (
          <button onClick={handleBack} className="btn btn-ghost btn-sm mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </button>
        )}

        {/* Step 1: Warehouse Selection */}
        {bookingStep === "warehouse" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold flex items-center mb-2">
                <WarehouseIcon className="w-6 h-6 mr-2 text-primary" />
                Pilih Gudang
              </h2>
              <p className="text-gray-600">
                Pilih gudang tempat Anda ingin melakukan kunjungan
              </p>
            </div>

            {loadingWarehouses ? (
              <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : warehouses.length === 0 ? (
              <div className="card bg-white shadow">
                <div className="card-body text-center py-12">
                  <WarehouseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada gudang tersedia</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((warehouse) => (
                  <div
                    key={warehouse.id}
                    onClick={() => handleWarehouseSelect(warehouse)}
                    className={`card bg-white shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
                      formData.warehouseId === warehouse.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <div className="card-body p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold">{warehouse.name}</h3>
                        {warehouse.isActive ? (
                          <span className="badge badge-success px-3 text-white font-bold">
                            Aktif
                          </span>
                        ) : (
                          <span className="badge badge-error  px-3 text-white font-bold">
                            Tidak Aktif
                          </span>
                        )}
                      </div>

                      {warehouse.location && (
                        <div className="flex gap-3 mb-4">
                          <MapPin
                            size={20}
                            className="text-primary flex-shrink-0 mt-0.5"
                          />
                          <p className="text-sm text-gray-700">
                            {warehouse.location}
                          </p>
                        </div>
                      )}

                      {warehouse.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {warehouse.description}
                        </p>
                      )}

                      {warehouse.docks && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-xs text-gray-600 mb-1">
                            Jumlah Dock
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {Array.isArray(warehouse.docks)
                              ? warehouse.docks.length
                              : 0}{" "}
                            Dock
                          </p>
                        </div>
                      )}

                      {warehouse.organizationName && (
                        <p className="text-xs text-gray-500 mb-4">
                          {warehouse.organizationName}
                        </p>
                      )}

                      <button
                        className={`btn w-full gap-2 hover:text-white ${
                          formData.warehouseId === warehouse.id
                            ? "btn-primary"
                            : "btn-outline btn-primary"
                        }`}
                      >
                        {formData.warehouseId === warehouse.id ? (
                          <>
                            <span>Lanjutkan</span>
                            <ChevronRight size={18} />
                          </>
                        ) : (
                          "Pilih Gudang Ini"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Vehicle Selection */}
        {bookingStep === "vehicle" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold flex items-center mb-2">
                <Truck className="w-6 h-6 mr-2 text-primary" />
                Pilih Kendaraan
              </h2>
              <p className="text-gray-600">
                {myVehicles.length > 0
                  ? "Pilih kendaraan yang telah ditetapkan untuk Anda"
                  : "Pilih kendaraan untuk booking ini"}
              </p>
            </div>

            {isLoadingVehicles ? (
              <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : displayVehicles.length === 0 ? (
              <div className="card bg-white shadow">
                <div className="card-body">
                  <div className="alert alert-warning">
                    <AlertCircle size={18} />
                    <div>
                      <p className="font-medium">
                        Belum ada kendaraan tersedia
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Silakan hubungi administrator untuk menambahkan
                        kendaraan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayVehicles.map((vehicle: IVehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className={`card bg-white shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
                      formData.vehicleId === vehicle.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <div className="card-body p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold">
                            {vehicle.brand || "-"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {vehicle.jenisKendaraan || "-"}
                          </p>
                        </div>
                        {vehicle.isActive ? (
                          <span className="badge badge-success px-3 text-white font-bold">
                            Aktif
                          </span>
                        ) : (
                          <span className="badge badge-error">Tidak Aktif</span>
                        )}
                      </div>

                      <div className="space-y-3 mb-4">
                        {vehicle.productionYear && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              Tahun: {vehicle.productionYear}
                            </span>
                          </div>
                        )}

                        {(vehicle.dimensionLength ||
                          vehicle.dimensionWidth ||
                          vehicle.dimensionHeight) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Ruler className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              Dimensi:{" "}
                              {vehicle.dimensionLength
                                ? `${vehicle.dimensionLength}m`
                                : "-"}{" "}
                              x{" "}
                              {vehicle.dimensionWidth
                                ? `${vehicle.dimensionWidth}m`
                                : "-"}{" "}
                              x{" "}
                              {vehicle.dimensionHeight
                                ? `${vehicle.dimensionHeight}m`
                                : "-"}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            Durasi Bongkar: {vehicle.durasiBongkar} menit
                          </span>
                        </div>

                        {vehicle.maxCapacity && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Kapasitas: </span>
                            {vehicle.maxCapacity}
                          </div>
                        )}

                        {vehicle.isReefer && (
                          <div className="badge badge-info">Reefer</div>
                        )}

                        {vehicle.requiresDock && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">
                              Membutuhkan Dock:{" "}
                            </span>
                            {vehicle.requiresDock}
                          </div>
                        )}

                        {vehicle.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {vehicle.description}
                          </p>
                        )}
                      </div>

                      <button
                        className={`btn w-full gap-2 hover:text-white ${
                          formData.vehicleId === vehicle.id
                            ? "btn-primary"
                            : "btn-outline btn-primary"
                        }`}
                      >
                        {formData.vehicleId === vehicle.id ? (
                          <>
                            <span>Lanjutkan</span>
                            <ChevronRight size={18} />
                          </>
                        ) : (
                          "Pilih Kendaraan Ini"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Dock Selection */}
        {bookingStep === "dock" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold flex items-center mb-2">
                <Activity className="w-6 h-6 mr-2 text-primary" />
                Pilih Dock
              </h2>
              <p className="text-gray-600">
                Pilih dock yang tersedia di {formData.Dock?.name}
              </p>
            </div>

            {loadingDocks ? (
              <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : activeDocks?.length === 0 ? (
              <div className="card bg-white shadow">
                <div className="card-body text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Tidak ada dock aktif tersedia untuk gudang ini
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDocks?.map((dock: IDock) => (
                  <div
                    key={dock.id}
                    onClick={() => handleDockSelect(dock)}
                    className={`card bg-white shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
                      formData.dockId === dock.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <div className="card-body p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold">{dock.name}</h3>
                        {dock.priority && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">
                              {dock.priority}
                            </span>
                          </div>
                        )}
                      </div>

                      {dock.dockType && (
                        <div className="mb-3">
                          <span className="badge badge-info px-3 font-bold text-white">
                            {dock.dockType}
                          </span>
                        </div>
                      )}

                      <div className="space-y-2 mb-4">
                        {(dock.maxLength ||
                          dock.maxWidth ||
                          dock.maxHeight) && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Ruler className="w-4 h-4 text-gray-400" />
                            <span>
                              Max: {dock.maxLength ? `${dock.maxLength}m` : "-"}{" "}
                              x {dock.maxWidth ? `${dock.maxWidth}m` : "-"} x{" "}
                              {dock.maxHeight ? `${dock.maxHeight}m` : "-"}
                            </span>
                          </div>
                        )}

                        {dock.supportedVehicleTypes &&
                          dock.supportedVehicleTypes.length > 0 && (
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">
                                Tipe Kendaraan Didukung:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {dock.supportedVehicleTypes.map((type, idx) => (
                                  <span
                                    key={idx}
                                    className="badge badge-outline badge-sm"
                                  >
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      <button
                        className={`btn w-full gap-2 hover:text-white  ${
                          formData.dockId === dock.id
                            ? "btn-primary"
                            : "btn-outline btn-primary"
                        }`}
                      >
                        {formData.dockId === dock.id ? (
                          <>
                            <span>Lanjutkan</span>
                            <ChevronRight size={18} />
                          </>
                        ) : (
                          "Pilih Dock Ini"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Date Selection */}
        {bookingStep === "detail" && (
          <div className="space-y-6">
            <PreviewSlotDisplay
              formData={formData}
              onUpdateFormData={handleUpdateFormData}
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => handleSubmitBooking()}
          disabled={!formData.arrivalTime}
          className={`btn btn-primary px-4 btn-lg ${
            !formData.arrivalTime ? "btn-disabled" : ""
          }`}
        >
          Buat Booking
        </button>
      </div>
    </div>
  );
}
