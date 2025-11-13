import SideNav from "@/components/admin/side-nav";
import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full ">
      <SideNav />
      <main className="w-full overflow-y-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
