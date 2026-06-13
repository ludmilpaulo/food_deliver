import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';

import StoreProvider from '@/redux/StoreProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientRoot from './ClientRoot';
import JsonLd from '@/components/JsonLd';
import { LocationProvider } from '@/contexts/LocationContext';
import { initLanguage } from '@/configs/i18n';
import { supportedLocales, SupportedLocale } from '@/configs/translations';
import { buildRootMetadata } from '@/configs/seo';

function resolveLocale(cookieValue: string | undefined): SupportedLocale {
  if (cookieValue && supportedLocales.includes(cookieValue as SupportedLocale)) {
    return cookieValue as SupportedLocale;
  }
  return 'pt';
}

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get('app_lang')?.value);
  return buildRootMetadata(locale);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get('app_lang')?.value);
  initLanguage(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className="font-sans antialiased text-slate-900"
        suppressHydrationWarning
      >
        <JsonLd />
        <StoreProvider>
          <LocationProvider>
            <ClientRoot>
              <Navbar initialLocale={locale} />
              {children}
              <Footer />
            </ClientRoot>
          </LocationProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
