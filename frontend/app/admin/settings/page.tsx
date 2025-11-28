"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const AdminSettings = () => {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => {},
  });

  return (
    <div className="container flex-col flex ">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button className="btn px-2 btn-primary">Simpan</button>
      </div>
      {/* body */}
      <div className="flex flex-col">
        <label>
          <span></span>
          <input
            type="text"
            placeholder=""
            className="input input-bordered w-full max-w-xs"
          />
        </label>
      </div>
    </div>
  );
};

export default AdminSettings;
