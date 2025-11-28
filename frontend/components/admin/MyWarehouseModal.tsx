"use client";

import { Warehouse } from "@/types/warehouse";
import { MutateFunction } from "@tanstack/react-query";
import React from "react";

interface MyWarehouseProps {
  formData: Warehouse;
  setFormData: void;
  onCreate: MutateFunction;
  onEdit: MutateFunction;
}

const MyWarehouseModal = ({
  formData,
  setFormData,
  onEdit,
}: MyWarehouseProps) => {
  const onSubmit = () => {
    if (formData.id) {
      onEdit();
    }
  };

  return (
    <dialog onSubmit={onSubmit} id="MyWarehouseModal" className="modal">
      <div className="modal-box">
        <div className="modal-action">
          <form method="dialog">
            <button
              className="btn"
              type="button"
              onClick={() => {
                (
                  document.getElementById(
                    "MyWarehouseModal"
                  ) as HTMLDialogElement
                )?.close();
              }}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default MyWarehouseModal;
