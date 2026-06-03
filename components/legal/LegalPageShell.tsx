"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGetAboutUsQuery } from "@/redux/slices/aboutApi";
import {
  FaqPageData,
  getFaqJsonLd,
  getLegalContent,
  LegalPageData,
  LegalPageKind,
} from "@/configs/legalPages";
import { getLanguage, setLanguage, t } from "@/configs/i18n";
import { SupportedLocale, supportedLocales } from "@/configs/translations";

const countryMap: Record<string, string> = {
  CV: "Cabo Verde",
  MZ: "Moçambique",
  AO: "Angola",
  ZA: "South Africa",
};

const LANG_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  pt: "Português",
  fr: "Français",
  es: "Español",
};

function getUserCountryCode(): string {
  if (typeof window === "undefined") return "ZA";
  const browserLang = navigator.language;
  if (browserLang.includes("CV")) return "CV";
  if (browserLang.includes("MZ")) return "MZ";
  if (browserLang.includes("AO")) return "AO";
  return "ZA";
}

function renderSectionBody(section: LegalPageData["sections"][0]) {
  return (
    <>
      {section.paragraphs?.map((text) => (
        <p key={text.slice(0, 24)} className="mb-3 leading-relaxed">
          {text}
        </p>
      ))}
      {section.bullets && (
        <ul className="list-disc ml-6 space-y-2">
          {section.bullets.map((item) => (
            <li key={item.slice(0, 24)}>{item}</li>
          ))}
        </ul>
      )}
    </>
  );
}

type Props = {
  kind: LegalPageKind;
};

