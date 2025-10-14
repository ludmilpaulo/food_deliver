// utils/currency.ts

export type RegionCode =
  | "ZA" | "AO" | "MZ" | "CV" | "PT" | "BR" | "GW" | "ST" | "TL" | "GQ"
  | "SN" | "ZW" | "BW" | "NA" | "ZM" | "BF" | "NG" | "US" | "GB" | "KE" | "GH" | "EG";

export type CurrencyCode =
  | "ZAR" | "AOA" | "MZN" | "CVE" | "EUR" | "BRL" | "XOF" | "STN" | "USD"
  | "XAF" | "ZWL" | "BWP" | "NAD" | "ZMW" | "NGN" | "GBP" | "KES" | "GHS" | "EGP";

const regionCurrencyMap: Record<RegionCode, CurrencyCode> = {
  ZA: "ZAR",
  AO: "AOA",
  MZ: "MZN",
  CV: "CVE",
  PT: "EUR",
  BR: "BRL",
  GW: "XOF",
  ST: "STN",
  TL: "USD",
  GQ: "XAF",
  SN: "XOF",
  ZW: "USD",
  BW: "BWP",
  NA: "NAD",
  ZM: "ZMW",
  BF: "XOF",
  NG: "NGN",
  US: "USD",
  GB: "GBP",
  KE: "KES",
  GH: "GHS",
  EG: "EGP",
};

const currencySymbols: Record<CurrencyCode, string> = {
  ZAR: "R",
  AOA: "Kz",
  MZN: "MT",
  CVE: "$",
  EUR: "€",
  BRL: "R$",
  XOF: "CFA",
  STN: "Db",
  USD: "$",
  XAF: "FCFA",
  ZWL: "Z$",
  BWP: "P",
  NAD: "N$",
  ZMW: "K",
  NGN: "₦",
  GBP: "£",
  KES: "KSh",
  GHS: "GH₵",
  EGP: "E£",
};

export function getCurrencyForCountry(region?: string): CurrencyCode {
  if (!region) return "USD";
  return (regionCurrencyMap as any)[region] || "USD";
}

export function formatCurrency(
  amount: number | undefined | null,
  code: CurrencyCode = "USD",
  lang: string = "en"
) {
  if (typeof amount !== "number" || isNaN(amount)) return "";
  try {
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencySymbols[code] || ""}${(amount ?? 0).toFixed(2)}`;
  }
}

export const supportedRegionList: { code: RegionCode; label: string; flag: string }[] = [
  { code: "ZA", label: "South Africa", flag: "🇿🇦" },
  { code: "AO", label: "Angola", flag: "🇦🇴" },
  { code: "MZ", label: "Mozambique", flag: "🇲🇿" },
  { code: "CV", label: "Cape Verde", flag: "🇨🇻" },
  { code: "PT", label: "Portugal", flag: "🇵🇹" },
  { code: "BR", label: "Brazil", flag: "🇧🇷" },
  { code: "GW", label: "Guinea-Bissau", flag: "🇬🇼" },
  { code: "ST", label: "São Tomé & Príncipe", flag: "🇸🇹" },
  { code: "TL", label: "Timor-Leste", flag: "🇹🇱" },
  { code: "GQ", label: "Equatorial Guinea", flag: "🇬🇶" },
  { code: "SN", label: "Senegal", flag: "🇸🇳" },
  { code: "ZW", label: "Zimbabwe", flag: "🇿🇼" },
  { code: "BW", label: "Botswana", flag: "🇧🇼" },
  { code: "NA", label: "Namibia", flag: "🇳🇦" },
  { code: "ZM", label: "Zambia", flag: "🇿🇲" },
  { code: "BF", label: "Burkina Faso", flag: "🇧🇫" },
  { code: "NG", label: "Nigeria", flag: "🇳🇬" },
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "KE", label: "Kenya", flag: "🇰🇪" },
  { code: "GH", label: "Ghana", flag: "🇬🇭" },
  { code: "EG", label: "Egypt", flag: "🇪🇬" },
];

/**
 * Detect user's country from browser geolocation API
 */
export async function detectUserCountry(): Promise<RegionCode> {
  try {
    // Try to get from localStorage first
    const storedRegion = localStorage.getItem("userRegion");
    if (storedRegion && regionCurrencyMap[storedRegion as RegionCode]) {
      return storedRegion as RegionCode;
    }

    // Try geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code as RegionCode;
    
    if (countryCode && regionCurrencyMap[countryCode]) {
      localStorage.setItem("userRegion", countryCode);
      return countryCode;
    }
    
    // Default to Angola
    return "AO";
  } catch (error) {
    console.error('Error detecting country:', error);
    return "AO"; // Default to Angola
  }
}

/**
 * Set user's region manually
 */
export function setUserRegion(region: RegionCode): void {
  localStorage.setItem("userRegion", region);
}

/**
 * Get stored user region or default
 */
export function getUserRegion(): RegionCode {
  const storedRegion = localStorage.getItem("userRegion");
  if (storedRegion && regionCurrencyMap[storedRegion as RegionCode]) {
    return storedRegion as RegionCode;
  }
  return "AO"; // Default to Angola
}

// Currency conversion functionality
const BASE_CURRENCY = "AOA"; // Angolan Kwanza
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API || "https://www.kudya.shop";

/**
 * Fetch latest exchange rates from backend
 */
export async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const cached = localStorage.getItem("exchangeRates");
    const cacheTime = localStorage.getItem("exchangeRatesTime");
    
    // Use cached rates if less than 12 hours old
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < 12 * 60 * 60 * 1000) { // 12 hours
        return JSON.parse(cached);
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/currency/rates/`);
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }
    
    const data = await response.json();
    const rates = data.rates || {};
    
    // Cache the rates
    localStorage.setItem("exchangeRates", JSON.stringify(rates));
    localStorage.setItem("exchangeRatesTime", Date.now().toString());
    
    return rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    
    // Return cached rates if available, even if old
    const cached = localStorage.getItem("exchangeRates");
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  }
}

/**
 * Convert amount from base currency (AOA) to target currency
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const rates = await fetchExchangeRates();
  if (!rates) {
    return amount; // Return original if rates unavailable
  }
  
  // Convert from base to target
  if (fromCurrency === BASE_CURRENCY) {
    const rate = rates[toCurrency] || 1;
    return amount * rate;
  }
  
  // Convert from target to base
  if (toCurrency === BASE_CURRENCY) {
    const rate = rates[fromCurrency] || 1;
    return rate > 0 ? amount / rate : amount;
  }
  
  // Convert via base currency
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  const amountInBase = fromRate > 0 ? amount / fromRate : amount;
  return amountInBase * toRate;
}

/**
 * Format currency with conversion from base currency
 */
export async function formatCurrencyWithConversion(
  amountInBaseCurrency: number,
  targetCode: CurrencyCode = "AOA",
  lang: string = "en"
): Promise<string> {
  try {
    const convertedAmount = await convertCurrency(
      amountInBaseCurrency,
      "AOA" as CurrencyCode,
      targetCode
    );
    
    return formatCurrency(convertedAmount, targetCode, lang);
  } catch (error) {
    // Fallback to original amount if conversion fails
    return formatCurrency(amountInBaseCurrency, targetCode, lang);
  }
}
