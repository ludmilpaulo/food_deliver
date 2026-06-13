import translations, {
  SupportedLocale,
  TranslationKey,
  supportedLocales,
} from "./translations";

const DEFAULT_LOCALE: SupportedLocale = "pt";
export const LANGUAGE_CHANGE_EVENT = "kudya:language-change";

let languageCode: SupportedLocale = DEFAULT_LOCALE;

/** Call from server layout so SSR matches the `app_lang` cookie. */
export function initLanguage(code: SupportedLocale) {
  if (supportedLocales.includes(code)) {
    languageCode = code;
  }
}

export function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const browserLanguages =
    navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const lang of browserLanguages) {
    const code = lang.slice(0, 2) as SupportedLocale;
    if (supportedLocales.includes(code)) return code;
  }
  return DEFAULT_LOCALE;
}

function persistLanguage(code: SupportedLocale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("app_lang", code);
  document.cookie = `app_lang=${code};path=/;max-age=31536000;SameSite=Lax`;
}

export function setLanguageFromBrowser() {
  if (typeof window !== "undefined") {
    setLanguage(detectBrowserLanguage());
  }
}

export function setLanguage(code: SupportedLocale) {
  languageCode = code;
  persistLanguage(code);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<{ locale: SupportedLocale }>(LANGUAGE_CHANGE_EVENT, {
        detail: { locale: code },
      }),
    );
  }
}

/** Sync client state from cookie/localStorage after hydration (no module-level reads). */
export function syncLanguageFromClientStorage(): SupportedLocale {
  if (typeof window === "undefined") return languageCode;

  const fromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("app_lang="))
    ?.split("=")[1];

  const stored =
    (fromCookie && supportedLocales.includes(fromCookie as SupportedLocale)
      ? (fromCookie as SupportedLocale)
      : null) ??
    (() => {
      const ls = window.localStorage.getItem("app_lang");
      return ls && supportedLocales.includes(ls as SupportedLocale)
        ? (ls as SupportedLocale)
        : null;
    })();

  if (stored) {
    languageCode = stored;
    return stored;
  }

  const detected = detectBrowserLanguage();
  languageCode = detected;
  persistLanguage(detected);
  return detected;
}

export function t(key: TranslationKey): string {
  if (languageCode === "pt") {
    return (
      translations.pt[key] ||
      translations.en[key] ||
      key
    );
  }

  return (
    translations[languageCode]?.[key] ||
    translations.en[key] ||
    translations.pt[key] ||
    key
  );
}

export function getLanguage(): SupportedLocale {
  return languageCode;
}
