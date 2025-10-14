"use client";
import React, { Suspense } from "react";
import ServicesPage from "./ServicesPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServicesPage />
    </Suspense>
  );
}


