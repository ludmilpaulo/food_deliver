"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useGetAboutUsQuery } from "@/redux/slices/aboutApi";
import { motion } from "framer-motion";

type SupportedLang = "en" | "pt";

type TermsSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type TermsContent = {
  [lang in SupportedLang]: {
    title: string;
    intro: string;
    lastUpdate: string;
    sections: TermsSection[];
  };
};

const countryMap: Record<string, string> = {
  CV: "Cabo Verde",
  MZ: "Moçambique",
  AO: "Angola",
  ZA: "South Africa",
};

const langs = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];

const termsContent: TermsContent = {
  en: {
    title: "Terms of Service",
    intro:
      "These Terms of Service govern your use of Kudya's website, mobile apps, and related services. By creating an account or placing an order, you agree to these terms.",
    lastUpdate: "Last updated: June 2025",
    sections: [
      {
        id: "about-kudya",
        title: "About Kudya",
        content: (
          <p>
            Kudya is a food delivery and e-commerce platform serving customers in South Africa,
            Angola, Mozambique, and Cabo Verde. Users can browse restaurants and stores, place
            orders, track deliveries, and manage their account through our website and mobile apps.
          </p>
        ),
      },
      {
        id: "eligibility",
        title: "Eligibility & Accounts",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>You must be at least 18 years old or have parental consent to use Kudya.</li>
            <li>
              You may register with email and password or sign in with supported social providers
              (including TikTok, Google, and Facebook).
            </li>
            <li>
              You are responsible for keeping your login credentials secure and for activity under
              your account.
            </li>
            <li>You agree to provide accurate account information and keep it up to date.</li>
          </ul>
        ),
      },
      {
        id: "orders",
        title: "Orders, Payments & Delivery",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Prices, availability, and delivery times are shown before checkout.</li>
            <li>Orders are confirmed when payment is authorized or accepted by the merchant.</li>
            <li>Delivery partners and merchants may cancel or modify orders when necessary.</li>
            <li>Refunds and cancellations follow our support policies and local consumer laws.</li>
          </ul>
        ),
      },
      {
        id: "social-login",
        title: "Social Login (Including TikTok)",
        content: (
          <p>
            If you choose &quot;Continue with TikTok,&quot; Kudya uses TikTok Login Kit only to
            authenticate you and create or link your Kudya account. We receive your TikTok open
            identifier, display name, and profile avatar to personalize your account profile. We do
            not post to TikTok, access your TikTok videos, or use TikTok data for advertising
            without your consent. See our{" "}
            <a href="/PrivacyPolicy" className="text-blue-700 hover:underline font-semibold">
              Privacy Policy
            </a>{" "}
            for how we handle personal data.
          </p>
        ),
      },
      {
        id: "acceptable-use",
        title: "Acceptable Use",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Do not misuse the platform, harass others, or submit fraudulent orders.</li>
            <li>Do not attempt to reverse engineer, scrape, or disrupt Kudya services.</li>
            <li>Do not use Kudya for unlawful purposes in your country of use.</li>
          </ul>
        ),
      },
      {
        id: "liability",
        title: "Disclaimer & Limitation of Liability",
        content: (
          <p>
            Kudya connects customers with independent merchants and delivery partners. To the
            maximum extent permitted by law, Kudya is not liable for indirect or consequential
            damages arising from use of the platform. Nothing in these terms limits rights you may
            have under applicable consumer protection laws.
          </p>
        ),
      },
      {
        id: "changes",
        title: "Changes to These Terms",
        content: (
          <p>
            We may update these Terms of Service from time to time. Material changes will be
            communicated through the app or website. Continued use after changes take effect
            constitutes acceptance of the updated terms.
          </p>
        ),
      },
      {
        id: "contact",
        title: "Contact",
        content: (
          <p>
            For questions about these Terms of Service, please contact us using the details below.
          </p>
        ),
      },
    ],
  },
  pt: {
    title: "Termos de Serviço",
    intro:
      "Estes Termos de Serviço regem o uso do site, aplicativos móveis e serviços relacionados da Kudya. Ao criar uma conta ou fazer um pedido, você concorda com estes termos.",
    lastUpdate: "Última atualização: Junho 2025",
    sections: [
      {
        id: "about-kudya",
        title: "Sobre a Kudya",
        content: (
          <p>
            A Kudya é uma plataforma de entrega de comida e e-commerce que atende clientes na
            África do Sul, Angola, Moçambique e Cabo Verde. Os usuários podem explorar
            restaurantes e lojas, fazer pedidos, acompanhar entregas e gerenciar suas contas pelo
            site e pelos aplicativos móveis.
          </p>
        ),
      },
      {
        id: "eligibility",
        title: "Elegibilidade e Contas",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Você deve ter pelo menos 18 anos ou consentimento dos pais para usar a Kudya.</li>
            <li>
              Você pode se registrar com e-mail e senha ou entrar com provedores sociais
              compatíveis (incluindo TikTok, Google e Facebook).
            </li>
            <li>
              Você é responsável por manter suas credenciais seguras e pela atividade em sua
              conta.
            </li>
            <li>Você concorda em fornecer informações precisas e mantê-las atualizadas.</li>
          </ul>
        ),
      },
      {
        id: "orders",
        title: "Pedidos, Pagamentos e Entrega",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Preços, disponibilidade e prazos de entrega são exibidos antes do checkout.</li>
            <li>Pedidos são confirmados quando o pagamento é autorizado ou aceito pelo comerciante.</li>
            <li>Parceiros de entrega e comerciantes podem cancelar ou alterar pedidos quando necessário.</li>
            <li>Reembolsos e cancelamentos seguem nossas políticas de suporte e leis locais.</li>
          </ul>
        ),
      },
      {
        id: "social-login",
        title: "Login Social (Incluindo TikTok)",
        content: (
          <p>
            Se você escolher &quot;Continuar com TikTok,&quot; a Kudya usa o TikTok Login Kit
            apenas para autenticá-lo e criar ou vincular sua conta Kudya. Recebemos seu
            identificador aberto do TikTok, nome de exibição e avatar de perfil para personalizar
            sua conta. Não publicamos no TikTok, não acessamos seus vídeos do TikTok e não usamos
            dados do TikTok para publicidade sem seu consentimento. Consulte nossa{" "}
            <a href="/PrivacyPolicy" className="text-blue-700 hover:underline font-semibold">
              Política de Privacidade
            </a>{" "}
            para saber como tratamos dados pessoais.
          </p>
        ),
      },
      {
        id: "acceptable-use",
        title: "Uso Aceitável",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Não misuse a plataforma, assedie outros ou envie pedidos fraudulentos.</li>
            <li>Não tente fazer engenharia reversa, scraping ou interromper os serviços da Kudya.</li>
            <li>Não use a Kudya para fins ilegais no seu país de uso.</li>
          </ul>
        ),
      },
      {
        id: "liability",
        title: "Isenção e Limitação de Responsabilidade",
        content: (
          <p>
            A Kudya conecta clientes a comerciantes e parceiros de entrega independentes. Na
            máxima extensão permitida por lei, a Kudya não se responsabiliza por danos indiretos ou
            consequenciais decorrentes do uso da plataforma. Nada nestes termos limita direitos que
            você possa ter sob leis de proteção ao consumidor aplicáveis.
          </p>
        ),
      },
      {
        id: "changes",
        title: "Alterações nestes Termos",
        content: (
          <p>
            Podemos atualizar estes Termos de Serviço periodicamente. Alterações relevantes serão
            comunicadas pelo aplicativo ou site. O uso continuado após as alterações constitui
            aceitação dos termos atualizados.
          </p>
        ),
      },
      {
        id: "contact",
        title: "Contato",
        content: (
          <p>
            Para dúvidas sobre estes Termos de Serviço, entre em contato conosco pelos dados abaixo.
          </p>
        ),
      },
    ],
  },
};

