import SideNavVendor from "@/components/vendor/side-nav-vendor";
import React from "react";

const VendorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex  ">
      <SideNavVendor />
      <main className="w-full overflow-y-auto">{children}</main>
    </div>
  );
};

export default VendorLayout;
