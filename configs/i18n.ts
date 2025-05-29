import translations, {

  SupportedLocale,
  TranslationKey,
  supportedLocales,
} from "./translations";

// Always SSR-safe: defaults to English on server
let languageCode: SupportedLocale = "en";

// On client, try to set preferred browser language
export function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === "undefined") return "en";
  const browserLanguages =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const lang of browserLanguages) {
    const code = lang.slice(0, 2) as SupportedLocale;
    if (supportedLocales.includes(code)) {
      return code;
    }
  }
  return "en";
}

// Call this in a top-level useEffect on the client
export function setLanguageFromBrowser() {
  if (typeof window !== "undefined") {
    setLanguage(detectBrowserLanguage());
  }
}

// For runtime switching (user chooses language)
export function setLanguage(code: SupportedLocale) {
  languageCode = code;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("app_lang", code);
  }
}

// Load from localStorage if set
if (typeof window !== "undefined") {
  const stored = window.localStorage.getItem("app_lang");
  if (stored && supportedLocales.includes(stored as SupportedLocale)) {
    languageCode = stored as SupportedLocale;
  } else {
    setLanguageFromBrowser();
  }
}

export function t(key: TranslationKey): string {
  return (
    translations[languageCode]?.[key] ||
    translations["en"][key] ||
    key
  );
}

export function getLanguage(): SupportedLocale {
  return languageCode;
}
