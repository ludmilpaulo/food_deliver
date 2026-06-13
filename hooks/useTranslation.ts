"use client";

import { useEffect, useState } from "react";
import {
  detectBrowserLanguage,
  getLanguage,
  setLanguage,
  syncLanguageFromClientStorage,
  t as localT,
  LANGUAGE_CHANGE_EVENT,
} from "@/configs/i18n";
import type { SupportedLocale, TranslationKey } from "@/configs/translations";
import { fetchApiTranslations } from "@/services/platformApi";
import { store } from "@/redux/store";
import { languageApi } from "@/redux/slices/languageApi";

const CACHE_KEY = "kudya_api_translations";

export function useTranslation(initialLocale?: SupportedLocale) {
  const [languageCode, setLanguageCode] = useState<SupportedLocale>(
    initialLocale ?? getLanguage(),
  );
  const [apiTranslations, setApiTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const synced = syncLanguageFromClientStorage();
    setLanguageCode(synced);

    store
      .dispatch(languageApi.endpoints.getLanguagePreference.initiate())
      .unwrap()
      .then((pref) => {
        if (pref.preferredLanguage) {
          setLanguage(pref.preferredLanguage);
          setLanguageCode(pref.preferredLanguage);
        }
      })
      .catch(() => {
        // Local/cookie language remains active when unauthenticated or offline.
      });
  }, []);

  useEffect(() => {
    const handleLanguageChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ locale?: SupportedLocale }>;
      const nextLocale = customEvent.detail?.locale;
      if (nextLocale) {
        setLanguageCode(nextLocale);
        return;
      }
      setLanguageCode(getLanguage());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "app_lang") {
        setLanguageCode(syncLanguageFromClientStorage());
      }
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChanged as EventListener);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChanged as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
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
    void store
      .dispatch(
        languageApi.endpoints.updateLanguagePreference.initiate({
          preferredLanguage: next,
          systemLanguage: detectBrowserLanguage(),
        }),
      )
      .unwrap()
      .catch(() => {
        // Local preference still applies.
      });
  };

  const t = (key: string, fallback?: string) => {
    if (apiTranslations[key]) return apiTranslations[key];
    const localValue = localT(key as TranslationKey);
    return localValue === key ? fallback ?? key : localValue;
  };

  return { t, languageCode, changeLanguage, apiTranslations };
}