function getUserCountryCode(): string {
  if (typeof window === "undefined") return "ZA";
  const browserLang = navigator.language;
  if (browserLang.includes("CV")) return "CV";
  if (browserLang.includes("MZ")) return "MZ";
  if (browserLang.includes("AO")) return "AO";
  return "ZA";
}

export default function TermsOfServicePage() {
  const [lang, setLang] = useState<SupportedLang>(
    typeof window !== "undefined"
      ? navigator.language.startsWith("pt")
        ? "pt"
        : "en"
      : "en"
  );

  useEffect(() => {
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }, [lang]);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState<string>(
    termsContent[lang].sections[0].id
  );

  useEffect(() => {
    function onScroll() {
      const offsets = termsContent[lang].sections.map((sec: TermsSection) => {
        const ref = sectionRefs.current[sec.id];
        if (!ref) return Number.MAX_SAFE_INTEGER;
        const rect = ref.getBoundingClientRect();
        return rect.top < 120 ? Math.abs(rect.top) : Number.MAX_SAFE_INTEGER;
      });
      const idx = offsets.indexOf(Math.min(...offsets));
      setActiveSection(termsContent[lang].sections[idx].id);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lang]);

  function scrollToSection(id: string) {
    const ref = sectionRefs.current[id];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const { data: aboutUsEntries = [], isLoading } = useGetAboutUsQuery();
  const userCountryCode = typeof window !== "undefined" ? getUserCountryCode() : "ZA";
  const countryName = countryMap[userCountryCode];
  const aboutUsData = useMemo(() => {
    if (!aboutUsEntries || !Array.isArray(aboutUsEntries)) return null;
    const found = aboutUsEntries.find(
      (entry: { title?: string }) =>
        entry.title && entry.title.toLowerCase().includes(countryName.toLowerCase())
    );
    return found || aboutUsEntries[0] || null;
  }, [aboutUsEntries, countryName]);

  const terms = termsContent[lang];

  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <aside className="w-full md:w-72 md:min-h-screen px-3 py-8 md:py-20 md:sticky top-0 bg-white/80 border-r border-blue-100 shadow-lg z-20">
        <div className="mb-6 flex flex-row justify-between items-center">
          <span className="text-2xl font-extrabold tracking-tight text-blue-900">
            {terms.title}
          </span>
          <div className="flex items-center space-x-1">
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as SupportedLang)}
                className={`px-3 py-1 font-bold rounded transition text-sm ${
                  lang === l.code
                    ? "bg-blue-800 text-white shadow"
                    : "bg-white text-blue-800 hover:bg-blue-200"
                }`}
                aria-label={`Switch to ${l.label}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {terms.sections.map((sec: TermsSection) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`text-left px-4 py-2 rounded font-semibold transition flex items-center text-blue-900 hover:text-yellow-500 hover:bg-yellow-50 ${
                activeSection === sec.id
                  ? "bg-blue-100 border-l-4 border-blue-800 text-blue-900 font-bold"
                  : ""
              }`}
            >
              {sec.title}
            </button>
          ))}
        </nav>
        <div className="mt-10 text-xs text-gray-400 hidden md:block">{terms.lastUpdate}</div>
      </aside>

      <section className="flex-1 max-w-3xl mx-auto px-2 md:px-8 py-8 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 border-b border-blue-100 pb-6"
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-blue-900 mb-2">
            {terms.title}
          </h1>
          <div className="text-gray-600 text-base mb-2">{terms.intro}</div>
          <div className="text-sm text-gray-400">{terms.lastUpdate}</div>
        </motion.div>

        {terms.sections.map((sec: TermsSection) => (
          <section
            key={sec.id}
            ref={(el) => {
              sectionRefs.current[sec.id] = el as HTMLDivElement | null;
            }}
            className="mb-12 scroll-mt-28"
            id={sec.id}
          >
            <motion.h2
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-blue-900 mb-4"
            >
              {sec.title}
            </motion.h2>
            <div className="text-gray-800 text-lg">{sec.content}</div>
          </section>
        ))}

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-24 max-w-2xl mx-auto bg-white/90 rounded-xl shadow-xl p-8 border-t-4 border-blue-200"
        >
          <h3 className="text-2xl font-bold text-blue-900 mb-2">
            {lang === "pt" ? "Contato local Kudya" : "Kudya Contact for Your Country"}
          </h3>
          {isLoading ? (
            <div className="text-blue-500 font-semibold py-6">Carregando...</div>
          ) : aboutUsData ? (
            <div className="space-y-1 text-gray-700 text-lg">
              <div>
                <span className="font-bold">{aboutUsData.title}</span>
              </div>
              <div>
                <span className="font-semibold">{aboutUsData.address}</span>
              </div>
              <div>
                {aboutUsData.phone && (
                  <a
                    href={`tel:${aboutUsData.phone}`}
                    className="text-blue-700 hover:underline font-semibold"
                  >
                    {aboutUsData.phone}
                  </a>
                )}
              </div>
              <div>
                {aboutUsData.email && (
                  <a
                    href={`mailto:${aboutUsData.email}`}
                    className="text-blue-700 hover:underline"
                  >
                    {aboutUsData.email}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-red-600 py-8">
              {lang === "pt"
                ? "Não foi possível carregar os contatos."
                : "Could not load contacts."}
            </div>
          )}
        </motion.section>
      </section>
    </main>
  );
}
