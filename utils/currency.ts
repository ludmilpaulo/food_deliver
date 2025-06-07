// utils/currency.ts

export type RegionCode =
  | "ZA" | "AO" | "MZ" | "CV" | "PT" | "BR" | "GW" | "ST" | "TL" | "GQ"
  | "SN" | "ZW" | "BW" | "NA" | "ZM" | "BF" | "NG";

export type CurrencyCode =
  | "ZAR" | "AOA" | "MZN" | "CVE" | "EUR" | "BRL" | "XOF" | "STN" | "USD"
  | "XAF" | "ZWL" | "BWP" | "NAD" | "ZMW" | "NGN";

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
];
