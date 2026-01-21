"use client";
import React from "react";
import { Toaster } from "sonner";

const ToasterProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster position="top-center" />
      {children}
    </>
  );
};

export default ToasterProvider;
