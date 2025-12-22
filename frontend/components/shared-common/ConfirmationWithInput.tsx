import React, { Dispatch, SetStateAction } from "react";

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  modalId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
}

const ConfirmationWithInput = ({
  message,
  onConfirm,
  title,
  modalId = "",
  input = "",
  setInput,
}: ConfirmationModalProps) => {
  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder=".."
          className="input w-full  border px-2 py-1"
          required
        />
        <div className="modal-action grid grid-cols-2">
          <button
            onClick={() =>
              (document.getElementById(modalId) as HTMLDialogElement)?.close()
            }
            className="btn hover:bg-secondary hover:border-red-300 border bg-red-300"
          >
            Tidak Yakin
          </button>
          <button
            onClick={() => {
              onConfirm();
              (document.getElementById(modalId) as HTMLDialogElement)?.close();
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

export default ConfirmationWithInput;
