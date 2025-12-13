"use client";
import { OrganizationApi } from "@/api/organization.api";
import OrganizationFormModal from "@/components/admin/OrganizationFormModal";
import { Organization } from "@/types/organization";
import { BaseProps, SubscriptionPlan } from "@/types/shared.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Plus,
  Building,
  Warehouse,
  Truck,
  Users,
  Edit,
  Calendar,
  Trash2,
  Crown,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const initialOrganization: Organization = {
  name: "",
  accounts: [],
  AD_BASE_DN: "",
  AD_DOMAIN: "",
  AD_HOST: "",
  AD_PORT: "",
  bookings: [],
  docks: [],
  isEditing: false,
  subscription: SubscriptionPlan.TRIAL,
  subscriptionId: null,
  vehicles: [],
  warehouses: [],
};

const OrganizationManagementPage = () => {
  const [formData, setFormData] = useState<Organization>(initialOrganization);
  const qq = useQueryClient();

  const [organizationFilter] = useState<BaseProps>({
    searchKey: "",
    page: 1,
  });
  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () =>
      await OrganizationApi.getAllOrganizations(organizationFilter),
  });

  const {
    mutateAsync: handleCreateOrganization,
    isPending: isPendingCreatingOrganization,
  } = useMutation({
    mutationKey: ["organizations", "create"],
    mutationFn: async () =>
      await OrganizationApi.registerOrganization(formData),
    onSuccess: (res) => {
      qq.invalidateQueries({ queryKey: ["organizations"] });
      (
        document.getElementById("OrganizationFormModal") as HTMLDialogElement
      ).close();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "gagal register organzation baru"
      );
    },
  });

  const {
    mutateAsync: handleEditOrganization,
    isPending: isPendingEditOrganization,
  } = useMutation({
    mutationKey: ["organizations", "update"],
    mutationFn: async () =>
      await OrganizationApi.updateOrganization(formData.name, formData),
    onSuccess: (res) => {
      qq.invalidateQueries({ queryKey: ["organizations"] });
      (
        document.getElementById("OrganizationFormModal") as HTMLDialogElement
      ).close();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "gagal mengupdate");
    },
  });

  const { mutateAsync: handleDeleteOrganization } = useMutation({
    mutationKey: ["organizations"],
    mutationFn: async (name: string) =>
      await OrganizationApi.deleteOrganization(name),
    onSuccess: (res) => {
      qq.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "gagal menghapus oraganization"
      );
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Organization Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Kelola semua organisasi dan resource mereka
                </p>
              </div>
              <button
                onClick={() => {
                  setFormData(initialOrganization);
                  (
                    document.getElementById(
                      "OrganizationFormModal"
                    ) as HTMLDialogElement
                  ).showModal();
                }}
                className="btn bg-teal-500  px-4 py-2 text-white"
              >
                <Plus size={20} /> New Organization
              </button>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Organizations
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {organizations?.length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-leaf-green-100 rounded-lg">
                    <Building className="w-6 h-6 text-leaf-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Warehouses
                    </p>
                    <p className="text-2xl font-bold text-leaf-green-600">
                      {Array.isArray(organizations)
                        ? organizations.reduce(
                            (acc, org) => acc + (org.warehouses?.length || 0),
                            0
                          )
                        : 0}
                    </p>
                  </div>
                  <div className="p-3 bg-leaf-green-100 rounded-lg">
                    <Warehouse className="w-6 h-6 text-leaf-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Accounts
                    </p>
                    <p className="text-2xl font-bold text-leaf-green-600">
                      {Array.isArray(organizations)
                        ? organizations.reduce(
                            (acc, org) => acc + (org.warehouses?.length || 0),
                            0
                          )
                        : 0}
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <Users className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </div>
            </div>
            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-leaf-green-50 border-b border-leaf-green-100">
                      <th className="font-semibold text-gray-700 py-4 px-4">
                        Organization Name
                      </th>
                      <th className="font-semibold text-gray-700 py-4 px-4">
                        Warehouses
                      </th>
                      <th className="font-semibold text-gray-700 py-4 px-4">
                        Docks
                      </th>
                      <th className="font-semibold text-gray-700 py-4 px-4">
                        Vehicles Template
                      </th>
                      <th className="font-semibold text-gray-700 py-4 px-4">
                        Members
                      </th>
                      <th className="font-semibold text-gray-700 py-4 px-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations?.length > 0 ? (
                      organizations.map((org: Organization, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-gray-25" : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-leaf-green-500 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-gray-800 block">
                                  {org.name}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1 text-gray-700">
                              <Warehouse className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {org.warehouses?.length || 0}
                              </span>
                              {org.warehouses && org.warehouses.length > 0 && (
                                <div className="text-xs text-gray-500 ml-2">
                                  {org.warehouses.map((w) => w.name).join(", ")}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1 text-gray-700">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {org.docks?.length || 0}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1 text-gray-700">
                              <Truck className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {org.vehicles?.length || 0}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1 text-gray-700">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {org.accounts?.length || 0}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  org.isEditing = true;
                                  setFormData(org);
                                  (
                                    document.getElementById(
                                      "OrganizationFormModal"
                                    ) as HTMLDialogElement
                                  ).showModal();
                                }}
                                className="btn btn-sm btn-ghost hover:bg-leaf-green-50 hover:text-leaf-green-600 text-gray-500 transition-colors"
                                title="Edit organization"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    confirm(
                                      "Apakah Anda yakin ingin menghapus organization ini?"
                                    )
                                  ) {
                                    await handleDeleteOrganization(org.name);
                                  }
                                }}
                                className="btn btn-sm btn-ghost hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors"
                                title="Hapus organization"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <Building className="w-16 h-16 text-gray-300 mb-2" />
                            <p className="font-medium">
                              Belum ada data organization
                            </p>
                            <p className="text-sm mt-1">
                              Mulai dengan menambahkan organization pertama
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
      <OrganizationFormModal
        formData={formData}
        setFormData={setFormData}
        onCreate={handleCreateOrganization}
        onEdit={handleEditOrganization}
        key={"OrganizationFormModal"}
        //state
        isPendingCreate={isPendingCreatingOrganization}
        isPendingEdit={isPendingEditOrganization}
      />
    </div>
  );
};

export default OrganizationManagementPage;
