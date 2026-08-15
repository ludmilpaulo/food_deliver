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

const lastUpdate = 'August 2026';

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
        'You may register with email/password or sign in with Apple, Google, Facebook, or TikTok.',
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
      title: 'Social Login (Apple, Google, TikTok, and others)',
      paragraphs: [
        'If you choose "Continue with TikTok", Kudya uses TikTok Login Kit only to authenticate you and create or link your account. We receive your TikTok open identifier, display name, and avatar for your Kudya profile. We do not post to TikTok or access your TikTok videos.',
        'If you choose "Continue with Apple", Kudya uses Sign in with Apple to authenticate you. We receive Apple’s stable user identifier and, when you choose to share it, your name and email (which may be an Apple Private Relay address). Email is never treated as the only identity key.',
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
    'Your privacy matters. This policy explains how Kudya (operated by Ludmil Paulo / Kudya) collects, uses, shares, and protects personal information when you use the Kudya customer app, partner app, websites, and related services in Southern Africa. By using Kudya you acknowledge this policy.',
  lastUpdate: `Last updated: ${lastUpdate}`,
  sections: [
    {
      id: 'who',
      title: 'Who We Are',
      paragraphs: [
        'Kudya provides food delivery, shopping, services, rides, healthcare bookings, and property listings through web and mobile applications. For privacy questions contact privacy@kudya.store or support@kudya.store. Postal enquiries: Ludmil Paulo / Kudya, Southern Africa operations.',
      ],
    },
    {
      id: 'collect',
      title: 'Information We Collect',
      bullets: [
        'Account details: name, email, phone number, delivery address, and profile photo if you add one.',
        'Authentication data: email/password credentials and social login identifiers when you sign in with Google, Facebook, Apple, Instagram, or TikTok (display name and avatar only as provided by those providers).',
        'Order, booking, and payment-related data needed to process purchases, deliveries, stays, and services (card details are processed by payment partners; we do not store full card numbers).',
        'Device and usage data: device model, OS version, app version, IP address, language, crash logs, and in-app interactions.',
        'Precise or approximate location when you grant permission, used for delivery address autofill, courier tracking, ride matching, and nearby listings.',
        'Photos or documents you upload (for example KYC, property, or support attachments).',
        'Communications with support, including messages and email.',
      ],
    },
    {
      id: 'use',
      title: 'How We Use Data',
      bullets: [
        'Create and manage your account and authenticate sign-in.',
        'Process orders, deliveries, bookings, payments, refunds, and partner payouts.',
        'Show maps, directions, estimated times, and location-based services you request.',
        'Provide customer support and send transactional notifications (order status, security alerts).',
        'Improve safety, prevent fraud and abuse, and secure the platform.',
        'Analyse aggregated usage to improve product performance and reliability.',
        'Comply with legal, tax, and regulatory obligations.',
      ],
    },
    {
      id: 'share',
      title: 'How We Share Data',
      bullets: [
        'Merchants, drivers, partners, and property hosts as needed to fulfil your order or booking.',
        'Payment processors, SMS/email providers, map providers, and cloud hosting vendors that process data on our instructions.',
        'Authorities when required by law or to protect users, partners, or Kudya.',
        'We do not sell personal data to third parties for advertising.',
      ],
    },
    {
      id: 'permissions',
      title: 'App Permissions',
      bullets: [
        'Location — optional; used for delivery, rides, and nearby content when enabled.',
        'Camera / photos — optional; used when you upload images or documents.',
        'Notifications — optional; used for order and account alerts.',
        'You can revoke permissions in your device settings; some features may then be limited.',
      ],
    },
    {
      id: 'deletion',
      title: 'Data Deletion & Account Closure',
      paragraphs: [
        'You may request deletion of your Kudya account and associated personal data at any time. In the mobile app or website, open your account settings and choose Deactivate / Delete account if available, or email privacy@kudya.store or support@kudya.store with the subject “Delete my Kudya account” and the email or phone number registered on the account.',
        'We will verify your identity and delete or anonymise personal data within 30 days, except information we must retain for legal, security, fraud-prevention, accounting, or dispute-resolution purposes (for example completed order records required by law).',
      ],
      bullets: [
        'Access or correction requests: email privacy@kudya.store.',
        'Withdraw consent for optional processing (marketing or location) in-app or by contacting us.',
      ],
    },
    {
      id: 'rights',
      title: 'Your Rights',
      bullets: [
        'Request access to the personal data we hold about you.',
        'Request correction of inaccurate data.',
        'Request deletion as described above.',
        'Object to or restrict certain processing where applicable under local law.',
        'Lodge a complaint with a competent data protection authority in your country.',
      ],
    },
    {
      id: 'children',
      title: 'Children',
      paragraphs: [
        'Kudya is not directed to children under 13 (or the minimum age required in your country). We do not knowingly collect personal data from children. If you believe a child has provided data, contact privacy@kudya.store and we will delete it.',
      ],
    },
    {
      id: 'security',
      title: 'Security & Retention',
      paragraphs: [
        'We use encryption in transit (HTTPS/TLS), access controls, and monitoring to protect data. No method of transmission or storage is 100% secure. We retain personal data only as long as needed to provide services, resolve disputes, enforce agreements, and meet legal obligations, then delete or anonymise it.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. The “Last updated” date at the top will change when we do. Continued use of Kudya after an update means you acknowledge the revised policy. Material changes may also be communicated in-app or by email where appropriate.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      paragraphs: [
        'Privacy requests: privacy@kudya.store',
        'General support: support@kudya.store',
        'Web: https://sd-kudya.vercel.app/PrivacyPolicy and https://sd-kudya.vercel.app/contact',
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
    'A sua privacidade importa. Esta política explica como a Kudya recolhe, utiliza, partilha e protege dados pessoais nas apps e sites Kudya na África Austral.',
  lastUpdate: `Última atualização: ${lastUpdate}`,
  sections: [
    {
      id: 'who',
      title: 'Quem Somos',
      paragraphs: [
        'A Kudya opera entrega de comida, compras, serviços e imóveis. Contactos de privacidade: privacy@kudya.store ou support@kudya.store.',
      ],
    },
    {
      id: 'collect',
      title: 'Informações que Recolhemos',
      bullets: [
        'Dados de conta: nome, e-mail, telefone, morada.',
        'Dados de uso: dispositivo, IP, localização (se permitida).',
        'Informações de pedidos e pagamentos (processados por parceiros).',
        'Dados de login social (Google, Facebook, Apple, TikTok).',
        'Fotos ou documentos que carregar.',
      ],
    },
    {
      id: 'use',
      title: 'Como Utilizamos os Dados',
      bullets: [
        'Operar e melhorar os serviços Kudya.',
        'Processar pedidos, entregas e suporte.',
        'Segurança, prevenção de fraude e obrigações legais.',
      ],
    },
    {
      id: 'share',
      title: 'Partilha',
      bullets: [
        'Com comerciantes, entregadores e pagamentos para prestar o serviço.',
        'Quando exigido por lei.',
        'Não vendemos dados para publicidade de terceiros.',
      ],
    },
    {
      id: 'deletion',
      title: 'Eliminação de Dados e Conta',
      paragraphs: [
        'Pode pedir a eliminação da conta por e-mail para privacy@kudya.store ou support@kudya.store com o assunto “Eliminar a minha conta Kudya”. Tratamos o pedido em até 30 dias, salvo retenção legal obrigatória.',
      ],
    },
    {
      id: 'rights',
      title: 'Os Seus Direitos',
      bullets: [
        'Solicitar acesso, correção ou eliminação.',
        'Retirar consentimento quando aplicável.',
        'Contactar privacy@kudya.store.',
      ],
    },
    {
      id: 'children',
      title: 'Crianças',
      paragraphs: [
        'A Kudya não se destina a menores de 13 anos. Se um menor forneceu dados, contacte privacy@kudya.store.',
      ],
    },
    {
      id: 'security',
      title: 'Segurança',
      paragraphs: [
        'Utilizamos encriptação e controlos de acesso. Retemos dados apenas pelo tempo necessário ou exigido por lei.',
      ],
    },
    {
      id: 'contact',
      title: 'Contacto',
      paragraphs: [
        'privacy@kudya.store · support@kudya.store · https://sd-kudya.vercel.app/PrivacyPolicy',
      ],
    },
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
  intro:
    'Comment Kudya collecte, utilise, partage et protège vos données personnelles sur les apps et sites Kudya.',
  lastUpdate: `Dernière mise à jour : ${lastUpdate}`,
  sections: [
    { id: 'who', title: 'Qui nous sommes', paragraphs: ['Contact confidentialité : privacy@kudya.store ou support@kudya.store.'] },
    { id: 'collect', title: 'Données collectées', bullets: ['Compte, usage, commandes, localisation (si autorisée), connexion sociale, fichiers téléversés.'] },
    { id: 'use', title: 'Utilisation', bullets: ['Services, commandes, sécurité, obligations légales.'] },
    { id: 'share', title: 'Partage', bullets: ['Partenaires de livraison et paiement.', 'Jamais vendu pour publicité tierce.'] },
    {
      id: 'deletion',
      title: 'Suppression des données',
      paragraphs: [
        'Demandez la suppression de votre compte à privacy@kudya.store (objet « Delete my Kudya account »). Traitement sous 30 jours, sauf conservation légale.',
      ],
    },
    { id: 'rights', title: 'Vos droits', bullets: ['Accès, rectification, suppression sur demande.'] },
    { id: 'children', title: 'Enfants', paragraphs: ['Service non destiné aux moins de 13 ans.'] },
    { id: 'security', title: 'Sécurité', paragraphs: ["Chiffrement et contrôles d'accès."] },
    { id: 'contact', title: 'Contact', paragraphs: ['privacy@kudya.store · https://sd-kudya.vercel.app/PrivacyPolicy'] },
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
  intro: 'Cómo Kudya recopila, usa, comparte y protege tus datos personales en las apps y sitios de Kudya.',
  lastUpdate: `Última actualización: ${lastUpdate}`,
  sections: [
    { id: 'who', title: 'Quiénes somos', paragraphs: ['Contacto de privacidad: privacy@kudya.store o support@kudya.store.'] },
    { id: 'collect', title: 'Datos recopilados', bullets: ['Cuenta, uso, pedidos, ubicación (si se permite), inicio social, archivos subidos.'] },
    { id: 'use', title: 'Uso', bullets: ['Servicios, pedidos, seguridad y obligaciones legales.'] },
    { id: 'share', title: 'Compartir', bullets: ['Comerciantes, repartidores y pagos.', 'No vendemos datos para publicidad de terceros.'] },
    {
      id: 'deletion',
      title: 'Eliminación de datos',
      paragraphs: [
        'Solicita borrar tu cuenta en privacy@kudya.store (asunto «Delete my Kudya account»). Respondemos en 30 días, salvo retención legal.',
      ],
    },
    { id: 'rights', title: 'Tus derechos', bullets: ['Acceso, corrección y eliminación bajo petición.'] },
    { id: 'children', title: 'Niños', paragraphs: ['No dirigido a menores de 13 años.'] },
    { id: 'security', title: 'Seguridad', paragraphs: ['Cifrado y controles de acceso.'] },
    { id: 'contact', title: 'Contacto', paragraphs: ['privacy@kudya.store · https://sd-kudya.vercel.app/PrivacyPolicy'] },
  ],
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
