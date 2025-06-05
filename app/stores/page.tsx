"use client";
import React, { Suspense } from "react";
import StoresPage from "./StoresPage"; // <-- create and move the real component here

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoresPage />
    </Suspense>
  );
}
