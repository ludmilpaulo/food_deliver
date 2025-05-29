'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const StoreProvider = dynamic(() => import('@/redux/StoreProvider'), { ssr: false });
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Navbar />
      {children}
      <Footer />
    </StoreProvider>
  );
}
