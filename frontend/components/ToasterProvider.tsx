"use client";
import React, { Suspense } from "react";
import { Toaster } from "sonner";
import Loading from "./shared-common/Loading";

const ToasterProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Toaster position="top-center" />
      </Suspense>
      {children}
    </>
  );
};

export default ToasterProvider;
