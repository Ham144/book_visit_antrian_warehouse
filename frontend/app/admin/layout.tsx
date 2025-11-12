import SideNav from "@/components/shared-common/side-nav";
import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SideNav />
      {children}
    </div>
  );
};

export default AdminLayout;
