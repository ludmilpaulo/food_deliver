import api from "./api";

export type PlatformModuleAdmin = {
  id: number;
  key: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  icon_url?: string | null;
  route: string;
  gradient_start: string;
  gradient_end: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  available_on_web: boolean;
  available_on_mobile: boolean;
  available_on_parceiro: boolean;
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
  available_on_parceiro: boolean;
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
  transaction_type?: string;
  fee_type: string;
  value: string;
  fixed_fee?: string;
  currency: string;
  country: number | null;
  city: number | null;
  effective_from?: string | null;
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
  const { data } = await api.get<PlatformModuleAdmin[]>(`${ADMIN_BASE}/services/`);
  return data;
}

export async function createAdminModule(payload: Partial<PlatformModuleAdmin>) {
  const { data } = await api.post<PlatformModuleAdmin>(`${ADMIN_BASE}/services/`, payload);
  return data;
}

export async function updateAdminModule(id: number, payload: Partial<PlatformModuleAdmin>) {
  const { data } = await api.patch<PlatformModuleAdmin>(`${ADMIN_BASE}/services/${id}/`, payload);
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
  }>("/api/v1/admin/dashboard/");
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

const PAYMENTS_ADMIN = "/api/payments/admin";

export async function fetchPaymentCountryConfigs() {
  const { data } = await api.get(`${PAYMENTS_ADMIN}/country-configs/`);
  return unwrapAdminList<import("@/types/payments").CountryPaymentConfigAdmin>(data);
}

export async function createPaymentCountryConfig(
  payload: Partial<import("@/types/payments").CountryPaymentConfigAdmin>,
) {
  const { data } = await api.post<import("@/types/payments").CountryPaymentConfigAdmin>(
    `${PAYMENTS_ADMIN}/country-configs/`,
    payload,
  );
  return data;
}

export async function updatePaymentCountryConfig(
  id: number,
  payload: Partial<import("@/types/payments").CountryPaymentConfigAdmin>,
) {
  const { data } = await api.patch<import("@/types/payments").CountryPaymentConfigAdmin>(
    `${PAYMENTS_ADMIN}/country-configs/${id}/`,
    payload,
  );
  return data;
}

export async function fetchPaymentBankAccounts() {
  const { data } = await api.get(`${PAYMENTS_ADMIN}/bank-accounts/`);
  return unwrapAdminList<import("@/types/payments").BankAccount>(data);
}

export async function createPaymentBankAccount(payload: Partial<import("@/types/payments").BankAccount>) {
  const { data } = await api.post<import("@/types/payments").BankAccount>(
    `${PAYMENTS_ADMIN}/bank-accounts/`,
    payload,
  );
  return data;
}

export async function updatePaymentBankAccount(
  id: number,
  payload: Partial<import("@/types/payments").BankAccount>,
) {
  const { data } = await api.patch<import("@/types/payments").BankAccount>(
    `${PAYMENTS_ADMIN}/bank-accounts/${id}/`,
    payload,
  );
  return data;
}

export async function fetchPaymentProviders() {
  const { data } = await api.get(`${PAYMENTS_ADMIN}/providers/`);
  return unwrapAdminList<import("@/types/payments").PaymentProviderAdmin>(data);
}

export async function savePaymentProvider(
  id: number | null,
  payload: Record<string, unknown>,
) {
  if (id) {
    const { data } = await api.patch<import("@/types/payments").PaymentProviderAdmin>(
      `${PAYMENTS_ADMIN}/providers/${id}/`,
      payload,
    );
    return data;
  }
  const { data } = await api.post<import("@/types/payments").PaymentProviderAdmin>(
    `${PAYMENTS_ADMIN}/providers/`,
    payload,
  );
  return data;
}

export async function fetchPaymentOverview(params?: Record<string, string>) {
  const { data } = await api.get<import("@/types/payments").PaymentOverview>(
    `${PAYMENTS_ADMIN}/transactions/overview/`,
    { params },
  );
  return data;
}

export async function fetchPaymentVerificationQueue() {
  const { data } = await api.get(`${PAYMENTS_ADMIN}/transactions/verification_queue/`);
  return unwrapAdminList<import("@/types/payments").PaymentAdminRow>(data);
}

export async function approvePaymentProof(id: number) {
  const { data } = await api.post<import("@/types/payments").PaymentAdminRow>(
    `${PAYMENTS_ADMIN}/transactions/${id}/approve/`,
  );
  return data;
}

export async function rejectPaymentProof(id: number, reason: string) {
  const { data } = await api.post<import("@/types/payments").PaymentAdminRow>(
    `${PAYMENTS_ADMIN}/transactions/${id}/reject/`,
    { reason },
  );
  return data;
}

export async function fetchPaymentAudit() {
  const { data } = await api.get<import("@/types/payments").PaymentAuditEvent[]>(
    `${PAYMENTS_ADMIN}/audit/`,
  );
  return Array.isArray(data) ? data : [];
}

const THUNES_ADMIN = `${PAYMENTS_ADMIN}/thunes`;

export async function fetchThunesOverview() {
  const { data } = await api.get(`${THUNES_ADMIN}/overview/`);
  return data;
}

export async function saveThunesCredentials(payload: Record<string, unknown>) {
  const { data } = await api.post(`${THUNES_ADMIN}/credentials/`, payload);
  return data;
}

export async function testThunesConnection(payload: Record<string, unknown>) {
  const { data } = await api.post(`${THUNES_ADMIN}/test/`, payload);
  return data;
}

export async function patchThunesControls(payload: Record<string, unknown>) {
  const { data } = await api.patch(`${THUNES_ADMIN}/configuration/`, payload);
  return data;
}

