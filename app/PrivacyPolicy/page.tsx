"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useGetAboutUsQuery } from "@/redux/slices/aboutApi";
import { motion } from "framer-motion";
import Link from "next/link";

// --- Types
type SupportedLang = "en" | "pt";

type PolicySection = {
  id: string;
  title: string;
  content: JSX.Element;
};
type PolicyContent = {
  [lang in SupportedLang]: {
    title: string;
    intro: string;
    lastUpdate: string;
    sections: PolicySection[];
  };
};

// ---- LANGUAGE & COUNTRY DETECTION ----
function getUserCountryCode(): string {
  if (typeof window === "undefined") return "ZA";
  const lang = navigator.language;
  if (lang.includes("CV")) return "CV";
  if (lang.includes("MZ")) return "MZ";
  if (lang.includes("AO")) return "AO";
  return "ZA";
}
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

// ---- PRIVACY POLICY CONTENT (EN & PT) ----
const policyContent: PolicyContent = {
  en: {
    title: "Privacy Policy",
    intro:
      "Your privacy matters to us. This page explains how Kudya collects, uses, and protects your personal information, in full compliance with international and local data protection laws. Please read carefully.",
    lastUpdate: "Last updated: June 2025",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content: (
          <p>
            Welcome to Kudya. This Privacy Policy describes how we handle your data when you use our platform, apps, and services in South Africa, Angola, Mozambique, and Cabo Verde. By using Kudya, you agree to this policy.
          </p>
        ),
      },
      {
        id: "what-we-collect",
        title: "Information We Collect",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>
              <b>Account Info:</b> Name, email, phone, country, address, and other registration details.
            </li>
            <li>
              <b>Usage Data:</b> Device info, IP address, location (if you allow), and interactions.
            </li>
            <li>
              <b>Communications:</b> Messages, support requests, and feedback.
            </li>
            <li>
              <b>Third Parties:</b> Info shared via social login or payment providers.
            </li>
          </ul>
        ),
      },
      {
        id: "how-we-use",
        title: "How We Use Your Data",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Provide, operate, and improve Kudya’s services.</li>
            <li>Contact you for support, security, or service updates.</li>
            <li>Personalize your experience and show relevant offers.</li>
            <li>Ensure legal compliance and fraud prevention.</li>
          </ul>
        ),
      },
      {
        id: "data-sharing",
        title: "Data Sharing & Disclosure",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>With partners (stores, delivery, payment) only as needed to fulfill services.</li>
            <li>When required by law or court order.</li>
            <li>Never sold or disclosed for advertising without consent.</li>
          </ul>
        ),
      },
      {
        id: "security",
        title: "Security",
        content: (
          <p>
            We use modern security measures (encryption, access controls, audits) to keep your data safe. However, no platform can guarantee absolute security.
          </p>
        ),
      },
      {
        id: "user-rights",
        title: "Your Rights",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Access, update, or delete your data (request via contact below).</li>
            <li>Withdraw consent at any time.</li>
            <li>Request a copy of your personal data.</li>
          </ul>
        ),
      },
      {
        id: "cookies",
        title: "Cookies & Tracking",
        content: (
          <p>
            Kudya uses cookies and analytics to improve the platform. You can manage cookies in your browser settings.
          </p>
        ),
      },
      {
        id: "international",
        title: "International Data Transfer",
        content: (
          <p>
            Your data may be processed in countries where we or our partners operate. We always ensure adequate protection is in place.
          </p>
        ),
      },
      {
        id: "updates",
        title: "Policy Updates",
        content: (
          <p>
            We may update this policy as the law or our services evolve. We will notify users of significant changes.
          </p>
        ),
      },
      {
        id: "contact",
        title: "Contact for Privacy",
        content: (
          <p>
            If you have any questions or requests, please contact us below.
          </p>
        ),
      },
    ],
  },
  pt: {
    title: "Política de Privacidade",
    intro:
      "Sua privacidade é importante para nós. Esta página explica como a Kudya coleta, utiliza e protege suas informações pessoais, em conformidade com as leis de proteção de dados internacionais e locais. Leia com atenção.",
    lastUpdate: "Última atualização: Junho 2025",
    sections: [
      {
        id: "introduction",
        title: "Introdução",
        content: (
          <p>
            Bem-vindo à Kudya. Esta Política de Privacidade descreve como tratamos seus dados ao usar nossa plataforma, aplicativos e serviços na África do Sul, Angola, Moçambique e Cabo Verde. Ao utilizar a Kudya, você concorda com esta política.
          </p>
        ),
      },
      {
        id: "what-we-collect",
        title: "Quais Informações Coletamos",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>
              <b>Informações de Conta:</b> Nome, e-mail, telefone, país, endereço e outros dados de registro.
            </li>
            <li>
              <b>Dados de Uso:</b> Informações do dispositivo, IP, localização (se permitido) e interações.
            </li>
            <li>
              <b>Comunicações:</b> Mensagens, solicitações de suporte e feedback.
            </li>
            <li>
              <b>Terceiros:</b> Dados compartilhados via login social ou provedores de pagamento.
            </li>
          </ul>
        ),
      },
      {
        id: "how-we-use",
        title: "Como Utilizamos seus Dados",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Fornecer, operar e melhorar os serviços da Kudya.</li>
            <li>Entrar em contato para suporte, segurança ou atualizações.</li>
            <li>Personalizar sua experiência e exibir ofertas relevantes.</li>
            <li>Garantir conformidade legal e prevenção de fraudes.</li>
          </ul>
        ),
      },
      {
        id: "data-sharing",
        title: "Compartilhamento e Divulgação de Dados",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Com parceiros (lojas, entregas, pagamentos) apenas para prestação dos serviços.</li>
            <li>Quando exigido por lei ou ordem judicial.</li>
            <li>Nunca vendemos nem divulgamos para publicidade sem seu consentimento.</li>
          </ul>
        ),
      },
      {
        id: "security",
        title: "Segurança",
        content: (
          <p>
            Utilizamos medidas modernas de segurança (criptografia, controle de acesso, auditorias) para proteger seus dados. Contudo, nenhuma plataforma pode garantir segurança absoluta.
          </p>
        ),
      },
      {
        id: "user-rights",
        title: "Seus Direitos",
        content: (
          <ul className="list-disc ml-6 space-y-1">
            <li>Acessar, atualizar ou excluir seus dados (solicite via contato abaixo).</li>
            <li>Retirar seu consentimento a qualquer momento.</li>
            <li>Solicitar uma cópia dos seus dados pessoais.</li>
          </ul>
        ),
      },
      {
        id: "cookies",
        title: "Cookies e Rastreamento",
        content: (
          <p>
            A Kudya utiliza cookies e analytics para melhorar a plataforma. Você pode gerenciar os cookies nas configurações do navegador.
          </p>
        ),
      },
      {
        id: "international",
        title: "Transferência Internacional de Dados",
        content: (
          <p>
            Seus dados podem ser processados em países onde nós ou nossos parceiros atuamos. Sempre garantimos proteção adequada.
          </p>
        ),
      },
      {
        id: "updates",
        title: "Atualizações da Política",
        content: (
          <p>
            Podemos atualizar esta política conforme a legislação ou os serviços evoluam. Notificaremos sobre mudanças relevantes.
          </p>
        ),
      },
      {
        id: "contact",
        title: "Contato para Privacidade",
        content: (
          <p>
            Se você tiver dúvidas ou solicitações, entre em contato abaixo.
          </p>
        ),
      },
    ],
  },
};

