"use client";

import { useEffect, useState } from "react";
import { detectBrowserLanguage } from "@/configs/i18n";
import type { SupportedLocale } from "@/configs/translations";
import { useTranslation } from "@/hooks/useTranslation";

const MODE_KEY = "app_lang_mode";

const PRIMARY: { code: SupportedLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
];

export default function PropertyLanguageCard() {
  const { t, languageCode, changeLanguage } = useTranslation();
  const [mode, setMode] = useState<"auto" | "manual">("manual");

  useEffect(() => {
    if (window.localStorage.getItem(MODE_KEY) === "auto") setMode("auto");
  }, []);

  const chooseAutomatic = () => {
    window.localStorage.setItem(MODE_KEY, "auto");
    setMode("auto");
    changeLanguage(detectBrowserLanguage());
  };

  const choose = (code: SupportedLocale) => {
    window.localStorage.setItem(MODE_KEY, "manual");
    setMode("manual");
    changeLanguage(code);
  };

  const rowClass = (active: boolean) =>
    `flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${
      active ? "bg-violet-600 font-semibold text-white" : "text-slate-800 hover:bg-violet-50"
    }`;

  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
        {t("languageSettings", "Language")}
      </p>
      <div className="mt-3 space-y-1">
        <button type="button" className={rowClass(mode === "auto")} onClick={chooseAutomatic}>
          <span>{t("languageAutomatic", "Automatic")}</span>
          {mode === "auto" ? <span>✓</span> : null}
        </button>
        {PRIMARY.map((item) => {
          const active = mode === "manual" && languageCode === item.code;
          return (
            <button key={item.code} type="button" className={rowClass(active)} onClick={() => choose(item.code)}>
              <span>{item.label}</span>
              {active ? <span>✓</span> : null}
            </button>
          );
        })}
        <button
          type="button"
          className={rowClass(mode === "manual" && languageCode === "es")}
          onClick={() => choose("es")}
        >
          <span>Español</span>
          {mode === "manual" && languageCode === "es" ? <span>✓</span> : null}
        </button>
      </div>
      <p className="mt-3 border-t border-violet-100 pt-3 text-sm text-slate-600">
        {t("languagePreviewLine", "Find your next home")}
      </p>
    </section>
  );
}
