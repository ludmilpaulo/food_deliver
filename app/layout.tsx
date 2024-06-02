import type { Metadata } from "next";
import Head from 'next/head';
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kudya - Entrega de Comida Rápida e Fácil | Melhores Restaurantes, Refeições Favoritas",
  description: "Descubra os melhores restaurantes e peça suas refeições favoritas com Kudya. Entrega rápida, fácil e conveniente para sua conveniência.",
  keywords: "Kudya, entrega de comida, restaurantes, refeições favoritas, comida rápida, entrega fácil, conveniência, pedidos online, variedade gastronômica",
  authors: [
    { name: "Kudya", url: "https://www.sdkudya.com" },
  ],
  openGraph: {
    title: "Kudya - Entrega de Comida Rápida e Fácil | Melhores Restaurantes, Refeições Favoritas",
    description: "Descubra os melhores restaurantes e peça suas refeições favoritas com Kudya. Entrega rápida, fácil e conveniente para sua conveniência.",
    url: "https://www.kudya.com",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "https://ludmil.pythonanywhere.com/media/logo/azul.png", // Substitua pelo caminho da sua imagem
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
    title: "Kudya - Entrega de Comida Rápida e Fácil | Melhores Restaurantes, Refeições Favoritas",
    description: "Descubra os melhores restaurantes e peça suas refeições favoritas com Kudya. Entrega rápida, fácil e conveniente para sua conveniência.",
    images: [
      {
        url: "https://ludmil.pythonanywhere.com/media/logo/azul.png",// Substitua pelo caminho da sua imagem
        alt: "Kudya - Entrega de Comida Rápida e Fácil",
      },
    ],
  },
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
    <html lang="pt">
    <Head>
        <title>Kudya - Entrega de Comida Rápida e Fácil | Melhores Restaurantes, Refeições Favoritas</title>
        <meta name="description" content="Encontre os melhores restaurantes e peça suas refeições favoritas com Kudya. Entrega de comida rápida, fácil e conveniente. Descubra a variedade gastronômica agora!" />
        <meta name="keywords" content="Kudya, entrega de comida, restaurantes, refeições favoritas, comida rápida, entrega fácil, conveniência, pedidos online, variedade gastronômica" />
        
       
        <meta property="og:title" content="Kudya - Entrega de Comida Rápida e Fácil" />
        <meta property="og:description" content="Descubra os melhores restaurantes e peça suas refeições favoritas com Kudya. Entrega rápida, fácil e conveniente." />
        <meta property="og:image" content="https://www.kudya.com/path/to/your/image.jpg" />
        <meta property="og:url" content="https://www.kudya.com" />
        <meta property="og:type" content="website" />
        
      
        <meta name="twitter:title" content="Kudya - Entrega de Comida Rápida e Fácil" />
        <meta name="twitter:description" content="Encontre os melhores restaurantes e peça suas refeições favoritas com Kudya. Entrega de comida rápida, fácil e conveniente." />
        <meta name="twitter:image" content="https://www.kudya.com/path/to/your/image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body className={inter.className}>
        <Navbar />
        {children}</body>
        <Footer />
    </html>
    </StoreProvider>
  );
}