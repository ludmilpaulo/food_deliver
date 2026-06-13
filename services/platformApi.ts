import { baseAPI } from "./types";
import type { SupportedLocale } from "@/configs/translations";
import { isSuperAppModuleEnabled } from "@/lib/platformModules";

export type ClientPlatform = "web" | "mobile";

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
  sortOrder: number;
};

type RawHomeModule = Partial<HomeModule> & {
  id?: number;
  key?: string;
  title?: string;
  subtitle?: string;
  gradient_start?: string;
  gradient_end?: string;
  order?: number;
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

export const FALLBACK_HOME_MODULES: HomeModule[] = [
  { id: 1, key: "food", name: "Food", slug: "food", description: "Restaurants & meals", icon: "utensils", color: "#F59E0B", gradient: ["#F59E0B", "#D97706"], route: "/food", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 10 },
  { id: 2, key: "groceries", name: "Groceries", slug: "groceries", description: "Shops near you", icon: "shopping-basket", color: "#10B981", gradient: ["#10B981", "#059669"], route: "/groceries", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 20 },
  { id: 3, key: "property", name: "Property", slug: "property", description: "Rent or buy", icon: "home", color: "#8B5CF6", gradient: ["#8B5CF6", "#6D28D9"], route: "/properties", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 30 },
  { id: 4, key: "accommodation", name: "Stay", slug: "stay", description: "Book accommodation", icon: "bed", color: "#0EA5E9", gradient: ["#0EA5E9", "#0369A1"], route: "/stay", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 40 },
  { id: 5, key: "services", name: "Services", slug: "services", description: "Local professionals", icon: "briefcase", color: "#2563EB", gradient: ["#2563EB", "#1D4ED8"], route: "/services", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 50 },
  { id: 6, key: "doctors", name: "Doctors", slug: "doctors", description: "Book consultations", icon: "stethoscope", color: "#DC2626", gradient: ["#DC2626", "#B91C1C"], route: "/Doctors", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 60 },
  { id: 7, key: "car_rental", name: "Car Rental", slug: "car-rental", description: "Rent a vehicle", icon: "car-side", color: "#0F766E", gradient: ["#0F766E", "#115E59"], route: "/car-rental", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 70 },
  { id: 8, key: "package", name: "Send Package", slug: "package", description: "Courier delivery", icon: "package", color: "#7C3AED", gradient: ["#7C3AED", "#6D28D9"], route: "/send-package", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 80 },
  { id: 9, key: "wallet", name: "Wallet", slug: "wallet", description: "Pay & manage money", icon: "wallet", color: "#475569", gradient: ["#475569", "#334155"], route: "/wallet", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 90 },
  { id: 10, key: "business", name: "Business", slug: "business", description: "Corporate accounts", icon: "building", color: "#1E293B", gradient: ["#1E293B", "#0F172A"], route: "/business", isActive: true, availableOnWeb: true, availableOnMobile: true, sortOrder: 100 },
];

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
    description: item.description || item.subtitle || "",
    icon: item.icon || "grid",
    color: item.color || gradientStart,
    gradient: [gradientStart, gradientEnd],
      route: resolveWebModuleRoute(item.route, key || item.slug),
    isActive: item.isActive ?? true,
    availableOnWeb: item.availableOnWeb ?? key !== "rides",
    availableOnMobile: item.availableOnMobile ?? true,
    sortOrder: item.sortOrder ?? item.order ?? index,
  };
}

function filterHomeModules(modules: HomeModule[], platform: ClientPlatform): HomeModule[] {
  return modules
    .filter((item) => {
      if (!isSuperAppModuleEnabled(item.key)) return false;
      if (platform === "web" && (item.availableOnWeb === false || item.key === "rides")) {
        return false;
      }
      if (platform === "mobile" && item.availableOnMobile === false) {
        return false;
      }
      return item.isActive;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchHomeModules(
  lang: SupportedLocale,
  platform: ClientPlatform = "web",
): Promise<HomeModule[]> {
  const params = new URLSearchParams({ lang, platform });
  try {
    const response = await fetch(`${baseAPI}/api/platform/home-modules/?${params.toString()}`, {
      headers: withLanguageHeaders(lang),
    });
    if (!response.ok) {
      throw new Error("Failed to load home modules");
    }
    const data = (await response.json()) as RawHomeModule[];
    const modules = filterHomeModules(data.map(mapHomeModule), platform);
    if (modules.length > 0) return modules;
  } catch {
    // fall through to defaults
  }
  return filterHomeModules(FALLBACK_HOME_MODULES, platform);
}

type RawBusinessCategory = Partial<BusinessCategory> & {
  gradient_start?: string;
  gradient_end?: string;
  is_active?: boolean;
  available_on_web?: boolean;
  available_on_mobile?: boolean;
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
    sortOrder: raw.sortOrder ?? raw.sort_order ?? index,
  };
}

export async function fetchBusinessCategories(
  lang: SupportedLocale,
  platform: ClientPlatform = "web",
): Promise<BusinessCategory[]> {
  const params = new URLSearchParams({ platform });
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
