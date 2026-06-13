import api from "./api";

export type PlatformModuleAdmin = {
  id: number;
  key: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  route: string;
  gradient_start: string;
  gradient_end: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  available_on_web: boolean;
  available_on_mobile: boolean;
  requires_auth: boolean;
};

export type BusinessCategoryAdmin = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  gradient_start: string;
  gradient_end: string;
  dashboard_route: string;
  feature_keys: string[];
  is_active: boolean;
  available_on_web: boolean;
  available_on_mobile: boolean;
  sort_order: number;
};

export type TranslationAdmin = {
  id: number;
  key: string;
  language: string;
  value: string;
  module: string;
  is_active: boolean;
};

export type PricingRuleAdmin = {
  id: number;
  service_type: string;
  ride_type: string;
  country: number | null;
  city: number | null;
  base_fare: string;
  per_km_rate: string;
  per_minute_rate: string;
  minimum_fare: string;
  delivery_base_fee: string;
  service_fee_percent: string;
  surge_enabled: boolean;
  is_active: boolean;
};

export type CommissionRuleAdmin = {
  id: number;
  service_type: string;
  provider_type: string;
  fee_type: string;
  value: string;
  currency: string;
  country: number | null;
  city: number | null;
  is_active: boolean;
};

export type RideCategoryAdmin = {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_fare: string;
  price_per_km: string;
  price_per_minute: string;
  minimum_fare: string;
  service_fee: string;
  capacity: number;
  is_active: boolean;
  sort_order: number;
};

const ADMIN_BASE = "/api/platform/admin";

export async function fetchAdminModules() {
  const { data } = await api.get<PlatformModuleAdmin[]>(`${ADMIN_BASE}/modules/`);
  return data;
}

export async function updateAdminModule(id: number, payload: Partial<PlatformModuleAdmin>) {
  const { data } = await api.patch<PlatformModuleAdmin>(`${ADMIN_BASE}/modules/${id}/`, payload);
  return data;
}

export async function fetchAdminBusinessCategories() {
  const { data } = await api.get<BusinessCategoryAdmin[]>(`${ADMIN_BASE}/business-categories/`);
  return data;
}

export async function updateAdminBusinessCategory(id: number, payload: Partial<BusinessCategoryAdmin>) {
  const { data } = await api.patch<BusinessCategoryAdmin>(
    `${ADMIN_BASE}/business-categories/${id}/`,
    payload,
  );
  return data;
}

export async function fetchAdminTranslations(params?: { language?: string; module?: string }) {
  const { data } = await api.get<TranslationAdmin[]>(`${ADMIN_BASE}/translations/`, { params });
  return data;
}

export async function createAdminTranslation(payload: Omit<TranslationAdmin, "id">) {
  const { data } = await api.post<TranslationAdmin>(`${ADMIN_BASE}/translations/`, payload);
  return data;
}

export async function updateAdminTranslation(id: number, payload: Partial<TranslationAdmin>) {
  const { data } = await api.patch<TranslationAdmin>(`${ADMIN_BASE}/translations/${id}/`, payload);
  return data;
}

export async function deleteAdminTranslation(id: number) {
  await api.delete(`${ADMIN_BASE}/translations/${id}/`);
}

export async function fetchAdminPricingRules() {
  const { data } = await api.get<PricingRuleAdmin[]>(`${ADMIN_BASE}/pricing-rules/`);
  return data;
}

export async function createAdminPricingRule(payload: Partial<PricingRuleAdmin>) {
  const { data } = await api.post<PricingRuleAdmin>(`${ADMIN_BASE}/pricing-rules/`, payload);
  return data;
}

export async function updateAdminPricingRule(id: number, payload: Partial<PricingRuleAdmin>) {
  const { data } = await api.patch<PricingRuleAdmin>(`${ADMIN_BASE}/pricing-rules/${id}/`, payload);
  return data;
}

export async function fetchAdminCommissionRules() {
  const { data } = await api.get<CommissionRuleAdmin[]>(`${ADMIN_BASE}/commission-rules/`);
  return data;
}

export async function createAdminCommissionRule(payload: Partial<CommissionRuleAdmin>) {
  const { data } = await api.post<CommissionRuleAdmin>(`${ADMIN_BASE}/commission-rules/`, payload);
  return data;
}

export async function updateAdminCommissionRule(id: number, payload: Partial<CommissionRuleAdmin>) {
  const { data } = await api.patch<CommissionRuleAdmin>(
    `${ADMIN_BASE}/commission-rules/${id}/`,
    payload,
  );
  return data;
}

export async function fetchAdminRideCategories() {
  const { data } = await api.get<RideCategoryAdmin[]>(`${ADMIN_BASE}/ride-categories/`);
  return data;
}

export async function updateAdminRideCategory(id: number, payload: Partial<RideCategoryAdmin>) {
  const { data } = await api.patch<RideCategoryAdmin>(
    `${ADMIN_BASE}/ride-categories/${id}/`,
    payload,
  );
  return data;
}

export async function fetchAdminDashboardStats() {
  const { data } = await api.get<{
    orders_today: number;
    orders_week: number;
    rides_today: number;
    rides_active: number;
    deliveries_today: number;
    active_drivers: number;
    total_users: number;
  }>("/api/admin/dashboard/");
  return data;
}

export function invalidateTranslationCache(lang?: string) {
  if (typeof window === "undefined") return;
  const langs = lang ? [lang] : ["en", "pt", "fr", "es"];
  langs.forEach((code) => {
    try {
      window.localStorage.removeItem(`kudya_api_translations_${code}`);
    } catch {
      // ignore
    }
  });
}
