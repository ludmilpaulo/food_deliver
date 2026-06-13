"use client";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Link from "next/link";
import { SocialIcon } from "react-social-icons";
import { motion } from "framer-motion";
import { useGetAboutUsQuery } from "@/redux/slices/aboutApi";
import Image from "next/image";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

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

const currentYear = new Date().getFullYear();

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { data: aboutUsEntries = [], isLoading, isError } = useGetAboutUsQuery();
  const userCountryCode =
    typeof window !== "undefined" ? getUserCountryCode() : "ZA";
  const countryName = countryMap[userCountryCode];

  const aboutUsData = useMemo(() => {
    if (!aboutUsEntries || !Array.isArray(aboutUsEntries)) return null;
    const found = aboutUsEntries.find(
      (entry) =>
        entry.title && entry.title.toLowerCase().includes(countryName.toLowerCase())
    );
    return found || aboutUsEntries[0] || null;
  }, [aboutUsEntries, countryName]);

  const gradient =
    "bg-gradient-to-br from-yellow-400 via-blue-50 to-blue-800";

  if (isLoading) {
    return (
      <footer className={gradient + " text-white"}>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="font-semibold animate-pulse">{t("loading")}</p>
        </div>
      </footer>
    );
  }
  if (isError || !aboutUsData) {
    return (
      <footer className={gradient + " text-white"}>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="font-semibold text-red-100">{t("error")}</p>
        </div>
      </footer>
    );
  }

  const legalLinks = [
    { href: "/FAQ", label: t("faq") },
    { href: "/TermsOfService", label: t("termsOfService") },
    { href: "/PrivacyPolicy", label: t("privacyPolicy") },
  ];

  const quickLinks = [
    { href: "/contact", label: t("contactUs") },
    { href: "/about", label: t("aboutUs") },
    { href: "/careers", label: t("seeCareers") },
  ];

  return (
    <footer className={`relative ${gradient} text-white pt-2 pb-0 shadow-2xl border-t border-blue-100 z-10`}>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-800/30 via-yellow-300/10 to-transparent z-0" />
      <div className="relative container mx-auto px-4 py-10 z-10">
        <p className="text-center text-sm font-semibold text-blue-900/80 mb-8 max-w-2xl mx-auto">
          {t("footerTagline")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* APP DOWNLOAD */}
          <div className="text-center md:text-left space-y-4">
            <h4 className="text-lg font-extrabold text-blue-900">
              {t("downloadApp")}
            </h4>
            <div className="flex justify-center md:justify-start space-x-3">
              <Link href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                <Image
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt={t("downloadKudyaAppStore", "Download Kudya on the App Store")}
                  width={120}
                  height={40}
                  className="rounded-xl shadow hover:scale-105 focus:ring-2 ring-yellow-400/50 transition-all"
                />
              </Link>
              <Link href="https://play.google.com/store/apps/details?id=com.ludmil.kudyaclient" target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                <Image
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt={t("downloadKudyaGooglePlay", "Get Kudya on Google Play")}
                  width={120}
                  height={40}
                  className="rounded-xl shadow hover:scale-105 focus:ring-2 ring-yellow-400/50 transition-all"
                />
              </Link>
            </div>
          </div>

          {/* LEGAL */}
          <div className="text-center md:text-left space-y-4">
            <h4 className="text-lg font-extrabold text-blue-900">{t("quickLinks")}</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:underline hover:text-yellow-500 font-bold text-black transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div className="text-center md:text-left space-y-4">
            <h4 className="text-lg font-extrabold text-blue-900">{t("aboutUs")}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:underline hover:text-yellow-400 font-bold text-black transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div className="text-center md:text-left space-y-4">
            <h4 className="text-lg font-extrabold text-blue-900">{t("contactUs")}</h4>
            <div className="space-y-2 text-sm">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <FaEnvelope className="w-5 h-5 text-blue-700 shrink-0" aria-hidden />
                <span className="font-bold text-black">
                  {aboutUsData.email ? (
                    <Link href={`mailto:${aboutUsData.email}`} className="hover:text-blue-900 underline transition">{aboutUsData.email}</Link>
                  ) : "--"}
                </span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <FaPhone className="w-5 h-5 text-blue-700 shrink-0" aria-hidden />
                <span className="font-bold text-black">
                  {aboutUsData.phone ? (
                    <Link href={`tel:${aboutUsData.phone}`} className="hover:text-blue-900 underline transition">{aboutUsData.phone}</Link>
                  ) : "--"}
                </span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <FaMapMarkerAlt className="w-5 h-5 text-blue-700 shrink-0" aria-hidden />
                <span className="font-bold text-black">{aboutUsData.address || "--"}</span>
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex space-x-3 mt-3 justify-center md:justify-start"
            >
              {aboutUsData.facebook && <SocialIcon url={aboutUsData.facebook} />}
              {aboutUsData.linkedin && <SocialIcon url={aboutUsData.linkedin} />}
              {aboutUsData.twitter && <SocialIcon url={aboutUsData.twitter} />}
              {aboutUsData.instagram && <SocialIcon url={aboutUsData.instagram} />}
              {aboutUsData.whatsapp && (
                <SocialIcon
                  url={`https://wa.me/${aboutUsData.whatsapp.replace(/\D/g, "")}`}
                  network="whatsapp"
                />
              )}
            </motion.div>
          </div>
        </div>

        <div className="text-center mt-10 pt-6 border-t border-blue-200/60">
          <p className="text-xs md:text-sm font-bold text-black drop-shadow">
            &copy; {currentYear} Kudya. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
