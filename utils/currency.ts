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
