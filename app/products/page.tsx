"use client";
import React, { Suspense } from "react";
import ProductsPage from "./ProductsPage"; // <-- create and move the real component here

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
