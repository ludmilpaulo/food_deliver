import { baseAPI } from "./types";
import type { SupportedLocale } from "@/configs/translations";

export type ClientPlatform = "web" | "mobile" | "parceiro" | "customer";

export type HomeModule = {
  id: number;
  key: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  gradient: [string, string];
  route: string;
  isActive: boolean;
  availableOnWeb: boolean;
  availableOnMobile: boolean;
  availableOnParceiro?: boolean;
  sortOrder: number;
};

type RawHomeModule = Partial<HomeModule> & {
  id?: number;
  key?: string;
  title?: string;
  subtitle?: string;
  short_description?: string;
  gradient_start?: string;
  gradient_end?: string;
  order?: number;
  display_order?: number;
  route?: string;
};

export type BusinessCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  gradient: [string, string];
  dashboard_route: string;
  feature_keys: string[];
  isActive: boolean;
  availableOnWeb: boolean;
  availableOnMobile: boolean;
  availableOnParceiro?: boolean;
  sortOrder: number;
};

export type BusinessProfileCategory =
  | "restaurant"
  | "grocery"
  | "property"
  | "stay"
  | "doctor"
  | "service_provider"
  | "car_rental"
  | "courier"
  | "business";

export type BusinessProfile = {
  id: number;
  businessName: string;
  category: BusinessProfileCategory;
  dashboardRoute: string;
  isApproved: boolean;
  isActive: boolean;
};

/** Client-side route wiring for known keys — not a service catalog. */
const WEB_MODULE_ROUTES_BY_KEY: Record<string, string> = {
  food: "/food",
  groceries: "/groceries",
  property: "/properties",
  accommodation: "/stay",
  stay: "/stay",
  services: "/services",
  car_rental: "/car-rental",
  package: "/send-package",
  wallet: "/wallet",
  business: "/business",
  doctors: "/Doctors",
  doctor: "/Doctors",
  healthcare: "/Doctors",
  rides: "/rides",
};

const LEGACY_MODULE_ROUTES: Record<string, string> = {
  Food: "/stores",
  Grocery: "/stores",
  Groceries: "/stores",
  Rides: "/rides",
  SendPackage: "/send-package",
  CarRental: "/car-rental",
  Doctors: "/Doctors",
  Services: "/services",
  Accommodation: "/properties",
  Stay: "/properties",
  Properties: "/properties",
  Property: "/properties",
  Wallet: "/UserDashboard",
  ComingSoon: "/PartnerDashboard",
  Business: "/PartnerDashboard",
};

export function resolveWebModuleRoute(route: string | undefined, key?: string): string {
  const moduleKey = (key || "").toLowerCase();
  if (moduleKey && WEB_MODULE_ROUTES_BY_KEY[moduleKey]) {
    return WEB_MODULE_ROUTES_BY_KEY[moduleKey];
  }
  if (!route) return "/";
  if (route.startsWith("/")) {
    if (route === "/food" || route === "/groceries") return route;
    if (route === "/property") return "/properties";
    if (route === "/stay" || route === "/accommodation") return "/stay";
    if (route === "/wallet") return "/wallet";
    if (route === "/business") return "/business";
    return route;
  }
  if (LEGACY_MODULE_ROUTES[route]) return LEGACY_MODULE_ROUTES[route];

  const slug = (key || route).replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  return WEB_MODULE_ROUTES_BY_KEY[slug] || `/${slug}`;
}

function withLanguageHeaders(lang: SupportedLocale): HeadersInit {
  return {
    Accept: "application/json",
    "Accept-Language": lang,
  };
}

export async function fetchApiTranslations(
  lang: SupportedLocale,
  module?: string,
): Promise<Record<string, string>> {
  const params = new URLSearchParams({ lang });
  if (module) params.set("module", module);
  const response = await fetch(`${baseAPI}/api/translations/?${params.toString()}`, {
    headers: withLanguageHeaders(lang),
  });
  if (!response.ok) {
    throw new Error("Failed to load translations");
  }
  return response.json() as Promise<Record<string, string>>;
}

function mapHomeModule(item: RawHomeModule, index: number): HomeModule {
  const gradientStart = item.gradient?.[0] || item.gradient_start || item.color || "#3B82F6";
  const gradientEnd = item.gradient?.[1] || item.gradient_end || item.color || "#1D4ED8";
  const key = item.key || "";
  return {
    id: item.id ?? index,
    key,
    name: item.name || item.title || "",
    slug: item.slug || key || "",
    description: item.description || item.subtitle || item.short_description || "",
    icon: item.icon || "grid",
    color: item.color || gradientStart,
    gradient: [gradientStart, gradientEnd],
    route: resolveWebModuleRoute(item.route, key || item.slug),
    isActive: item.isActive ?? true,
    availableOnWeb: item.availableOnWeb ?? true,
    availableOnMobile: item.availableOnMobile ?? true,
    availableOnParceiro: item.availableOnParceiro ?? true,
    sortOrder: item.sortOrder ?? item.display_order ?? item.order ?? index,
  };
}

