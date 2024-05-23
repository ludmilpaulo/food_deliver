import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kudya - Entrega de Comida Rápida e Fácil",
  description: "Descubra os melhores restaurantes e peça suas refeições favoritas com o Kudya. Entrega rápida e fácil para sua conveniência.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
    <html lang="pt">
      <body className={inter.className}>
        <Navbar />
        {children}</body>
        <Footer />
    </html>
    </StoreProvider>
  );
}