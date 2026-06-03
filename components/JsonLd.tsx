import { SITE_NAME, SITE_URL } from '@/configs/seo';

export default function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: 'https://www.kudya.shop/media/logo/azul.png',
    sameAs: [
      'https://play.google.com/store/apps/details?id=com.ludmil.kudyaclient',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Portuguese', 'French', 'Spanish'],
    },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ['en', 'pt', 'fr', 'es'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/AllProducts?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const mobileApp = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: SITE_NAME,
    operatingSystem: 'Android, iOS',
    applicationCategory: 'FoodApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    url: 'https://play.google.com/store/apps/details?id=com.ludmil.kudyaclient',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mobileApp) }}
      />
    </>
  );
}
