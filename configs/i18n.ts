import translations, {
  SupportedLocale,
  TranslationKey,
  supportedLocales,
} from "./translations";

const DEFAULT_LOCALE: SupportedLocale = "en";
export const LANGUAGE_CHANGE_EVENT = "kudya:language-change";
export const LANGUAGE_STORAGE_KEY = "app_lang";
export const LANGUAGE_MANUAL_KEY = "app_lang_manual";

let languageCode: SupportedLocale = DEFAULT_LOCALE;

/** Call from server layout so SSR matches the resolved locale. */
export function initLanguage(code: SupportedLocale) {
  if (supportedLocales.includes(code)) {
    languageCode = code;
  }
}

export function localeFromAcceptLanguage(
  header: string | null | undefined,
): SupportedLocale {
  if (!header) return DEFAULT_LOCALE;
  const parts = header.split(",");
  for (const part of parts) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase() as SupportedLocale;
    if (supportedLocales.includes(code)) return code;
  }
  return DEFAULT_LOCALE;
}

export function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const lang of browserLanguages) {
    const code = lang.slice(0, 2).toLowerCase() as SupportedLocale;
    if (supportedLocales.includes(code)) return code;
  }
  return DEFAULT_LOCALE;
}

export function isManualLanguage(): boolean {
  if (typeof window === "undefined") return false;
  if (window.localStorage.getItem(LANGUAGE_MANUAL_KEY) === "1") return true;
  return document.cookie.split("; ").some((row) => row.startsWith(`${LANGUAGE_MANUAL_KEY}=1`));
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax`;
}

function persistLanguage(code: SupportedLocale, manual: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  writeCookie(LANGUAGE_STORAGE_KEY, code);
  if (manual) {
    window.localStorage.setItem(LANGUAGE_MANUAL_KEY, "1");
    writeCookie(LANGUAGE_MANUAL_KEY, "1");
  }
}

function readStoredLocale(): SupportedLocale | null {
  if (typeof window === "undefined") return null;
  const fromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LANGUAGE_STORAGE_KEY}=`))
    ?.split("=")[1];
  const fromStorage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const candidate = fromCookie || fromStorage;
  if (candidate && supportedLocales.includes(candidate as SupportedLocale)) {
    return candidate as SupportedLocale;
  }
  return null;
}

export function setLanguage(code: SupportedLocale) {
  languageCode = code;
  persistLanguage(code, true);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<{ locale: SupportedLocale }>(LANGUAGE_CHANGE_EVENT, {
        detail: { locale: code },
      }),
    );
  }
}

/**
 * Saved manual choice wins. Otherwise keep the browser language and do not
 * write a cookie, so the next request can still follow Accept-Language.
 */
export function syncLanguageFromClientStorage(): SupportedLocale {
  if (typeof window === "undefined") return languageCode;

  const stored = readStoredLocale();
  if (stored && isManualLanguage()) {
    languageCode = stored;
    return stored;
  }

  if (stored && !isManualLanguage()) {
    // Older sessions stored a locale without a manual flag. Treat that as a choice.
    languageCode = stored;
    persistLanguage(stored, true);
    return stored;
  }

  const detected = detectBrowserLanguage();
  languageCode = detected;
  return detected;
}

export function t(key: TranslationKey): string {
  return (
    translations[languageCode]?.[key] ||
    translations.en[key] ||
    key
  );
}

export function getLanguage(): SupportedLocale {
  return languageCode;
}
