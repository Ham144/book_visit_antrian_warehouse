"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  ChevronRight,
  AlertCircle,
  WarehouseIcon,
  MapPin,
  ArrowLeft,
  Calendar,
  Star,
  Activity,
  CheckCircle,
  User2,
  Car,
  Building,
  Shield,
  MessageSquare,
  DockIcon,
  Search,
  Dock,
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
import { AuthApi } from "@/api/auth";
import { UserApp } from "@/types/auth";

type BookingStep = "warehouse" | "driver" | "vehicle" | "dock" | "confirmation";

export default function BookingPage() {
  const { userInfo } = useUserInfo();
  const [bookingStep, setBookingStep] = useState<BookingStep>("warehouse");

  //UX states
  const [pageWarehouse, setPageWarehouse] = useState(1);
  const [searchKeyWarehouse, setSearchKeyWarehouse] = useState("");
  const [pageDriver, setPageDriver] = useState(1);
  const [searchKeyDriver, setSearchKeyDriver] = useState("");
  const [pageVehicle, setPageVehicle] = useState(1);
  const [vehicleSearchKey, setVehicleSearchKey] = useState("");
  const [isBookCompleted, setIsBookComplted] = useState(false);

  const router = useRouter();

  const initialBookingState: Booking = {
    vehicleId: "",
    warehouseId: "",
    dockId: "",
    arrivalTime: null,
    estimatedFinishTime: null,
    driverUsername: userInfo?.username,
    notes: "",
  };

  const qq = useQueryClient();

  //url state query
  const [params, setParams] = useState(useSearchParams());
  const vehicleIdParam = params.get("vehicleId");
  const warehouseIdParam = params.get("warehouseId");
  const dockIdParam = params.get("dockId");
  const notesParam = params.get("notes");

  const [formData, setFormData] = useState<Booking>(initialBookingState);

  const { data: warehouses = [], isLoading: loadingWarehouses } = useQuery({
    queryKey: ["warehouses", pageWarehouse, searchKeyWarehouse],
    queryFn: async () =>
      await WarehouseApi.getWarehouses({
        searchKey: searchKeyWarehouse,
        page: pageWarehouse,
      }),
  });

  const { data: vendorVehicles = [], isLoading: isLoadingvendorVehicles } =
    useQuery({
      queryKey: ["my-vehicle", pageVehicle, vehicleSearchKey],
      queryFn: async () =>
        await VehicleApi.getVendorVehicles({
          page: pageVehicle,
          searchKey: vehicleSearchKey,
        }),
    });

  const { data: myDrivers, isLoading: isLoadingMyDrivers } = useQuery({
    queryKey: ["my-drivers", pageDriver, searchKeyDriver],
    queryFn: async () =>
      await AuthApi.getAllMyDrivers({
        page: pageDriver,
        searchKey: searchKeyDriver,
      }),
  });

  const { data: activeDocks, isLoading: loadingDocks } = useQuery({
    queryKey: ["docks", formData.warehouseId],
    queryFn: async () => {
      if (!formData.warehouseId) return [];
      return await DockApi.getDocksByWarehouseId(formData.warehouseId);
    },
  });

  const {
    mutateAsync: handleSubmitBooking,
    isPending: isPendingSubmitBooking,
  } = useMutation({
    mutationKey: ["booking"],
    mutationFn: async () => {
      // Validate required fields
      if (!formData.warehouseId) {
        throw new Error("Warehouse harus dipilih");
      }
      if (!formData.vehicleId) {
        throw new Error("Kendaraan harus dipilih");
      }
      if (!formData.dockId) {
        throw new Error("Dock harus dipilih");
      }
      if (!formData.arrivalTime) {
        throw new Error("Waktu kedatangan harus dipilih");
      }
      if (!formData.estimatedFinishTime) {
        throw new Error("Waktu selesai estimasi harus dihitung");
      }

      // Validate that estimatedFinishTime is after arrivalTime
      if (
        formData.arrivalTime &&
        formData.estimatedFinishTime &&
        new Date(formData.estimatedFinishTime) <= new Date(formData.arrivalTime)
      ) {
        throw new Error("Waktu selesai harus setelah waktu kedatangan");
      }

      // Prepare booking data
      const bookingData: Booking = {
        ...formData,
        arrivalTime: formData.arrivalTime,
        estimatedFinishTime: formData.estimatedFinishTime,
      };

      return BookingApi.createBooking(bookingData);
    },
    onSuccess: () => {
      toast.success("Booking berhasil dibuat");
      setIsBookComplted(true);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal membuat booking");
    },
  });

  const handleWarehouseSelect = (warehouse: Warehouse) => {
    setFormData({
      ...formData,
      warehouseId: warehouse.id,
      Warehouse: warehouse,
    });
    setBookingStep("driver");
    router.push(`/vendor/booking?warehouseId=${warehouse.id}`);
  };

  const handleDriverSelect = (driver: UserApp) => {
    if (!driver.username) return;
    setFormData({
      ...formData,
      driverUsername: driver.username,
      Driver: driver,
    });
    setBookingStep("vehicle");
    let full = window.location.href + `&driverUsername=${driver.username}`;
    router.push(full);
  };

  const handleVehicleSelect = (vehicle: IVehicle) => {
    if (!vehicle.id) return;
    setFormData({ ...formData, vehicleId: vehicle.id, Vehicle: vehicle });
    setBookingStep("dock");
    let full = window.location.href + `&vehicleId=${vehicle.id}`;
    router.push(full);
  };

  const handleFinish = () => {
    // Validate that all required fields are filled
    if (
      !formData.warehouseId ||
      !formData.vehicleId ||
      !formData.dockId ||
      !formData.arrivalTime ||
      !formData.estimatedFinishTime
    ) {
      toast.error("Mohon lengkapi semua data sebelum melanjutkan");
      return;
    }
    setBookingStep("confirmation");
  };

  const handleBack = () => {
    // Mapping step sebelumnya untuk setiap step
    const previousStepMap = {
      driver: "warehouse",
      vehicle: "driver",
      dock: "vehicle",
      confirmation: "dock",
    };

    // Cari step sebelumnya berdasarkan mapping
    const previousStep =
      previousStepMap[bookingStep as keyof typeof previousStepMap];

    if (previousStep) {
      // Update step
      setBookingStep(previousStep as BookingStep);

      // Reset data form sesuai dengan step yang ditinggalkan
      switch (bookingStep) {
        case "driver":
          setFormData((prev) => ({
            ...prev,
            driverUsername: "",
            driverName: "",
          }));
          break;
        case "vehicle":
          setFormData((prev) => ({ ...prev, vehicleId: "", Vehicle: null }));
          break;
        case "dock":
          setFormData((prev) => ({
            ...prev,
            dockId: "",
            Dock: null,
            arrivalTime: null,
            estimatedFinishTime: null,
            notes: "",
          }));
          break;
      }

      // Jika Anda benar-benar perlu update URL
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);

        // Hapus param untuk step yang ditinggalkan
        if (bookingStep === "driver") searchParams.delete("driverUsername");
        else if (bookingStep === "vehicle") searchParams.delete("vehicleId");
        else if (bookingStep === "dock") {
          searchParams.delete("dockId");
          searchParams.delete("arrivalTime");
          searchParams.delete("notes");
        }

        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }
    }
  };

  const getSteps = () => {
    const baseSteps = [
      { id: "warehouse", label: "Gudang", completed: !!formData.warehouseId },
      { id: "driver", label: "Driver", completed: !!formData.driverUsername },
      { id: "vehicle", label: "Kendaraan", completed: !!formData.vehicleId },
      { id: "dock", label: "Gate", completed: !!formData.dockId },
      { id: "confirmation", label: "Confirmation" },
    ];

    return baseSteps;
  };

  const getCurrentStepIndex = () => {
    return getSteps().findIndex((s) => s.id === bookingStep);
  };

  const handleUpdateFormData = (updates: Partial<Booking>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (vehicleIdParam || warehouseIdParam || dockIdParam || notesParam) {
      setFormData({
        ...formData,
        vehicleId: vehicleIdParam || "",
        warehouseId: warehouseIdParam || "",
        dockId: dockIdParam || "",
        notes: notesParam || "",
      });
    }
  }, []);

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
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold flex items-center mb-2">
                  <WarehouseIcon className="w-6 h-6 mr-2 text-primary" />
                  Pilih Gudang
                </h2>
                <p className="text-gray-600">
                  Pilih gudang tempat Anda ingin melakukan kunjungan
                </p>
              </div>
              <label className="relative">
                <input
                  type="text"
                  placeholder="Cari gudang.."
                  className="input w-full max-w-xs border px-2 rounded-md"
                  value={searchKeyWarehouse}
                  onChange={(e) => setSearchKeyWarehouse(e.target.value)}
                />
                <div className="absolute top-0 right-0 w-10 h-full flex items-center justify-center">
                  <Search />
                </div>
              </label>
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

        {/* Step 2: Driver Selection */}
        {bookingStep === "driver" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <h2 className="text-2xl font-semibold mb-2">Pilih Driver</h2>
                <p className="text-gray-600">Pilih driver untuk booking ini</p>
              </div>
              <label className="relative">
                <input
                  type="text"
                  placeholder="Cari Driver.."
                  className="input w-full max-w-xs border px-2 rounded-md"
                  value={searchKeyDriver}
                  onChange={(e) => setSearchKeyDriver(e.target.value)}
                />
                <div className="absolute top-0 right-0 w-10 h-full flex items-center justify-center">
                  <Search />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myDrivers?.map((driver: UserApp) => (
                <div
                  key={driver.username}
                  onClick={() => handleDriverSelect(driver)}
                  className={`card bg-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-2 ${
                    formData.driverUsername === driver.username
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <div className="card-body p-6">
                    {/* Header dengan nama driver dan status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {driver.displayName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {driver.username || "No Username"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`badge px-3 py-1 font-semibold ${
                          driver.isActive
                            ? "badge-success bg-green-100 text-green-800 border-green-200"
                            : "badge-error bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {driver.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    {/* Informasi Vendor */}
                    {driver.vendorName && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Vendor:</span>
                          <span className="text-gray-900">
                            {driver.vendorName}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tipe Akun */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          Tipe Akun:
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            driver.accountType === "APP"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {driver.accountType || "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Deskripsi dengan truncate */}
                    {driver.description && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {driver.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tombol Pilih */}
                    <div className="mt-4">
                      <button
                        className={`btn w-full gap-2 font-medium transition-all ${
                          formData.driverUsername === driver.username
                            ? "btn-primary"
                            : "btn-outline btn-primary hover:bg-primary/10"
                        }`}
                      >
                        {formData.driverUsername === driver.username ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Driver Terpilih</span>
                          </>
                        ) : (
                          <>
                            <User2 className="w-4 h-4" />
                            <span>Pilih Driver Ini</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bookingStep === "vehicle" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <h2 className="text-2xl font-semibold flex items-center mb-2">
                  <Car className="w-6 h-6 mr-2 text-primary" />
                  Pilih Kendaraan
                </h2>
                <p className="text-gray-600">
                  Pilih kendaraan yang akan digunakan untuk booking ini
                </p>
              </div>
              <label className="relative">
                <input
                  type="text"
                  placeholder="Cari Kendaraan..."
                  className="input w-full max-w-xs border px-2 rounded-md"
                  value={vehicleSearchKey}
                  onChange={(e) => setVehicleSearchKey(e.target.value)}
                />
                <div className="absolute top-0 right-0 w-10 h-full flex items-center justify-center">
                  <Search />
                </div>
              </label>
            </div>

            {isLoadingvendorVehicles ? (
              <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : vendorVehicles?.length === 0 ? (
              <div className="card bg-white shadow">
                <div className="card-body">
                  <div className="alert alert-warning">
                    <AlertCircle size={18} />
                    <div>
                      <p className="font-medium">
                        Belum ada kendaraan tersedia
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Driver ini belum memiliki kendaraan yang terdaftar
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendorVehicles?.map((vehicle: IVehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className={`card bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 group ${
                      formData.vehicleId === vehicle.id
                        ? "border-primary bg-gradient-to-br from-primary/5 to-white ring-2 ring-primary/20"
                        : "border-gray-100 hover:border-primary/30"
                    }`}
                  >
                    <div className="card-body p-6 flex-col justify-between">
                      <div className="flex flex-col ">
                        {/* Header dengan badge aktif */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                  formData.vehicleId === vehicle.id
                                    ? "bg-primary/20"
                                    : "bg-gray-100 group-hover:bg-primary/10"
                                }`}
                              >
                                <Car
                                  className={`w-6 h-6 ${
                                    formData.vehicleId === vehicle.id
                                      ? "text-primary"
                                      : "text-gray-600 group-hover:text-primary"
                                  }`}
                                />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                  {vehicle.brand || "Unknown Brand"}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold `}
                                  >
                                    {vehicle.vehicleType || "Unknown Type"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {vehicle.isActive ? (
                              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Aktif
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                Nonaktif
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Vehicle Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {/* Production Year */}
                          {vehicle.productionYear && (
                            <div
                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                formData.vehicleId === vehicle.id
                                  ? "bg-primary/10"
                                  : "bg-gray-50"
                              }`}
                            >
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">Tahun</p>
                                <p className="font-semibold text-gray-800">
                                  {vehicle.productionYear}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Unloading Duration */}
                          <div
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              formData.vehicleId === vehicle.id
                                ? "bg-primary/10"
                                : "bg-gray-50"
                            }`}
                          >
                            <Clock className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Durasi Bongkar
                              </p>
                              <p className="font-semibold text-gray-800">
                                {vehicle.durasiBongkar} menit
                              </p>
                            </div>
                          </div>

                          {/* Dock Requirement */}
                          <div
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              formData.vehicleId === vehicle.id
                                ? "bg-primary/10"
                                : "bg-gray-50"
                            }`}
                          >
                            <DockIcon className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Dock</p>
                              <p
                                className={`font-semibold ${
                                  vehicle.requiresDock === "NONE"
                                    ? "text-green-600"
                                    : "text-gray-800"
                                }`}
                              >
                                {vehicle.requiresDock === "NONE"
                                  ? "Tidak spesifik"
                                  : vehicle.requiresDock}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* vehicle desc */}
                        {vehicle.description && (
                          <div className="mb-4">
                            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-600 text-wrap">
                                {vehicle.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Additional Info Chips */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {vehicle.productionYear && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              🚗 {vehicle.productionYear}
                            </span>
                          )}
                          {vehicle.requiresDock &&
                            vehicle.requiresDock !== "NONE" && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                                ⚓ {vehicle.requiresDock}
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Select Button */}
                      <button
                        className={`btn w-full gap-3 font-medium transition-all duration-200 ${
                          formData.vehicleId === vehicle.id
                            ? "btn-primary shadow-lg"
                            : "btn-outline btn-primary hover:shadow-md"
                        }`}
                      >
                        {formData.vehicleId === vehicle.id ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Kendaraan Terpilih</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <Car className="w-4 h-4" />
                            <span>Pilih Kendaraan Ini</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Dock Selection */}
        {bookingStep === "dock" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold flex items-center mb-2">
                <Activity className="w-6 h-6 mr-2 text-primary" />
                Pilih Dock
              </h2>
              <p className="text-gray-600">
                Pilih dock yang tersedia di{" "}
                <span className="font-semibold">
                  {formData.Warehouse.name || "gudang ini"}
                </span>
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
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Left Column: Dock Selection - 30% */}
                <div className="lg:col-span-3">
                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                    {activeDocks?.map((dock: IDock) => (
                      <div
                        key={dock.id}
                        onClick={() =>
                          dock.isActive &&
                          setFormData((prev) => ({
                            ...prev,
                            dockId: dock.id,
                            Dock: dock,
                          }))
                        }
                        className={`card bg-white border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                          formData.dockId === dock.id
                            ? "border-primary shadow-md bg-primary/5"
                            : !dock.isActive
                            ? "border-gray-200 opacity-60 cursor-not-allowed"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        <div className="card-body p-4">
                          {/* Dock Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  dock.isActive ? "bg-blue-100" : "bg-gray-100"
                                }`}
                              >
                                <Dock
                                  className={`w-4 h-4 ${
                                    dock.isActive
                                      ? "text-blue-600"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-1">
                                  {dock.name}
                                  {!dock.isActive && (
                                    <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                                      OFF
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {dock.warehouse?.name}
                                </p>
                              </div>
                            </div>

                            {dock.priority && (
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < dock.priority
                                          ? "text-yellow-500 fill-yellow-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">
                                  Prio {dock.priority}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Dock Type */}
                          <div className="mb-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                dock.dockType === "SIDE"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                            >
                              {dock.dockType}
                            </span>
                          </div>

                          {/* Allowed Vehicles */}
                          {dock.allowedTypes &&
                            dock.allowedTypes.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-1">
                                  Tipe kendaraan:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {dock.allowedTypes
                                    .slice(0, 3)
                                    .map((type, i) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                      >
                                        {type}
                                      </span>
                                    ))}
                                  {dock.allowedTypes.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                      +{dock.allowedTypes.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Status & Button */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  dock.isActive ? "bg-green-500" : "bg-red-500"
                                }`}
                              ></div>
                              <span
                                className={`text-xs font-medium ${
                                  dock.isActive
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {dock.isActive ? "Tersedia" : "Tidak tersedia"}
                              </span>
                            </div>

                            <button
                              className={`btn btn-sm px-3 ${
                                formData.dockId === dock.id
                                  ? "btn-primary"
                                  : !dock.isActive
                                  ? "btn-disabled bg-gray-100 text-gray-400"
                                  : "btn-outline btn-primary btn-sm"
                              }`}
                              disabled={!dock.isActive}
                            >
                              {formData.dockId === dock.id
                                ? "✓ Dipilih"
                                : !dock.isActive
                                ? "Disabled"
                                : "Pilih"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Preview & Actions - 70% */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Preview Slot Component */}
                  {formData.dockId ? (
                    <>
                      <PreviewSlotDisplay
                        formData={formData}
                        onUpdateFormData={handleUpdateFormData}
                      />
                      {/* Continue Button */}
                      {formData.arrivalTime && formData.estimatedFinishTime && (
                        <div className="card bg-white shadow">
                          <div className="card-body">
                            <button
                              onClick={handleFinish}
                              className="btn btn-primary btn-lg w-full"
                            >
                              Lanjutkan ke Konfirmasi
                              <ChevronRight className="w-5 h-5 ml-2" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="card bg-white shadow">
                      <div className="card-body text-center py-16">
                        <DockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">
                          Pilih dock terlebih dahulu untuk melihat jadwal
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Confirmation */}
        {bookingStep === "confirmation" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold flex items-center mb-2">
                <CheckCircle className="w-6 h-6 mr-2 text-primary" />
                Konfirmasi Booking
              </h2>
              <p className="text-gray-600">
                Periksa kembali detail booking Anda sebelum mengirimkan
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Booking Details */}
              <div className="space-y-6">
                {/* Warehouse Info */}
                <div className="card bg-white shadow">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <WarehouseIcon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Informasi Gudang</h3>
                    </div>
                    {formData.Warehouse ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Nama Gudang</p>
                          <p className="font-semibold text-lg">
                            {formData.Warehouse.name}
                          </p>
                        </div>
                        {formData.Warehouse.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                            <div>
                              <p className="text-sm text-gray-500">Lokasi</p>
                              <p className="font-medium">
                                {formData.Warehouse.location}
                              </p>
                            </div>
                          </div>
                        )}
                        {formData.Warehouse.description && (
                          <div>
                            <p className="text-sm text-gray-500">Deskripsi</p>
                            <p className="text-sm">
                              {formData.Warehouse.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        Data gudang tidak tersedia
                      </p>
                    )}
                  </div>
                </div>

                {/* Driver Info */}
                <div className="card bg-white shadow">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold">Informasi Driver</h3>
                    </div>
                    {formData.Driver ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Nama Driver</p>
                          <p className="font-semibold text-lg">
                            {formData.Driver.displayName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Username</p>
                          <p className="font-medium">
                            {formData.Driver.username || "N/A"}
                          </p>
                        </div>
                        {formData.Driver.vendorName && (
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Vendor</p>
                              <p className="font-medium">
                                {formData.Driver.vendorName}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        Data driver tidak tersedia
                      </p>
                    )}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="card bg-white shadow">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <Car className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold">Informasi Kendaraan</h3>
                    </div>
                    {formData.Vehicle ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Merek</p>
                          <p className="font-semibold text-lg">
                            {formData.Vehicle.brand || "N/A"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">
                              Tipe Kendaraan
                            </p>
                            <p className="font-medium">
                              {formData.Vehicle.vehicleType || "N/A"}
                            </p>
                          </div>
                          {formData.Vehicle.productionYear && (
                            <div>
                              <p className="text-sm text-gray-500">
                                Tahun Produksi
                              </p>
                              <p className="font-medium">
                                {formData.Vehicle.productionYear}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">
                              Durasi Bongkar
                            </p>
                            <p className="font-medium">
                              {formData.Vehicle.durasiBongkar} menit
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Dock Requirement
                            </p>
                            <p className="font-medium">
                              {formData.Vehicle.requiresDock === "NONE"
                                ? "Tidak spesifik"
                                : formData.Vehicle.requiresDock}
                            </p>
                          </div>
                        </div>
                        {formData.Vehicle.description && (
                          <div>
                            <p className="text-sm text-gray-500">Deskripsi</p>
                            <p className="text-sm">
                              {formData.Vehicle.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        Data kendaraan tidak tersedia
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Dock & Schedule Info */}
              <div className="space-y-6">
                {/* Dock Info */}
                <div className="card bg-white shadow">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <DockIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold">Informasi Dock</h3>
                    </div>
                    {formData.Dock ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Nama Dock</p>
                          <p className="font-semibold text-lg">
                            {formData.Dock.name}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Tipe Dock</p>
                            <span
                              className={`badge ${
                                formData.Dock.dockType === "SIDE"
                                  ? "badge-info"
                                  : "badge-ghost"
                              }`}
                            >
                              {formData.Dock.dockType || "N/A"}
                            </span>
                          </div>
                          {formData.Dock.priority && (
                            <div>
                              <p className="text-sm text-gray-500">Prioritas</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < formData.Dock.priority!
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {formData.Dock.allowedTypes &&
                          formData.Dock.allowedTypes.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                Tipe Kendaraan yang Diizinkan
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {formData.Dock.allowedTypes.map((type, i) => (
                                  <span
                                    key={i}
                                    className="badge badge-outline badge-sm"
                                  >
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Data dock tidak tersedia</p>
                    )}
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="card bg-white shadow">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold">Jadwal Kunjungan</h3>
                    </div>
                    {formData.arrivalTime && formData.estimatedFinishTime ? (
                      <div className="space-y-4">
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <p className="font-semibold text-lg">
                              Waktu Kedatangan
                            </p>
                          </div>
                          <p className="text-xl font-bold">
                            {new Date(formData.arrivalTime).toLocaleString(
                              "id-ID",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <div className="bg-success/10 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-success" />
                            <p className="font-semibold text-lg">
                              Estimasi Waktu Selesai
                            </p>
                          </div>
                          <p className="text-xl font-bold">
                            {new Date(
                              formData.estimatedFinishTime
                            ).toLocaleString("id-ID", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="bg-info/10 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Durasi Estimasi
                          </p>
                          <p className="text-lg font-bold">
                            {formData.Vehicle?.durasiBongkar || 0} menit
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        Waktu kunjungan belum dipilih
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {formData.notes && (
                  <div className="card bg-white shadow">
                    <div className="card-body">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold">Catatan</h3>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {formData.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isBookCompleted ? (
              <div className="card bg-white shadow w-32">
                <div className="card-body">
                  <button className="btn btn-primary px-4">Buat Baru</button>
                </div>
              </div>
            ) : (
              <div className="card bg-white shadow">
                <div className="card-body">
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                      onClick={handleBack}
                      className="btn btn-outline btn-lg"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Kembali
                    </button>
                    {!isPendingSubmitBooking && (
                      <button
                        onClick={() => handleSubmitBooking()}
                        disabled={
                          !formData.warehouseId ||
                          !formData.vehicleId ||
                          !formData.dockId ||
                          !formData.arrivalTime ||
                          !formData.estimatedFinishTime
                        }
                        className={`btn px-4 btn-primary btn-lg ${
                          !formData.warehouseId ||
                          !formData.vehicleId ||
                          !formData.dockId ||
                          !formData.arrivalTime ||
                          !formData.estimatedFinishTime
                            ? "btn-disabled"
                            : ""
                        }`}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Konfirmasi Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
