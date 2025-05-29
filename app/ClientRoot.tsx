// app/ClientRoot.tsx
"use client";

import dynamic from "next/dynamic";
import React from "react";

// If StoreProvider doesn't need to be dynamic, you can just import it normally
import StoreProvider from "@/redux/StoreProvider";

// If Navbar/Footer are client components, import them directly; if not, use dynamic without ssr:false!
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Navbar />
      {children}
      <Footer />
    </StoreProvider>
  );
}
