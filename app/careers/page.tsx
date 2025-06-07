"use client";
import { fetchAboutUsData } from "@/services/information";
import { AboutUsData } from "@/services/types";
import { useEffect, useState, useMemo } from "react";
import { ApplicationModal } from "./ApplicationModal";
import { CareerCard } from "./CareerCard";
import { CareerPosition } from "./types";
import { useCareers } from "./useCareers";
import { t } from "@/configs/i18n";
import { motion, AnimatePresence } from "framer-motion";

// Helper to detect country
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

export default function CareersPage() {
  const { careers, loading, error } = useCareers();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<{ id: number; title: string }>({ id: 0, title: "" });
  const [headerData, setHeaderData] = useState<AboutUsData | null>(null);

  // Detect user's country on client
  const userCountryCode = typeof window !== "undefined" ? getUserCountryCode() : "ZA";
  const countryName = countryMap[userCountryCode];

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAboutUsData();
      setHeaderData(data);
    };
    fetchData();
  }, []);

  // Filter careers for the user's country
  const visibleCareers = useMemo(() => {
    if (!careers) return [];
    return careers.filter((career) =>
      career.location?.toLowerCase().includes(countryName.toLowerCase())
    );
  }, [careers, countryName]);

  const handleApplyClick = (career: CareerPosition) => {
    setSelectedCareer({ id: career.id, title: career.title });
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-20">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-10 flex flex-col items-center"
      >
        {headerData?.logo && (
          <img
            src={headerData.logo}
            alt="Company Logo"
            className="w-20 h-20 rounded-full shadow-xl mb-4 border-4 border-yellow-300"
          />
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 bg-gradient-to-r from-blue-600 via-yellow-400 to-blue-900 bg-clip-text text-transparent drop-shadow-lg">
          {t("careerOpportunities") || "Oportunidades de Carreira"}
        </h1>
        <p className="text-center text-gray-500 mb-2 max-w-2xl mx-auto text-lg">
          {t("careerSubtitle") ||
            "Construa o futuro com a gente. Veja as vagas disponíveis para o seu país."}
        </p>
      </motion.div>

      {/* Status/Loading/Error */}
      {loading && (
        <p className="text-center font-semibold text-blue-500 animate-pulse py-10">
          {t("loading") || "Carregando..."}
        </p>
      )}
      {error && (
        <p className="text-center font-semibold text-red-500 py-10">
          {t("error") || "Erro ao carregar vagas"}
        </p>
      )}

      <AnimatePresence>
        {!loading && !error && visibleCareers.length === 0 && (
          <motion.p
            key="no-careers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-center text-gray-500 text-xl"
          >
            {t("noOpenings") || "Nenhuma vaga disponível para o seu país no momento."}
          </motion.p>
        )}

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-8"
        >
          {visibleCareers.map((career) => (
            <motion.div
              key={career.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.45 }}
            >
              <CareerCard
                career={career}
                onClick={() => handleApplyClick(career)}
                applyLabel={t("applyNow") || "Candidatar-se"}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <ApplicationModal
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        careerTitle={selectedCareer.title}
        careerId={selectedCareer.id}
      />

      {/* Company brand (bottom) */}
      {headerData && (
        <div className="mt-20 flex flex-col items-center">
          {headerData.logo && (
            <img
              src={headerData.logo}
              alt="Company Logo"
              className="w-12 h-12 rounded-full shadow-lg mb-2"
            />
          )}
          <p className="text-gray-400 text-sm font-semibold">{headerData.title}</p>
        </div>
      )}
    </div>
  );
}
