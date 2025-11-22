import SideNav from "@/components/admin/side-nav";
import React from "react";

const VendorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex  ">
      <SideNav />
      <main className="w-full overflow-y-auto">{children}</main>
    </div>
  );
};

export default VendorLayout;
