"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchHomeModules, resolveWebModuleRoute, FALLBACK_HOME_MODULES, type HomeModule } from "@/services/platformApi";
import { isSuperAppModuleEnabled } from "@/lib/platformModules";
import type { SupportedLocale } from "@/configs/translations";

function ModuleSkeleton() {
  return (
    <div className="rounded-2xl min-h-[120px] bg-slate-200 dark:bg-slate-800 animate-pulse" />
  );
}

export default function SuperAppModules({ lang }: { lang?: SupportedLocale }) {
  const [modules, setModules] = useState<HomeModule[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, languageCode } = useTranslation();
  const currentLang = lang || languageCode;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchHomeModules(currentLang, "web")
      .then((res) => {
        if (!cancelled) setModules(res.length > 0 ? res : FALLBACK_HOME_MODULES.filter((m) => isSuperAppModuleEnabled(m.key)));
      })
      .catch(() => {
        if (!cancelled) {
          setModules(FALLBACK_HOME_MODULES.filter((m) => isSuperAppModuleEnabled(m.key)));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentLang]);

  return (
    <section>
      <p className="text-xs uppercase tracking-[0.2em] text-blue-600 font-semibold mb-1">Kudya</p>
      <h2 className="brand-h2 text-slate-900 dark:text-slate-100 mb-1">
        {t("everythingYouNeed", "Everything you need, in one app")}
      </h2>
      <p className="brand-muted text-sm mb-6">
        {t("yourLifeOneApp", "Your life, one app")}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, index) => <ModuleSkeleton key={index} />)
          : modules.map((mod) => {
              const gradientStart = mod.gradient?.[0] || mod.color || "#3B82F6";
              const gradientEnd = mod.gradient?.[1] || mod.color || "#1D4ED8";
              return (
                <Link
                  key={mod.id}
                  href={resolveWebModuleRoute(mod.route, mod.key)}
                  className="rounded-2xl p-4 min-h-[120px] flex flex-col justify-between text-white shadow-lg brand-motion-lift"
                  style={{
                    background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                  }}
                >
                  <span className="text-lg font-bold leading-tight">{mod.name}</span>
                  <span className="text-sm opacity-90 mt-2">{mod.description}</span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