export default function PrivacyPolicyPage() {
  // --- Detect Language ---
  const [lang, setLang] = useState<SupportedLang>(
    typeof window !== "undefined"
      ? (navigator.language.startsWith("pt") ? "pt" : "en")
      : "en"
  );
  // SEO: scroll to top on lang change
  useEffect(() => {
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }, [lang]);

  // --- Sidebar Scrollspy ---
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState<string>(
    policyContent[lang].sections[0].id
  );
  // Watch scroll to highlight
  useEffect(() => {
    function onScroll() {
      const offsets = policyContent[lang].sections.map((sec: PolicySection) => {
        const ref = sectionRefs.current[sec.id];
        if (!ref) return Number.MAX_SAFE_INTEGER;
        const rect = ref.getBoundingClientRect();
        return rect.top < 120 ? Math.abs(rect.top) : Number.MAX_SAFE_INTEGER;
      });
      const idx = offsets.indexOf(Math.min(...offsets));
      setActiveSection(policyContent[lang].sections[idx].id);
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

  // --- Country Contacts ---
  const { data: aboutUsEntries = [], isLoading } = useGetAboutUsQuery();
  function getUserCountryCode(): string {
    if (typeof window === "undefined") return "ZA";
    const lang = navigator.language;
    if (lang.includes("CV")) return "CV";
    if (lang.includes("MZ")) return "MZ";
    if (lang.includes("AO")) return "AO";
    return "ZA";
  }
  const userCountryCode =
    typeof window !== "undefined" ? getUserCountryCode() : "ZA";
  const countryName = countryMap[userCountryCode];
  const aboutUsData = useMemo(() => {
    if (!aboutUsEntries || !Array.isArray(aboutUsEntries)) return null;
    const found = aboutUsEntries.find(
      (entry: any) =>
        entry.title && entry.title.toLowerCase().includes(countryName.toLowerCase())
    );
    return found || aboutUsEntries[0] || null;
  }, [aboutUsEntries, countryName]);

  // --- Render ---
  const policy = policyContent[lang as SupportedLang];

  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Sidebar */}
      <aside className="w-full md:w-72 md:min-h-screen px-3 py-8 md:py-20 md:sticky top-0 bg-white/80 border-r border-blue-100 shadow-lg z-20">
        <div className="mb-6 flex flex-row justify-between items-center">
          <span className="text-2xl font-extrabold tracking-tight text-blue-900">
            {policy.title}
          </span>
          {/* Lang switcher */}
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
          {policy.sections.map((sec: PolicySection) => (
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
        <div className="mt-10 text-xs text-gray-400 hidden md:block">
          {policy.lastUpdate}
        </div>
      </aside>

      {/* Policy Content */}
      <section className="flex-1 max-w-3xl mx-auto px-2 md:px-8 py-8 md:py-20">
        {/* Hero / Header */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 border-b border-blue-100 pb-6"
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-blue-900 mb-2">
            {policy.title}
          </h1>
          <div className="text-gray-600 text-base mb-2">{policy.intro}</div>
          <div className="text-sm text-gray-400">{policy.lastUpdate}</div>
        </motion.div>

        {/* Sections */}
      {policy.sections.map((sec: PolicySection) => (
  <section
    key={sec.id}
    ref={(el) => {
      sectionRefs.current[sec.id] = el as HTMLDivElement | null;
    }}
    className="mb-12 scroll-mt-28"
    id={sec.id}
  >
    <motion.h2 /* ...rest unchanged */ >
      {sec.title}
    </motion.h2>
    <div className="text-gray-800 text-lg">{sec.content}</div>
  </section>
))}


        {/* Country Contact */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-24 max-w-2xl mx-auto bg-white/90 rounded-xl shadow-xl p-8 border-t-4 border-blue-200"
        >
          <h3 className="text-2xl font-bold text-blue-900 mb-2">
            {lang === "pt"
              ? "Contato local Kudya"
              : "Kudya Contact for Your Country"}
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
