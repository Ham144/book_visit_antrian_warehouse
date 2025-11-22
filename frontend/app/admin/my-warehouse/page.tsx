"use client";
import React from "react";
import { Plus } from "lucide-react";

const MyWarehousePage = () => {
  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    My warehouse
                  </h1>
                  <p className="text-gray-600">Kelola warehouse saat ini</p>
                </div>
                <button
                  onClick={() =>
                    (
                      document.getElementById(
                        "UserEditModalForm"
                      ) as HTMLDialogElement
                    )?.showModal()
                  }
                  className="btn  btn-primary px-3 "
                >
                  <Plus /> Buat Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyWarehousePage;
