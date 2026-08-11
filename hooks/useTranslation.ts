"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectBrowserLanguage,
  getLanguage,
  setLanguage,
  syncLanguageFromClientStorage,
  t as localT,
  LANGUAGE_CHANGE_EVENT,
} from "@/configs/i18n";
import translations, {
  type SupportedLocale,
  type TranslationKey,
} from "@/configs/translations";
import { marketplaceT } from "@/configs/marketplaceTranslations";
import { homeT } from "@/configs/homeTranslations";
import { propertyApplicationT } from "@/configs/propertyApplicationTranslations";
import { fetchApiTranslations } from "@/services/platformApi";
import { store } from "@/redux/store";
import { languageApi } from "@/redux/slices/languageApi";

const CACHE_KEY = "kudya_api_translations";

function englishBaseline(key: string): string | undefined {
  const typed = translations.en[key as TranslationKey];
  if (typed) return typed;
  return (
    propertyApplicationT("en", key) ??
    homeT("en", key) ??
    marketplaceT("en", key)
  );
}

function localForLocale(locale: SupportedLocale, key: string): string | undefined {
  const app = propertyApplicationT(locale, key);
  if (app) return app;
  const home = homeT(locale, key);
  if (home) return home;
  const market = marketplaceT(locale, key);
  if (market) return market;
  const typed = localT(key as TranslationKey);
  if (typed !== key) return typed;
  const table = translations[locale] as Record<string, string> | undefined;
  if (table?.[key]) return table[key];
  return undefined;
}

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

  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>) => {
      const localValue = localForLocale(languageCode, key);
      const apiValue = apiTranslations[key];
      const enValue = englishBaseline(key);

      let resolved: string;
      if (apiValue) {
        if (
          languageCode !== "en" &&
          localValue &&
          enValue &&
          apiValue === enValue &&
          localValue !== enValue
        ) {
          resolved = localValue;
        } else {
          resolved = apiValue;
        }
      } else if (localValue) {
        resolved = localValue;
      } else {
        resolved = fallback ?? key;
      }

      if (!params) return resolved;
      return Object.entries(params).reduce(
        (acc, [name, value]) =>
          acc
            .replace(new RegExp(`\\{${name}\\}`, "g"), String(value))
            .replace(new RegExp(`\\{\\{${name}\\}\\}`, "g"), String(value)),
        resolved,
      );
    },
    [apiTranslations, languageCode],
  );

  return { t, languageCode, changeLanguage, apiTranslations };
}
