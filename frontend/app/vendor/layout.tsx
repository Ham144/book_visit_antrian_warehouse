import SideNav from "@/components/admin/side-nav";
import React from "react";

const VendorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex  ">
      <SideNav children={children} />
    </div>
  );
};

export default VendorLayout;
