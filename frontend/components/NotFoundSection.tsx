import { Info } from "lucide-react";
import React from "react";

const NotFoundSection = () => {
  return (
    <div role="alert" className="alert alert-success">
      <Info color="white" />

      <div className="flex flex-1 w-full mx-auto justify-center items-center text-center col-span-3">
        <h3 className="text-3xl font-bold text-white">Tidak ditemukan</h3>
      </div>
    </div>
  );
};

export default NotFoundSection;
