import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import './globals.css';

import StoreProvider from '@/redux/StoreProvider';
import AppChrome from '@/components/AppChrome';
import ClientRoot from './ClientRoot';
import JsonLd from '@/components/JsonLd';
import { LocationProvider } from '@/contexts/LocationContext';
import { initLanguage, localeFromAcceptLanguage } from '@/configs/i18n';
import { supportedLocales, SupportedLocale } from '@/configs/translations';
import { buildRootMetadata } from '@/configs/seo';

function resolveLocale(
  cookieValue: string | undefined,
  manualFlag: string | undefined,
  acceptLanguage: string | null,
): SupportedLocale {
  if (
    (manualFlag === '1' || cookieValue) &&
    cookieValue &&
    supportedLocales.includes(cookieValue as SupportedLocale)
  ) {
    return cookieValue as SupportedLocale;
  }
  return localeFromAcceptLanguage(acceptLanguage);
}

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveLocale(
    cookieStore.get('app_lang')?.value,
    cookieStore.get('app_lang_manual')?.value,
    headerStore.get('accept-language'),
  );
  return buildRootMetadata(locale);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveLocale(
    cookieStore.get('app_lang')?.value,
    cookieStore.get('app_lang_manual')?.value,
    headerStore.get('accept-language'),
  );
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
              <AppChrome locale={locale}>
                {children}
              </AppChrome>
            </ClientRoot>
          </LocationProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
