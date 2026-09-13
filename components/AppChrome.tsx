'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { SupportedLocale } from '@/configs/translations';

export default function AppChrome({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: SupportedLocale;
}) {
  const pathname = usePathname();
  const isGrocery = Boolean(pathname?.startsWith('/groceries'));

  return (
    <>
      {isGrocery ? null : <Navbar initialLocale={locale} />}
      {children}
      {isGrocery ? null : <Footer />}
    </>
  );
}
