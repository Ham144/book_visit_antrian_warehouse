import React from "react";

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
}

const ConfirmationModal = ({
  message,
  onConfirm,
  title,
}: ConfirmationModalProps) => {
  return (
    <dialog id="confirmation1" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action grid grid-cols-2">
          <button
            onClick={() =>
              (
                document.getElementById("confirmation1") as HTMLDialogElement
              )?.close()
            }
            className="btn hover:bg-secondary hover:border-red-300 border bg-red-300"
          >
            Tidak Yakin
          </button>
          <button
            onClick={() => {
              onConfirm();
              (
                document.getElementById("confirmation1") as HTMLDialogElement
              )?.close();
            }}
            className="btn btn-success hover:bg-primary hover:text-white"
          >
            Yakin
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmationModal;
