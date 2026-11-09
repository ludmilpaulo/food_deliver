"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  fetchHomeModules,
  type HomeModule,
  type ClientPlatform,
} from "@/services/platformApi";
import CategoryCard from "./CategoryCard";

function CategorySkeleton() {
  return <div className="rounded-2xl min-h-[128px] bg-slate-200 dark:bg-slate-800 animate-pulse" />;
}

type CategoryGridProps = {
  lang?: string;
  platform?: ClientPlatform;
  showHeader?: boolean;
  columnsClassName?: string;
};

export default function CategoryGrid({
  lang,
  platform = "web",
  showHeader = true,
  columnsClassName = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
}: CategoryGridProps) {
  const { t, languageCode } = useTranslation();
  const currentLang = (lang || languageCode) as typeof languageCode;
  const [modules, setModules] = useState<HomeModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHomeModules(currentLang, platform)
      .then((data) => {
        if (!cancelled) setModules(data);
      })
      .catch(() => {
        if (!cancelled) setError(t("error", "Something went wrong"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentLang, platform, t]);

  return (
    <section>
      {showHeader && (
        <>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 font-semibold mb-1">
            Kudya
          </p>
          <h2 className="brand-h2 text-slate-900 dark:text-slate-100 mb-1">
            {t("everythingYouNeed", "Everything you need, in one app")}
          </h2>
          <p className="brand-muted text-sm mb-6">
            {t("yourLifeOneApp", "Your life, one app")}
          </p>
        </>
      )}

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className={`grid ${columnsClassName} gap-4`}>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <CategorySkeleton key={i} />)
          : modules.length === 0
            ? (
              <p className="col-span-full text-center text-slate-500 py-8">
                {t("noCategories", "No categories available right now.")}
              </p>
            )
            : modules.map((mod) => <CategoryCard key={mod.id} module={mod} />)}
      </div>
    </section>
  );
}