function normalizePlatformParam(platform: ClientPlatform): string {
  if (platform === "customer") return "mobile";
  return platform;
}

/** Prefer /api/platform/services/; fall back to legacy home-modules. */
export async function fetchHomeModules(
  lang: SupportedLocale,
  platform: ClientPlatform = "web",
): Promise<HomeModule[]> {
  const params = new URLSearchParams({ lang, platform: normalizePlatformParam(platform) });
  const endpoints = [
    `${baseAPI}/api/platform/services/?${params.toString()}`,
    `${baseAPI}/api/platform/home-modules/?${params.toString()}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, { headers: withLanguageHeaders(lang) });
      if (!response.ok) continue;
      const body = (await response.json()) as RawHomeModule[] | { results?: RawHomeModule[] };
      const rows = Array.isArray(body) ? body : body.results || [];
      return rows.map(mapHomeModule).sort((a, b) => a.sortOrder - b.sortOrder);
    } catch {
      // try next endpoint
    }
  }
  return [];
}

export async function fetchPlatformService(
  slug: string,
  lang: SupportedLocale,
  platform: ClientPlatform = "web",
): Promise<HomeModule | null> {
  const params = new URLSearchParams({ lang, platform: normalizePlatformParam(platform) });
  const response = await fetch(
    `${baseAPI}/api/platform/services/${encodeURIComponent(slug)}/?${params.toString()}`,
    { headers: withLanguageHeaders(lang) },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to load platform service");
  return mapHomeModule((await response.json()) as RawHomeModule, 0);
}

type RawBusinessCategory = Partial<BusinessCategory> & {
  gradient_start?: string;
  gradient_end?: string;
  is_active?: boolean;
  available_on_web?: boolean;
  available_on_mobile?: boolean;
  available_on_parceiro?: boolean;
  sort_order?: number;
};

function normalizeBusinessCategory(raw: RawBusinessCategory, index: number): BusinessCategory {
  const gradientStart = raw.gradient?.[0] || raw.gradient_start || raw.color || "#3B82F6";
  const gradientEnd = raw.gradient?.[1] || raw.gradient_end || raw.color || "#1D4ED8";
  return {
    id: raw.id ?? index,
    name: raw.name || "",
    slug: raw.slug || "",
    description: raw.description || "",
    icon: raw.icon || "briefcase",
    color: raw.color || gradientStart,
    gradient: [gradientStart, gradientEnd],
    dashboard_route: raw.dashboard_route || "",
    feature_keys: raw.feature_keys || [],
    isActive: raw.isActive ?? raw.is_active ?? true,
    availableOnWeb: raw.availableOnWeb ?? raw.available_on_web ?? true,
    availableOnMobile: raw.availableOnMobile ?? raw.available_on_mobile ?? true,
    availableOnParceiro: raw.availableOnParceiro ?? raw.available_on_parceiro ?? true,
    sortOrder: raw.sortOrder ?? raw.sort_order ?? index,
  };
}

export async function fetchBusinessCategories(
  lang: SupportedLocale,
  platform: ClientPlatform = "web",
): Promise<BusinessCategory[]> {
  const params = new URLSearchParams({ platform: normalizePlatformParam(platform) });
  const response = await fetch(`${baseAPI}/api/platform/business-categories/?${params.toString()}`, {
    headers: withLanguageHeaders(lang),
  });
  if (!response.ok) {
    throw new Error("Failed to load business categories");
  }
  const data = (await response.json()) as RawBusinessCategory[];
  const categories = data
    .map(normalizeBusinessCategory)
    .filter((c) => c.isActive && c.slug);
  if (categories.length === 0) {
    throw new Error("No business categories returned from the API.");
  }
  return categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchMyBusinessProfile(token: string): Promise<BusinessProfile> {
  const response = await fetch(`${baseAPI}/api/platform/business-profile/me/`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load business profile");
  }
  const data = (await response.json()) as {
    id: number;
    business_name: string;
    category: BusinessProfileCategory;
    dashboard_route: string;
    is_approved: boolean;
    is_active: boolean;
  };
  return {
    id: data.id,
    businessName: data.business_name,
    category: data.category,
    dashboardRoute: data.dashboard_route,
    isApproved: data.is_approved,
    isActive: data.is_active,
  };
}
