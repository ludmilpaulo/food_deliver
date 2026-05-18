import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';

import StoreProvider from '@/redux/StoreProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientRoot from './ClientRoot';
import { initLanguage } from '@/configs/i18n';
import { supportedLocales, SupportedLocale } from '@/configs/translations';

export const metadata: Metadata = {
  title: "Kudya - Entrega de Comida Rápida e Fácil | Melhores Restaurantes, Refeições Favoritas",
  description: "Descubra os melhores restaurantes e peça suas refeições favoritas com Kudya. Entrega rápida, fácil e conveniente para sua conveniência.",
  keywords: "Kudya, entrega de comida, restaurantes, refeições favoritas, comida rápida, entrega fácil, conveniência, pedidos online, variedade gastronômica",
  authors: [{ name: "Kudya", url: "https://www.sdkudya.com" }],
  openGraph: {
    title: "Kudya - Entrega de Comida Rápida e Fácil | Melhores Restaurantes, Refeições Favoritas",
    description: "Descubra os melhores restaurantes e peça suas refeições favoritas com Kudya.",
    url: "https://www.kudya.com",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "https://www.kudya.shop/media/logo/azul.png",
        width: 1200,
        height: 630,
        alt: "Kudya - Entrega de Comida Rápida e Fácil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kudya",
    creator: "@kudya",
    title: "Kudya - Entrega de Comida Rápida e Fácil",
    description: "Descubra os melhores restaurantes e peça suas refeições favoritas com Kudya.",
    images: [
      {
        url: "https://www.kudya.shop/media/logo/azul.png",
        alt: "Kudya - Entrega de Comida Rápida e Fácil",
      },
    ],
  },
};

function resolveLocale(cookieValue: string | undefined): SupportedLocale {
  if (cookieValue && supportedLocales.includes(cookieValue as SupportedLocale)) {
    return cookieValue as SupportedLocale;
  }
  return 'pt';
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get('app_lang')?.value);
  initLanguage(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans">
        <StoreProvider>
          <ClientRoot>
            <Navbar initialLocale={locale} />
            {children}
            <Footer />
          </ClientRoot>
        </StoreProvider>
      </body>
    </html>
  );
}
