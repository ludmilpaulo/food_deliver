import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import ClientRoot from "./ClientRoot"; 
console.log('Base API URL:', process.env.NEXT_PUBLIC_BASE_API);


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kudya - Entrega de Comida Rápida e Fácil | Melhores storees, Refeições Favoritas",
  description: "Descubra os melhores storees e peça suas refeições favoritas com Kudya. Entrega rápida, fácil e conveniente para sua conveniência.",
  keywords: "Kudya, entrega de comida, storees, refeições favoritas, comida rápida, entrega fácil, conveniência, pedidos online, variedade gastronômica",
  authors: [
    { name: "Kudya", url: "https://www.sdkudya.com" },
  ],
  openGraph: {
    title: "Kudya - Entrega de Comida Rápida e Fácil | Melhores storees, Refeições Favoritas",
    description: "Descubra os melhores storees e peça suas refeições favoritas com Kudya. Entrega rápida, fácil e conveniente para sua conveniência.",
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
    title: "Kudya - Entrega de Comida Rápida e Fácil | Melhores storees, Refeições Favoritas",
    description: "Descubra os melhores storees e peça suas refeições favoritas com Kudya. Entrega rápida, fácil e conveniente para sua conveniência.",
    images: [
      {
        url: "https://www.kudya.shop/media/logo/azul.png",
        alt: "Kudya - Entrega de Comida Rápida e Fácil",
      },
    ],
  },
};

// app/layout.tsx

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}