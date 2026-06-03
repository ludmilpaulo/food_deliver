import type { Metadata } from 'next';
import { SupportedLocale, supportedLocales } from '@/configs/translations';

export const SITE_URL = 'https://kudya.online';
export const SITE_NAME = 'Kudya';
export const DEFAULT_OG_IMAGE = 'https://www.kudya.shop/media/logo/azul.png';

type LocaleSeo = {
  title: string;
  description: string;
  keywords: string[];
};

export const rootSeo: Record<SupportedLocale, LocaleSeo> = {
  en: {
    title: 'Kudya — Food Delivery, Shopping & Services in Southern Africa',
    description:
      'Order food, shop local stores, book services, and track deliveries with Kudya. Fast delivery across South Africa, Angola, Mozambique, and Cabo Verde. Download the app or order on the web.',
    keywords: [
      'Kudya',
      'food delivery',
      'online shopping',
      'restaurants',
      'Southern Africa',
      'Angola',
      'Mozambique',
      'Cabo Verde',
      'South Africa',
      'order food online',
      'super app',
    ],
  },
  pt: {
    title: 'Kudya — Entrega de Comida, Compras e Serviços na África Austral',
    description:
      'Peça comida, compre em lojas locais, reserve serviços e acompanhe entregas com a Kudya. Entrega rápida na África do Sul, Angola, Moçambique e Cabo Verde.',
    keywords: [
      'Kudya',
      'entrega de comida',
      'compras online',
      'restaurantes',
      'África Austral',
      'Angola',
      'Moçambique',
      'Cabo Verde',
      'África do Sul',
      'super app',
    ],
  },
  fr: {
    title: 'Kudya — Livraison de repas, shopping et services en Afrique australe',
    description:
      'Commandez des repas, achetez en local, réservez des services et suivez vos livraisons avec Kudya en Afrique du Sud, Angola, Mozambique et Cap-Vert.',
    keywords: [
      'Kudya',
      'livraison de repas',
      'achats en ligne',
      'restaurants',
      'Afrique australe',
      'super app',
    ],
  },
  es: {
    title: 'Kudya — Comida a domicilio, compras y servicios en África Austral',
    description:
      'Pide comida, compra en tiendas locales, reserva servicios y sigue tus entregas con Kudya en Sudáfrica, Angola, Mozambique y Cabo Verde.',
    keywords: [
      'Kudya',
      'entrega de comida',
      'compras online',
      'restaurantes',
      'África Austral',
      'super app',
    ],
  },
};

export const pageSeo: Record<
  string,
  Record<SupportedLocale, { title: string; description: string }>
> = {
  faq: {
    en: {
      title: 'FAQ — Help & Answers',
      description:
        'Find answers about ordering, delivery, payments, TikTok login, account setup, and support on Kudya.',
    },
    pt: {
      title: 'FAQ — Ajuda e Respostas',
      description:
        'Respostas sobre pedidos, entregas, pagamentos, login TikTok, conta e suporte na Kudya.',
    },
    fr: {
      title: 'FAQ — Aide et réponses',
      description:
        'Réponses sur les commandes, livraisons, paiements, connexion TikTok et support Kudya.',
    },
    es: {
      title: 'FAQ — Ayuda y respuestas',
      description:
        'Respuestas sobre pedidos, entregas, pagos, inicio con TikTok y soporte en Kudya.',
    },
  },
  terms: {
    en: {
      title: 'Terms of Service',
      description:
        'Kudya Terms of Service — rules for using our food delivery, shopping, and account services.',
    },
    pt: {
      title: 'Termos de Serviço',
      description:
        'Termos de Serviço Kudya — regras para usar entrega, compras e conta na plataforma.',
    },
    fr: {
      title: 'Conditions d\'utilisation',
      description:
        'Conditions d\'utilisation Kudya — règles d\'usage de la livraison, des achats et du compte.',
    },
    es: {
      title: 'Términos de servicio',
      description:
        'Términos de servicio de Kudya — reglas de uso de entrega, compras y cuenta.',
    },
  },
  privacy: {
    en: {
      title: 'Privacy Policy',
      description:
        'How Kudya collects, uses, and protects your personal data across our apps and website.',
    },
    pt: {
      title: 'Política de Privacidade',
      description:
        'Como a Kudya recolhe, utiliza e protege os seus dados pessoais na app e no site.',
    },
    fr: {
      title: 'Politique de confidentialité',
      description:
        'Comment Kudya collecte, utilise et protège vos données personnelles.',
    },
    es: {
      title: 'Política de privacidad',
      description:
        'Cómo Kudya recopila, utiliza y protege tus datos personales.',
    },
  },
};

export function buildRootMetadata(locale: SupportedLocale): Metadata {
  const seo = rootSeo[locale] ?? rootSeo.en;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical: SITE_URL,
      languages: Object.fromEntries(
        supportedLocales.map((code) => [code, `${SITE_URL}?lang=${code}`]),
      ),
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: 'website',
      locale: locale === 'pt' ? 'pt_PT' : locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_US',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Food delivery & shopping`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@kudya',
      creator: '@kudya',
      title: seo.title,
      description: seo.description,
      images: [DEFAULT_OG_IMAGE],
    },
    category: 'food delivery',
  };
}

export function buildPageMetadata(
  pageKey: keyof typeof pageSeo,
  path: string,
  locale: SupportedLocale = 'en',
): Metadata {
  const seo = pageSeo[pageKey][locale] ?? pageSeo[pageKey].en;
  const url = `${SITE_URL}${path}`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: seo.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export const publicRoutes = [
  '',
  '/HomeScreen',
  '/AllProducts',
  '/StoreTypes',
  '/stores',
  '/services',
  '/properties',
  '/about',
  '/contact',
  '/careers',
  '/FAQ',
  '/TermsOfService',
  '/PrivacyPolicy',
  '/LoginScreenUser',
  '/SignupScreen',
] as const;
