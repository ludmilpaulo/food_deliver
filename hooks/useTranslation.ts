"use client";

import { useEffect, useState } from "react";
import {
  getLanguage,
  setLanguage,
  syncLanguageFromClientStorage,
  t as localT,
} from "@/configs/i18n";
import type { SupportedLocale, TranslationKey } from "@/configs/translations";
import { fetchApiTranslations } from "@/services/platformApi";

const CACHE_KEY = "kudya_api_translations";

export function useTranslation(initialLocale?: SupportedLocale) {
  const [languageCode, setLanguageCode] = useState<SupportedLocale>(
    initialLocale ?? getLanguage(),
  );
  const [apiTranslations, setApiTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const synced = syncLanguageFromClientStorage();
    setLanguageCode(synced);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${CACHE_KEY}_${languageCode}`;

    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        setApiTranslations(JSON.parse(cached) as Record<string, string>);
      }
    } catch {
      // Cache is opportunistic only.
    }

    fetchApiTranslations(languageCode)
      .then((bundle) => {
        if (cancelled) return;
        setApiTranslations(bundle);
        try {
          window.localStorage.setItem(cacheKey, JSON.stringify(bundle));
        } catch {
          // Cache failures should not block translation rendering.
        }
      })
      .catch(() => {
        // Local fallback remains available.
      });

    return () => {
      cancelled = true;
    };
  }, [languageCode]);

  const changeLanguage = (next: SupportedLocale) => {
    setLanguage(next);
    setLanguageCode(next);
  };

  const t = (key: string, fallback?: string) => {
    if (apiTranslations[key]) return apiTranslations[key];
    const localValue = localT(key as TranslationKey);
    return localValue === key ? fallback ?? key : localValue;
  };

  return { t, languageCode, changeLanguage, apiTranslations };
}
