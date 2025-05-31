import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import StoreProvider from '@/redux/StoreProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


const inter = Inter({ subsets: ['latin'] });

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <StoreProvider>
          <Navbar />
          {children}
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}