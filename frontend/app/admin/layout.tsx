import SideNav from "@/components/admin/side-nav";
import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return <SideNav children={children} />;
};

export default AdminLayout;