export default function LegalPageShell({ kind }: Props) {
  const [lang, setLang] = useState<SupportedLocale>(getLanguage());
  const content = getLegalContent(kind, lang);
  const isFaq = kind === "faq";
  const faqContent = isFaq ? (content as FaqPageData) : null;
  const legalContent = !isFaq ? (content as LegalPageData) : null;

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState(
    isFaq ? faqContent!.items[0]?.id : legalContent!.sections[0]?.id,
  );
  const [openFaq, setOpenFaq] = useState<string | null>(faqContent?.items[0]?.id ?? null);

  useEffect(() => {
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }, [lang]);

  useEffect(() => {
    if (isFaq || !legalContent) return;
    const sections = legalContent.sections;
    function onScroll() {
      const offsets = sections.map((sec) => {
        const ref = sectionRefs.current[sec.id];
        if (!ref) return Number.MAX_SAFE_INTEGER;
        const rect = ref.getBoundingClientRect();
        return rect.top < 120 ? Math.abs(rect.top) : Number.MAX_SAFE_INTEGER;
      });
      const idx = offsets.indexOf(Math.min(...offsets));
      setActiveSection(sections[idx]?.id);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lang, isFaq, legalContent]);

  useEffect(() => {
    if (!isFaq || !faqContent) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(getFaqJsonLd(faqContent.items));
    script.id = "faq-jsonld";
    document.head.appendChild(script);
    return () => {
      document.getElementById("faq-jsonld")?.remove();
    };
  }, [isFaq, faqContent, lang]);

  const { data: aboutUsEntries = [], isLoading } = useGetAboutUsQuery();
  const countryName = countryMap[getUserCountryCode()];
  const aboutUsData = useMemo(() => {
    if (!aboutUsEntries || !Array.isArray(aboutUsEntries)) return null;
    const found = aboutUsEntries.find(
      (entry: { title?: string }) =>
        entry.title && entry.title.toLowerCase().includes(countryName.toLowerCase()),
    );
    return found || aboutUsEntries[0] || null;
  }, [aboutUsEntries, countryName]);

  const switchLang = (code: SupportedLocale) => {
    setLanguage(code);
    setLang(code);
    document.documentElement.lang = code;
  };

  const navLinks = [
    { href: "/FAQ", label: t("faq") },
    { href: "/TermsOfService", label: t("termsOfService") },
    { href: "/PrivacyPolicy", label: t("privacyPolicy") },
  ];

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <aside className="w-full lg:w-80 lg:min-h-screen px-4 py-8 lg:py-16 lg:sticky lg:top-16 bg-white/90 border-b lg:border-b-0 lg:border-r border-blue-100 shadow-sm z-10">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
            Kudya
          </p>
          <h1 className="text-2xl font-black text-blue-950 leading-tight">
            {content.title}
          </h1>
        </div>

        <div className="mb-6">
          <label htmlFor="legal-lang" className="sr-only">
            {t("language")}
          </label>
          <select
            id="legal-lang"
            value={lang}
            onChange={(e) => switchLang(e.target.value as SupportedLocale)}
            className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {supportedLocales.map((code) => (
              <option key={code} value={code}>
                {LANG_LABELS[code]}
              </option>
            ))}
          </select>
        </div>

        {!isFaq && legalContent && (
          <nav className="hidden lg:flex flex-col gap-1 mb-8" aria-label="Page sections">
            {legalContent.sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() =>
                  sectionRefs.current[sec.id]?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  activeSection === sec.id
                    ? "bg-blue-100 text-blue-900 border-l-4 border-blue-700"
                    : "text-blue-800 hover:bg-blue-50"
                }`}
              >
                {sec.title}
              </button>
            ))}
          </nav>
        )}

        <nav className="flex flex-wrap gap-2 text-xs font-bold text-blue-800">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-full border transition ${
                (kind === "faq" && link.href === "/FAQ") ||
                (kind === "terms" && link.href === "/TermsOfService") ||
                (kind === "privacy" && link.href === "/PrivacyPolicy")
                  ? "bg-blue-900 text-white border-blue-900"
                  : "bg-white border-blue-200 hover:border-yellow-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {"lastUpdate" in content && (
          <p className="mt-8 text-xs text-slate-400 hidden lg:block">{content.lastUpdate}</p>
        )}
      </aside>

      <section className="flex-1 max-w-3xl mx-auto px-4 md:px-10 py-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 p-8 text-white shadow-xl"
        >
          <p className="text-blue-100 text-sm font-medium mb-2">{content.title}</p>
          <p className="text-lg leading-relaxed text-white/95">{content.intro}</p>
          {"lastUpdate" in content && (
            <p className="mt-4 text-xs text-blue-200 lg:hidden">{content.lastUpdate}</p>
          )}
        </motion.div>

        {isFaq && faqContent && (
          <div className="space-y-3">
            {faqContent.items.map((item, index) => {
              const open = openFaq === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : item.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-bold text-blue-950">{item.question}</span>
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition ${
                        open ? "bg-yellow-400 text-blue-900 rotate-45" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 text-slate-700 leading-relaxed border-t border-blue-50 pt-4">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isFaq &&
          legalContent?.sections.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              ref={(el) => {
                sectionRefs.current[sec.id] = el;
              }}
              className="mb-12 scroll-mt-28"
            >
              <h2 className="text-2xl font-bold text-blue-950 mb-4 pb-2 border-b border-blue-100">
                {sec.title}
              </h2>
              <div className="text-slate-700 text-lg">{renderSectionBody(sec)}</div>
            </section>
          ))}

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl bg-white border border-blue-100 shadow-lg p-8"
        >
          <h3 className="text-xl font-bold text-blue-950 mb-4">{t("contactUs")}</h3>
          {isLoading ? (
            <p className="text-blue-500 animate-pulse">{t("loading")}</p>
          ) : aboutUsData ? (
            <div className="space-y-2 text-slate-700">
              <p className="font-semibold text-blue-900">{aboutUsData.title}</p>
              <p>{aboutUsData.address}</p>
              {aboutUsData.phone && (
                <a href={`tel:${aboutUsData.phone}`} className="block text-blue-700 hover:underline font-medium">
                  {aboutUsData.phone}
                </a>
              )}
              {aboutUsData.email && (
                <a href={`mailto:${aboutUsData.email}`} className="block text-blue-700 hover:underline">
                  {aboutUsData.email}
                </a>
              )}
            </div>
          ) : (
            <p className="text-slate-500">{t("error")}</p>
          )}
          <Link
            href="/contact"
            className="inline-flex mt-6 items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 text-white font-bold text-sm shadow hover:shadow-md transition"
          >
            {t("contactUs")} →
          </Link>
        </motion.aside>
      </section>
    </main>
  );
}
