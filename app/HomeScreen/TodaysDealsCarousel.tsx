"use client";
import React from "react";
import { Product } from "@/services/types";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserRegion } from "@/hooks/useUserRegion";

interface Props {
  deals: Product[];
}

const TodaysDealsSection: React.FC<Props> = ({ deals }) => {
  const { t, languageCode } = useTranslation();
  const { region: regionCode } = useUserRegion();

  if (!deals.length) return null;

  return (
    <section className="pt-1">
      <div className="flex items-center justify-between mb-5">
        <h2 className="brand-h2 text-slate-900 dark:text-white">
          {t("todaysDeals", "Today's deals")}
        </h2>
        <span className="brand-chip text-xs md:text-sm dark:bg-blue-900/30 dark:text-blue-300">
          {deals.length} {t("offers", "offers")}
        </span>
      </div>

      <div className="flex overflow-x-auto gap-4 scrollbar-thin scrollbar-thumb-blue-200 pb-2">
        {deals.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[250px] md:w-[270px]">
            <ProductCard
              product={product}
              regionCode={regionCode}
              language={languageCode}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TodaysDealsSection;
