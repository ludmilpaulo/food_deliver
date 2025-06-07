"use client";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Link from "next/link";
import { SocialIcon } from "react-social-icons";
import { motion } from "framer-motion";
import { useGetAboutUsQuery } from "@/redux/slices/aboutApi";
import Image from "next/image";
import { t, getLanguage } from "@/configs/i18n";
import { useMemo } from "react";

// Get user's country (for contacts)
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
  const { data: aboutUsEntries = [], isLoading, isError } = useGetAboutUsQuery();
  const userCountryCode =
    typeof window !== "undefined" ? getUserCountryCode() : "ZA";
  const countryName = countryMap[userCountryCode];
  const lang = getLanguage();

  // Get contact for user's country
  const aboutUsData = useMemo(() => {
    if (!aboutUsEntries || !Array.isArray(aboutUsEntries)) return null;
    const found = aboutUsEntries.find(
      (entry) =>
        entry.title && entry.title.toLowerCase().includes(countryName.toLowerCase())
    );
    return found || aboutUsEntries[0] || null;
  }, [aboutUsEntries, countryName]);

  // Colors
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

  return (
    <footer className={`relative ${gradient} text-white pt-2 pb-0 shadow-2xl border-t border-blue-100 z-10`}>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-800/30 via-yellow-300/10 to-transparent z-0"></div>
      <div className="relative container mx-auto px-4 py-10 z-10">
        <div className="flex flex-col md:flex-row gap-10 justify-between items-center md:items-start">
          {/* APP DOWNLOAD */}
          <div className="text-center md:text-left flex-1 space-y-4">
            <h4 className="text-lg font-extrabold text-blue-900 mb-2">
              {lang === "pt" ? "Baixe nosso app" : "Download our App"}
            </h4>
            <div className="flex justify-center md:justify-start space-x-3">
              <Link href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                <Image
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="App Store"
                  width={120}
                  height={40}
                  className="rounded-xl shadow hover:scale-105 focus:ring-2 ring-yellow-400/50 transition-all"
                />
              </Link>
              <Link href="https://play.google.com/store/apps/details?id=com.ludmil.kudyaclient" target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                <Image
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Google Play"
                  width={120}
                  height={40}
                  className="rounded-xl shadow hover:scale-105 focus:ring-2 ring-yellow-400/50 transition-all"
                />
              </Link>
            </div>
          </div>
          {/* CONTACT */}
          <div className="text-center md:text-left flex-1 space-y-4">
            <h4 className="text-lg font-extrabold text-blue-900 mb-2">
              {lang === "pt" ? "Contacte-nos" : "Contact Us"}
            </h4>
            <div className="space-y-2 text-sm">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <FaEnvelope className="w-5 h-5 text-blue-700" />
                <span className="font-bold text-black">
                  {aboutUsData.email ? (
                    <Link href={`mailto:${aboutUsData.email}`} className="hover:text-blue-900 underline transition">{aboutUsData.email}</Link>
                  ) : "--"}
                </span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <FaPhone className="w-5 h-5 text-blue-700" />
                <span className="font-bold text-black">
                  {aboutUsData.phone ? (
                    <Link href={`tel:${aboutUsData.phone}`} className="hover:text-blue-900 underline transition">{aboutUsData.phone}</Link>
                  ) : "--"}
                </span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <FaMapMarkerAlt className="w-5 h-5 text-blue-700" />
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
          {/* QUICK LINKS */}
          <div className="text-center md:text-right flex-1 space-y-4">
            <h4 className="text-lg font-extrabold text-blue-900 mb-2">{lang === "pt" ? "Links Rápidos" : "Quick Links"}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="hover:underline hover:text-yellow-400 font-bold text-black transition">
                  {lang === "pt" ? "Contacte-nos" : "Contact Us"}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:underline hover:text-yellow-400 font-bold text-black transition">
                  {lang === "pt" ? "Sobre Nós" : "About Us"}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:underline hover:text-yellow-400 font-bold text-black transition">
                  {lang === "pt" ? "Carreiras" : "Careers"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-10">
          <Link
            href="/PrivacyPolicy"
            aria-label={lang === "pt" ? "Ver Política de Privacidade" : "View Privacy Policy"}
            className="inline-block text-xs md:text-sm font-bold text-black drop-shadow hover:underline hover:text-blue-900 transition cursor-pointer"
          >
            &copy; {currentYear} Kudya. {lang === "pt" ? "Todos os direitos reservados." : "All rights reserved."}
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
