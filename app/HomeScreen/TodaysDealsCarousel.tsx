"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/services/types";
import { t } from "@/configs/i18n";
import ProductCard from "@/components/ProductCard";
import { getCurrencyForCountry } from "@/utils/currency";

interface Props {
  deals: Product[];
}

const TodaysDealsSection: React.FC<Props> = ({ deals }) => {
  const [regionCode, setRegionCode] = useState<string>("ZA");
  const [language, setLanguage] = useState<string>("en");

  useEffect(() => {
    const lang = navigator.language || "en-ZA";
    setLanguage(lang.startsWith("pt") ? "pt" : "en");
    setRegionCode(lang.split("-")[1] || "ZA");
  }, []);

  if (!deals.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pt-4 pb-16">
      {/* Heading */}
      <div className="glassy px-6 py-3 mb-8 rounded-xl bg-white/60 backdrop-blur-md shadow-xl flex items-center justify-center">
        <span className="text-2xl mr-3">🔥</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
          {t("todaysDeals")}
        </h2>
        <span className="text-2xl ml-3">⚡️</span>
      </div>

      {/* Horizontally scrollable product cards */}
      <div className="flex overflow-x-auto gap-6 scrollbar-thin scrollbar-thumb-blue-200 pb-3">
        {deals.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[260px]">
            <ProductCard
              product={product}
              regionCode={regionCode}
              language={language}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TodaysDealsSection;
