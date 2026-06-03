import { SupportedLocale } from '@/configs/translations';

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPageData = {
  title: string;
  intro: string;
  lastUpdate: string;
  sections: LegalSection[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqPageData = {
  title: string;
  intro: string;
  items: FaqItem[];
};

export type LegalPageKind = 'terms' | 'privacy' | 'faq';

const lastUpdate = 'June 2025';

const termsEn: LegalPageData = {
  title: 'Terms of Service',
  intro:
    'These Terms govern your use of Kudya websites, mobile apps, and related services. By creating an account or placing an order, you agree to these terms.',
  lastUpdate: `Last updated: ${lastUpdate}`,
  sections: [
    {
      id: 'about',
      title: 'About Kudya',
      paragraphs: [
        'Kudya is a food delivery and e-commerce super app serving customers in South Africa, Angola, Mozambique, and Cabo Verde. Users browse restaurants and stores, place orders, track deliveries, book services, and manage their account on web and mobile.',
      ],
    },
    {
      id: 'accounts',
      title: 'Accounts & Eligibility',
      bullets: [
        'You must be at least 18 years old or have parental consent.',
        'You may register with email/password or sign in with Google, Facebook, or TikTok.',
        'You are responsible for activity under your account and for keeping credentials secure.',
        'Provide accurate information and keep your profile up to date.',
      ],
    },
    {
      id: 'orders',
      title: 'Orders, Payments & Delivery',
      bullets: [
        'Prices and availability are shown before checkout.',
        'Orders are confirmed when payment is authorized or accepted by the merchant.',
        'Delivery times are estimates and may vary by location and demand.',
        'Refunds and cancellations follow merchant policies and applicable consumer law.',
      ],
    },
    {
      id: 'social',
      title: 'Social Login (Including TikTok)',
      paragraphs: [
        'If you choose "Continue with TikTok", Kudya uses TikTok Login Kit only to authenticate you and create or link your account. We receive your TikTok open identifier, display name, and avatar for your Kudya profile. We do not post to TikTok or access your TikTok videos.',
      ],
    },
    {
      id: 'conduct',
      title: 'Acceptable Use',
      bullets: [
        'Do not submit fraudulent orders or abuse drivers, merchants, or support staff.',
        'Do not scrape, reverse engineer, or disrupt the platform.',
        'Do not use Kudya for unlawful purposes in your country of use.',
      ],
    },
    {
      id: 'liability',
      title: 'Disclaimer',
      paragraphs: [
        'Kudya connects customers with independent merchants and delivery partners. To the extent permitted by law, Kudya is not liable for indirect damages arising from use of the platform. Your statutory consumer rights remain unaffected.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes',
      paragraphs: [
        'We may update these Terms from time to time. Continued use after changes take effect constitutes acceptance of the updated Terms.',
      ],
    },
  ],
};

const privacyEn: LegalPageData = {
  title: 'Privacy Policy',
  intro:
    'Your privacy matters. This policy explains how Kudya collects, uses, and protects personal information when you use our platform in Southern Africa.',
  lastUpdate: `Last updated: ${lastUpdate}`,
  sections: [
    {
      id: 'collect',
      title: 'Information We Collect',
      bullets: [
        'Account details: name, email, phone, address, and registration data.',
        'Usage data: device, IP, location (if permitted), and in-app interactions.',
        'Order and payment information processed through our partners.',
        'Social login data when you sign in with Google, Facebook, or TikTok.',
      ],
    },
    {
      id: 'use',
      title: 'How We Use Data',
      bullets: [
        'Provide, operate, and improve Kudya services.',
        'Process orders, deliveries, and customer support.',
        'Personalize offers and secure the platform.',
        'Comply with legal obligations and prevent fraud.',
      ],
    },
    {
      id: 'share',
      title: 'Sharing',
      bullets: [
        'With merchants, couriers, and payment providers to fulfill services.',
        'When required by law or to protect safety and rights.',
        'We do not sell personal data for third-party advertising.',
      ],
    },
    {
      id: 'rights',
      title: 'Your Rights',
      bullets: [
        'Request access, correction, or deletion of your data.',
        'Withdraw consent where processing is consent-based.',
        'Contact us using the details at the bottom of this page.',
      ],
    },
    {
      id: 'security',
      title: 'Security & Retention',
      paragraphs: [
        'We use encryption, access controls, and monitoring to protect data. We retain information only as long as needed for the purposes described or as required by law.',
      ],
    },
  ],
};

const faqEn: FaqPageData = {
  title: 'Frequently Asked Questions',
  intro:
    'Quick answers about ordering, delivery, accounts, and support on Kudya. Available in English, Portuguese, French, and Spanish — switch language from the menu above.',
  items: [
    {
      id: 'what-is-kudya',
      question: 'What is Kudya?',
      answer:
        'Kudya is a super app for food delivery, local shopping, services, and property listings across Southern Africa. Order from restaurants and stores on the web or mobile apps.',
    },
    {
      id: 'countries',
      question: 'Which countries does Kudya serve?',
      answer:
        'Kudya operates in South Africa, Angola, Mozambique, and Cabo Verde. Availability of stores and delivery zones may vary by city.',
    },
    {
      id: 'place-order',
      question: 'How do I place an order?',
      answer:
        'Browse stores or products, add items to your cart, enter your delivery address at checkout, and complete payment. You can track your order from your account dashboard.',
    },
    {
      id: 'tiktok-login',
      question: 'How does TikTok login work?',
      answer:
        'Tap "Continue with TikTok" on login or sign up. Kudya uses TikTok only to verify your identity and create your account — we read your display name and avatar, not your videos.',
    },
    {
      id: 'payment',
      question: 'What payment methods are accepted?',
      answer:
        'Available methods depend on your country and merchant. Supported options appear at checkout, including card and local payment partners where enabled.',
    },
    {
      id: 'delivery-time',
      question: 'How long does delivery take?',
      answer:
        'Estimated times are shown before you confirm your order. Actual delivery depends on distance, traffic, merchant preparation time, and courier availability.',
    },
    {
      id: 'track-order',
      question: 'How can I track my order?',
      answer:
        'Sign in and open your dashboard to see live order status, from preparation to delivery.',
    },
    {
      id: 'cancel-refund',
      question: 'Can I cancel or get a refund?',
      answer:
        'Cancellation rules depend on order status and the merchant. Contact support promptly if something went wrong — we will help according to our policies and local consumer law.',
    },
    {
      id: 'languages',
      question: 'Is Kudya available in my language?',
      answer:
        'Yes. Kudya supports English, Portuguese, French, and Spanish on the website and in the apps. Change language from the top navigation menu.',
    },
    {
      id: 'support',
      question: 'How do I contact support?',
      answer:
        'Use the Contact page, email your local Kudya office shown in the footer, or message us on WhatsApp/social channels where listed.',
    },
  ],
};

const termsPt: LegalPageData = {
  title: 'Termos de Serviço',
  intro:
    'Estes Termos regem o uso dos sites, apps móveis e serviços da Kudya. Ao criar conta ou fazer pedido, você concorda com estes termos.',
  lastUpdate: `Última atualização: ${lastUpdate}`,
  sections: [
    {
      id: 'about',
      title: 'Sobre a Kudya',
      paragraphs: [
        'A Kudya é uma super app de entrega de comida e e-commerce na África do Sul, Angola, Moçambique e Cabo Verde.',
      ],
    },
    {
      id: 'accounts',
      title: 'Contas e Elegibilidade',
      bullets: [
        'Deve ter pelo menos 18 anos ou consentimento dos pais.',
        'Pode registar-se com e-mail/senha ou entrar com Google, Facebook ou TikTok.',
        'É responsável pela atividade na sua conta.',
        'Forneça informações precisas e mantenha o perfil atualizado.',
      ],
    },
    {
      id: 'orders',
      title: 'Pedidos, Pagamentos e Entrega',
      bullets: [
        'Preços e disponibilidade são exibidos antes do checkout.',
        'Pedidos confirmados quando o pagamento é autorizado.',
        'Prazos de entrega são estimativas.',
        'Reembolsos seguem políticas do comerciante e lei local.',
      ],
    },
    {
      id: 'social',
      title: 'Login Social (Incluindo TikTok)',
      paragraphs: [
        'Se escolher "Continuar com TikTok", a Kudya usa o TikTok Login Kit apenas para autenticação e criação de conta. Recebemos identificador, nome e avatar — não acedemos aos seus vídeos.',
      ],
    },
    {
      id: 'conduct',
      title: 'Uso Aceitável',
      bullets: [
        'Não envie pedidos fraudulentos nem abuse de staff ou entregadores.',
        'Não faça scraping ou engenharia reversa da plataforma.',
        'Não use a Kudya para fins ilegais.',
      ],
    },
    {
      id: 'liability',
      title: 'Isenção de Responsabilidade',
      paragraphs: [
        'A Kudya conecta clientes a comerciantes e parceiros independentes. Os seus direitos de consumidor permanecem aplicáveis.',
      ],
    },
    {
      id: 'changes',
      title: 'Alterações',
      paragraphs: ['Podemos atualizar estes Termos periodicamente.'],
    },
  ],
};

const privacyPt: LegalPageData = {
  title: 'Política de Privacidade',
  intro:
    'A sua privacidade importa. Esta política explica como a Kudya recolhe, utiliza e protege dados pessoais na África Austral.',
  lastUpdate: `Última atualização: ${lastUpdate}`,
  sections: [
    { id: 'collect', title: 'Informações que Recolhemos', bullets: ['Dados de conta: nome, e-mail, telefone, morada.', 'Dados de uso: dispositivo, IP, localização (se permitida).', 'Informações de pedidos e pagamentos.', 'Dados de login social (Google, Facebook, TikTok).'] },
    { id: 'use', title: 'Como Utilizamos os Dados', bullets: ['Operar e melhorar os serviços Kudya.', 'Processar pedidos, entregas e suporte.', 'Personalizar ofertas e proteger a plataforma.', 'Cumprir obrigações legais.'] },
    { id: 'share', title: 'Partilha', bullets: ['Com comerciantes, entregadores e pagamentos para prestar o serviço.', 'Quando exigido por lei.', 'Não vendemos dados para publicidade de terceiros.'] },
    { id: 'rights', title: 'Os Seus Direitos', bullets: ['Solicitar acesso, correção ou eliminação.', 'Retirar consentimento quando aplicável.', 'Contactar-nos pelos dados no rodapé.'] },
    { id: 'security', title: 'Segurança', paragraphs: ['Utilizamos encriptação e controlos de acesso. Retemos dados apenas pelo tempo necessário.'] },
  ],
};

const faqPt: FaqPageData = {
  title: 'Perguntas Frequentes',
  intro:
    'Respostas rápidas sobre pedidos, entregas, contas e suporte na Kudya. Disponível em português, inglês, francês e espanhol.',
  items: faqEn.items.map((item, i) => ({
    ...item,
    question: [
      'O que é a Kudya?',
      'Em que países a Kudya opera?',
      'Como faço um pedido?',
      'Como funciona o login com TikTok?',
      'Que métodos de pagamento são aceites?',
      'Quanto tempo demora a entrega?',
      'Como acompanho o meu pedido?',
      'Posso cancelar ou pedir reembolso?',
      'A Kudya está no meu idioma?',
      'Como contacto o suporte?',
    ][i],
    answer: [
      'A Kudya é uma super app de entrega, compras locais, serviços e imóveis na África Austral.',
      'Operamos na África do Sul, Angola, Moçambique e Cabo Verde.',
      'Explore lojas, adicione ao carrinho, checkout com morada e pagamento.',
      'Toque em "Continuar com TikTok" — usamos apenas nome e avatar para a sua conta.',
      'Depende do país; opções aparecem no checkout.',
      'Tempos estimados são mostrados antes de confirmar.',
      'Entre na sua conta e abra o painel de pedidos.',
      'Regras variam conforme estado do pedido; contacte suporte.',
      'Sim — inglês, português, francês e espanhol.',
      'Use a página Contacto ou os dados no rodapé.',
    ][i],
  })),
};

const termsFr: LegalPageData = {
  title: "Conditions d'utilisation",
  intro:
    "Ces conditions régissent l'utilisation des sites, applications et services Kudya. En créant un compte ou en passant commande, vous les acceptez.",
  lastUpdate: `Dernière mise à jour : ${lastUpdate}`,
  sections: [
    { id: 'about', title: 'À propos de Kudya', paragraphs: ["Kudya est une super app de livraison de repas et d'e-commerce en Afrique australe."] },
    { id: 'accounts', title: 'Comptes', bullets: ['18 ans minimum ou consentement parental.', 'Inscription e-mail ou connexion Google, Facebook, TikTok.', 'Vous êtes responsable de votre compte.'] },
    { id: 'orders', title: 'Commandes', bullets: ['Prix affichés avant paiement.', 'Délais estimés.', 'Remboursements selon politique marchande et loi locale.'] },
    { id: 'social', title: 'Connexion TikTok', paragraphs: ['TikTok sert uniquement à la connexion — nom et avatar pour votre profil Kudya.'] },
    { id: 'conduct', title: 'Usage acceptable', bullets: ['Pas de fraude ni d\'abus.', 'Pas de scraping ni d\'usage illégal.'] },
    { id: 'liability', title: 'Responsabilité', paragraphs: ['Kudya met en relation clients et commerçants indépendants.'] },
    { id: 'changes', title: 'Modifications', paragraphs: ['Nous pouvons mettre à jour ces conditions.'] },
  ],
};

const privacyFr: LegalPageData = {
  title: 'Politique de confidentialité',
  intro: 'Comment Kudya collecte, utilise et protège vos données personnelles.',
  lastUpdate: `Dernière mise à jour : ${lastUpdate}`,
  sections: [
    { id: 'collect', title: 'Données collectées', bullets: ['Compte, usage, commandes, connexion sociale.'] },
    { id: 'use', title: 'Utilisation', bullets: ['Services, commandes, sécurité, obligations légales.'] },
    { id: 'share', title: 'Partage', bullets: ['Partenaires de livraison et paiement.', 'Jamais vendu pour publicité tierce.'] },
    { id: 'rights', title: 'Vos droits', bullets: ['Accès, rectification, suppression sur demande.'] },
    { id: 'security', title: 'Sécurité', paragraphs: ['Chiffrement et contrôles d\'accès.'] },
  ],
};

const faqFr: FaqPageData = {
  title: 'Questions fréquentes',
  intro: 'Réponses sur les commandes, livraisons et compte Kudya.',
  items: [
    { id: 'what-is-kudya', question: "Qu'est-ce que Kudya ?", answer: 'Super app de livraison, shopping et services en Afrique australe.' },
    { id: 'countries', question: 'Quels pays ?', answer: 'Afrique du Sud, Angola, Mozambique, Cap-Vert.' },
    { id: 'place-order', question: 'Comment commander ?', answer: 'Parcourez, ajoutez au panier, payez au checkout.' },
    { id: 'tiktok-login', question: 'Connexion TikTok ?', answer: 'Authentification uniquement — pas d\'accès à vos vidéos.' },
    { id: 'payment', question: 'Paiements ?', answer: 'Options visibles au checkout selon votre pays.' },
    { id: 'delivery-time', question: 'Délai de livraison ?', answer: 'Estimation affichée avant confirmation.' },
    { id: 'track-order', question: 'Suivi commande ?', answer: 'Tableau de bord utilisateur.' },
    { id: 'cancel-refund', question: 'Annulation / remboursement ?', answer: 'Contactez le support rapidement.' },
    { id: 'languages', question: 'Langues ?', answer: 'Anglais, portugais, français, espagnol.' },
    { id: 'support', question: 'Support ?', answer: 'Page Contact ou coordonnées en pied de page.' },
  ],
};

const termsEs: LegalPageData = {
  title: 'Términos de servicio',
  intro: 'Estos términos rigen el uso de los sitios, apps y servicios de Kudya.',
  lastUpdate: `Última actualización: ${lastUpdate}`,
  sections: termsFr.sections.map((s, i) => ({
    ...s,
    title: ['Sobre Kudya', 'Cuentas', 'Pedidos', 'Inicio con TikTok', 'Uso aceptable', 'Responsabilidad', 'Cambios'][i],
    paragraphs: s.paragraphs?.map((p) =>
      [
        'Kudya es una super app de comida a domicilio y e-commerce en África Austral.',
        'TikTok solo se usa para iniciar sesión — nombre y avatar en tu perfil.',
        'Kudya conecta clientes con comercios independientes.',
        'Podemos actualizar estos términos.',
      ].find((_, j) => s.paragraphs && j === i) ?? p,
    ),
  })),
};

const privacyEs: LegalPageData = {
  title: 'Política de privacidad',
  intro: 'Cómo Kudya recopila, usa y protege tus datos personales.',
  lastUpdate: `Última actualización: ${lastUpdate}`,
  sections: privacyFr.sections.map((s, i) => ({
    ...s,
    title: ['Datos recopilados', 'Uso', 'Compartir', 'Tus derechos', 'Seguridad'][i],
  })),
};

const faqEs: FaqPageData = {
  title: 'Preguntas frecuentes',
  intro: 'Respuestas sobre pedidos, entregas y cuenta en Kudya.',
  items: faqFr.items.map((item, i) => ({
    ...item,
    question: [
      '¿Qué es Kudya?',
      '¿En qué países?',
      '¿Cómo pedir?',
      '¿Inicio con TikTok?',
      '¿Pagos?',
      '¿Tiempo de entrega?',
      '¿Seguimiento?',
      '¿Cancelar / reembolso?',
      '¿Idiomas?',
      '¿Soporte?',
    ][i],
    answer: [
      'Super app de comida, compras y servicios en África Austral.',
      'Sudáfrica, Angola, Mozambique, Cabo Verde.',
      'Explora, añade al carrito y paga.',
      'Solo autenticación — sin acceso a tus videos.',
      'Opciones en el checkout según tu país.',
      'Estimación antes de confirmar.',
      'Panel de usuario.',
      'Contacta soporte pronto.',
      'Inglés, portugués, francés, español.',
      'Página Contacto o pie de página.',
    ][i],
  })),
};

const pages: Record<
  SupportedLocale,
  { terms: LegalPageData; privacy: LegalPageData; faq: FaqPageData }
> = {
  en: { terms: termsEn, privacy: privacyEn, faq: faqEn },
  pt: { terms: termsPt, privacy: privacyPt, faq: faqPt },
  fr: { terms: termsFr, privacy: privacyFr, faq: faqFr },
  es: { terms: termsEs, privacy: privacyEs, faq: faqEs },
};

export function getLegalContent(kind: LegalPageKind, locale: SupportedLocale) {
  const bundle = pages[locale] ?? pages.en;
  return bundle[kind];
}

export function getFaqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
