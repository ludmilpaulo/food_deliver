"use client";
import { useGetAboutUsQuery } from "@/redux/slices/aboutApi";
import { getLanguage, t } from "@/configs/i18n";
import { useMemo } from "react";
import Link from "next/link";
import { SocialIcon } from "react-social-icons";
import { motion } from "framer-motion";
import Image from "next/image";

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

const AboutUs = () => {
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-bold text-gray-500 animate-pulse">
          {t("loading")}
        </span>
      </div>
    );
  if (isError || !aboutUsData)
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-bold text-red-500">{t("error")}</span>
      </div>
    );

  return (
    <div
      className="relative min-h-[90vh] w-full overflow-x-hidden flex items-center justify-center py-10"
      style={{
        backgroundImage: `linear-gradient(rgba(20,20,40,0.55),rgba(0,0,0,0.55)), url(${
          aboutUsData.backgroundApp || aboutUsData.backgroundImage || ""
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Glass Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        className="relative z-10 max-w-3xl w-full px-4 py-8 md:px-12 md:py-14 rounded-3xl bg-white/80 shadow-2xl backdrop-blur-lg border border-white/50"
      >
        {/* Floating Logo */}
        {aboutUsData.logo && (
          <div className="flex justify-center -mt-16 mb-2">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="rounded-full bg-white/70 shadow-lg border-2 border-blue-400 p-2"
            >
              <Image
                src={aboutUsData.logo}
                alt="Company Logo"
                width={80}
                height={80}
                className="rounded-full object-contain"
                priority
              />
            </motion.div>
          </div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-yellow-500 via-blue-600 to-blue-800 bg-clip-text text-transparent mb-6 tracking-tight"
        >
          {aboutUsData.title}
        </motion.h1>
        <div className="prose lg:prose-lg mx-auto text-gray-800 mb-6">
          <div dangerouslySetInnerHTML={{ __html: aboutUsData.about }} />
        </div>

        {/* Contact & Social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 mt-6">
          {/* Contact Info */}
          <div className="flex flex-col gap-2 text-base text-gray-700 w-full md:w-auto">
            {aboutUsData.email && (
              <span>
                <strong>Email:</strong>{" "}
                <Link
                  href={`mailto:${aboutUsData.email}`}
                  className="text-blue-700 hover:underline"
                >
                  {aboutUsData.email}
                </Link>
              </span>
            )}
            {aboutUsData.phone && (
              <span>
                <strong>{t("phone") || "Phone"}:</strong>{" "}
                <Link
                  href={`tel:${aboutUsData.phone}`}
                  className="text-blue-700 hover:underline"
                >
                  {aboutUsData.phone}
                </Link>
              </span>
            )}
            {aboutUsData.address && (
              <span>
                <strong>{t("address") || "Address"}:</strong>{" "}
                <span className="text-gray-900">{aboutUsData.address}</span>
              </span>
            )}
          </div>
          {/* Social Links */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex flex-row gap-3 justify-center md:justify-end"
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

        {/* Careers CTA */}
        <div className="flex justify-center mt-10">
          <Link href="/careers">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-yellow-400 text-white font-bold text-lg shadow-md transition hover:shadow-lg focus:outline-none border-2 border-white"
              aria-label="See Careers"
            >
              <span className="mr-2">🚀</span>
              {t("seeCareers") || "Explore Careers"}
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Background overlay for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-transparent to-yellow-400/40 z-0 pointer-events-none" />
    </div>
  );
};

export default AboutUs;