export async function fetchThunesServices() {
  const { data } = await api.get(`${THUNES_ADMIN}/services/`);
  return data as Array<{ service_type: string; thunes_enabled: boolean }>;
}

export async function updateThunesService(service_type: string, thunes_enabled: boolean) {
  const { data } = await api.patch(`${THUNES_ADMIN}/services/`, { service_type, thunes_enabled });
  return data;
}

export async function setThunesProductActive(payload: {
  product: string;
  environment: string;
  active: boolean;
  mfa_code: string;
}) {
  const { data } = await api.post(`${THUNES_ADMIN}/active/`, payload);
  return data;
}

export async function decideThunesApproval(approvalId: number, approve: boolean, mfa_code: string) {
  const { data } = await api.post(`${THUNES_ADMIN}/approvals/${approvalId}/`, { approve, mfa_code });
  return data as { id: number; status: string };
}

export async function fetchThunesCredentialHistory(product: string, environment: string) {
  const { data } = await api.get(`${THUNES_ADMIN}/credentials/history/`, { params: { product, environment } });
  return (Array.isArray(data) ? data : []) as import("@/types/payments").ThunesCredentialVersion[];
}

export async function fetchThunesMethods() {
  const { data } = await api.get(`${THUNES_ADMIN}/methods/`);
  return (Array.isArray(data) ? data : []) as import("@/types/payments").ThunesMethodConfig[];
}

export async function saveThunesMethod(payload: Record<string, unknown>) {
  const { data } = await api.post(`${THUNES_ADMIN}/methods/`, payload);
  return data;
}

export async function fetchThunesFees() {
  const { data } = await api.get(`${THUNES_ADMIN}/fees/`);
  return (Array.isArray(data) ? data : []) as import("@/types/payments").ThunesFeeRule[];
}

export async function createThunesFee(payload: Record<string, unknown>) {
  const { data } = await api.post(`${THUNES_ADMIN}/fees/`, payload);
  return data;
}

export async function setThunesFeeEnabled(feeId: number, enabled: boolean) {
  const { data } = await api.patch(`${THUNES_ADMIN}/fees/${feeId}/`, { enabled });
  return data;
}

export async function fetchThunesCompliance() {
  const { data } = await api.get(`${THUNES_ADMIN}/compliance/`);
  return (Array.isArray(data) ? data : []) as import("@/types/payments").ThunesCountryCompliance[];
}

export async function setThunesCompliance(configId: number, compliance_status: string, mfa_code: string, note: string) {
  const { data } = await api.post(`${THUNES_ADMIN}/compliance/${configId}/`, { compliance_status, mfa_code, note });
  return data as import("@/types/payments").ThunesCountryCompliance;
}

export async function fetchThunesReconciliation(resolved?: boolean) {
  const params = resolved === undefined ? undefined : { resolved: String(resolved) };
  const { data } = await api.get(`${THUNES_ADMIN}/reconciliation/`, { params });
  return (Array.isArray(data) ? data : []) as import("@/types/payments").ThunesReconciliationRow[];
}

export async function fetchWalletReconciliation() {
  const { data } = await api.get(`${THUNES_ADMIN}/reconciliation/wallets/`);
  return data as import("@/types/payments").WalletReconciliationReport;
}

export async function resolveThunesReconciliation(recordId: number, note: string) {
  const { data } = await api.post(`${THUNES_ADMIN}/reconciliation/${recordId}/resolve/`, { note });
  return data;
}

export async function fetchThunesRfis(status?: string) {
  const { data } = await api.get(`${THUNES_ADMIN}/rfi/`, { params: status ? { status } : undefined });
  return (Array.isArray(data) ? data : []) as import("@/types/payments").ThunesRfi[];
}

export async function syncThunesRfis(days = 7) {
  const { data } = await api.post(`${THUNES_ADMIN}/rfi/sync/`, { days });
  return data as { synced: number };
}

export async function uploadThunesRfiDocument(rfiId: number, file: File, type: string) {
  const form = new FormData();
  form.append("document", file);
  if (type) form.append("type", type);
  const { data } = await api.post(`${THUNES_ADMIN}/rfi/${rfiId}/document/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as import("@/types/payments").ThunesRfi;
}

export async function provideThunesRfiInformation(rfiId: number, information: Record<string, unknown>, comments: string) {
  const { data } = await api.post(`${THUNES_ADMIN}/rfi/${rfiId}/information/`, { information, comments });
  return data as import("@/types/payments").ThunesRfi;
}

export async function submitThunesRfi(rfiId: number) {
  const { data } = await api.post(`${THUNES_ADMIN}/rfi/${rfiId}/submit/`, {});
  return data as import("@/types/payments").ThunesRfi;
}

export async function runThunesJobs(mfa_code: string) {
  const { data } = await api.post(`${THUNES_ADMIN}/jobs/`, { mfa_code });
  return data as { processed: number };
}

export async function fetchMfaStatus() {
  const { data } = await api.get("/api/auth/mfa/status/");
  return data as { enabled: boolean; required: boolean; enrolled: boolean };
}

export async function startMfaSetup() {
  const { data } = await api.post("/api/auth/mfa/setup/", {});
  return data as { secret: string; otpauth_uri: string };
}

export async function confirmMfaSetup(code: string) {
  const { data } = await api.post("/api/auth/mfa/confirm/", { code });
  return data as { enabled: boolean };
}

export async function fetchThunesAudit() {
  const { data } = await api.get<import("@/types/payments").PaymentAuditEvent[]>(`${PAYMENTS_ADMIN}/audit/`);
  const rows = Array.isArray(data) ? data : [];
  return rows.filter((row) => String(row.action || "").startsWith("thunes_"));
}

function unwrapAdminList<T>(data: T[] | { results?: T[] }): T[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}
