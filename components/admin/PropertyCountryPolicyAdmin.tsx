"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MdPublic, MdRefresh } from "react-icons/md";
import { useSelector } from "react-redux";
import { baseAPI } from "@/services/types";
import type { RootState } from "@/redux/store";
import { readAuthToken } from "@/lib/authToken";
import { useTranslation } from "@/hooks/useTranslation";
import { adminUi } from "@/lib/adminUi";

type LaunchStatus = "draft" | "test" | "ready";

type CountryPolicy = {
  id: number;
  country_id: number;
  country_name: string;
  country_code: string;
  currency: string;
  flag_icon?: string;
  flag_url?: string;
  timezone: string;
  is_active: boolean;
  stay_enabled: boolean;
  rent_enabled: boolean;
  sale_enabled: boolean;
  transactions_enabled: boolean;
  launch_status: LaunchStatus;
  allowed_lease_months: number[];
  supported_listing_languages: string[];
  reminder_day_offsets: number[];
  deposit_notes: string;
  version: number | null;
  legal_notice: string;
  viewer_can_enable_transactions: boolean;
  viewer_can_mark_ready: boolean;
};

type PropertySummary = {
  listings: number;
  pending_approval: number;
  active_bookings: number;
  active_leases: number;
};

type CatalogCountry = {
  id: number;
  name: string;
  iso_code?: string;
  currency?: string;
};

const LISTING_LANGUAGES = ["en", "pt", "fr"] as const;

async function adminFetch(path: string, init?: RequestInit) {
  const token = readAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init?.body && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(`${baseAPI}${path}`, { ...init, headers });
}

function errorText(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const record = data as Record<string, unknown>;
  const detail = record.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(String).join(" ");
  const first = Object.values(record).find((value) => value != null);
  if (Array.isArray(first)) return first.map(String).join(" ");
  if (typeof first === "string") return first;
  return fallback;
}

function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part))
    .filter((part) => Number.isFinite(part));
}

export default function PropertyCountryPolicyAdmin() {
  const { t } = useTranslation();
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const [policies, setPolicies] = useState<CountryPolicy[]>([]);
  const [summary, setSummary] = useState<PropertySummary | null>(null);
  const [countries, setCountries] = useState<CatalogCountry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<CountryPolicy | null>(null);
  const [leaseMonths, setLeaseMonths] = useState("6, 12");
  const [reminders, setReminders] = useState("90, 60, 30, 14, 7, 0");
  const [newCountryId, setNewCountryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isSuperAdmin = role === "super_admin" || policies.some((policy) => policy.viewer_can_mark_ready);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [policyRes, countryRes, summaryRes] = await Promise.all([
        adminFetch("/properties/admin/country-policies/"),
        adminFetch("/locations/countries/"),
        adminFetch("/properties/admin/summary/"),
      ]);
      const policyData = (await policyRes.json()) as CountryPolicy[] | { detail?: string };
      if (!policyRes.ok) {
        throw new Error(errorText(policyData, t("propertyPolicyLoadFailed", "Could not load country policies")));
      }
      const rows = Array.isArray(policyData) ? policyData : [];
      setPolicies(rows);
      if (summaryRes.ok) {
        const summaryData = (await summaryRes.json()) as PropertySummary;
        setSummary(summaryData);
      } else {
        setSummary(null);
      }
      if (countryRes.ok) {
        const countryData = (await countryRes.json()) as CatalogCountry[];
        setCountries(Array.isArray(countryData) ? countryData : []);
      }
      setSelectedId((current) => (current != null && rows.some((row) => row.id === current) ? current : null));
    } catch (err) {
      setPolicies([]);
      setError(err instanceof Error ? err.message : t("propertyPolicyLoadFailed", "Could not load country policies"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => policies.find((policy) => policy.id === selectedId) ?? null,
    [policies, selectedId],
  );

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    setDraft(selected);
    setLeaseMonths(selected.allowed_lease_months.join(", "));
    setReminders(selected.reminder_day_offsets.join(", "));
  }, [selected]);

  const availableCountries = countries.filter(
    (country) => !policies.some((policy) => policy.country_id === country.id),
  );
  const canEnableTransactions = Boolean(draft?.viewer_can_enable_transactions) || isSuperAdmin;
  const canMarkReady = Boolean(draft?.viewer_can_mark_ready) || isSuperAdmin;

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await adminFetch(`/properties/admin/country-policies/${draft.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          is_active: draft.is_active,
          stay_enabled: draft.stay_enabled,
          rent_enabled: draft.rent_enabled,
          sale_enabled: draft.sale_enabled,
          transactions_enabled: draft.transactions_enabled,
          launch_status: draft.launch_status,
          allowed_lease_months: parseNumberList(leaseMonths),
          reminder_day_offsets: parseNumberList(reminders),
          supported_listing_languages: draft.supported_listing_languages,
          deposit_notes: draft.deposit_notes,
        }),
      });
      const data = (await res.json()) as CountryPolicy | { detail?: string };
      if (!res.ok) {
        throw new Error(errorText(data, t("propertyPolicySaveFailed", "Could not save the country policy")));
      }
      const saved = data as CountryPolicy;
      setPolicies((current) => current.map((row) => (row.id === saved.id ? saved : row)));
      setDraft(saved);
      setMessage(t("propertyPolicySaved", "Country policy saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("propertyPolicySaveFailed", "Could not save the country policy"));
    } finally {
      setSaving(false);
    }
  };

  const createPolicy = async () => {
    if (!newCountryId) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await adminFetch("/properties/admin/country-policies/", {
        method: "POST",
        body: JSON.stringify({
          country_id: Number(newCountryId),
          launch_status: "test",
          transactions_enabled: false,
          is_active: true,
          allowed_lease_months: [6, 12],
          reminder_day_offsets: [90, 60, 30, 14, 7, 0],
          supported_listing_languages: ["en", "pt", "fr"],
          deposit_notes: "",
        }),
      });
      const data = (await res.json()) as CountryPolicy | { detail?: string };
      if (!res.ok) {
        throw new Error(errorText(data, t("propertyPolicySaveFailed", "Could not save the country policy")));
      }
      const created = data as CountryPolicy;
      setPolicies((current) => [...current, created].sort((a, b) => a.country_name.localeCompare(b.country_name)));
      setSelectedId(created.id);
      setNewCountryId("");
      setMessage(t("propertyPolicyCreated", "Country policy created"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("propertyPolicySaveFailed", "Could not save the country policy"));
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (code: string) => {
    if (!draft) return;
    const has = draft.supported_listing_languages.includes(code);
    const next = has
      ? draft.supported_listing_languages.filter((item) => item !== code)
      : [...draft.supported_listing_languages, code];
    setDraft({ ...draft, supported_listing_languages: next });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={adminUi.sectionTitle}>
            <span className="inline-flex items-center gap-2">
              <MdPublic />
              {t("propertyCountryPolicies", "Property countries")}
            </span>
          </h1>
          <p className={adminUi.sectionSub}>
            {t("propertyCountryPoliciesDesc", "Country rules for stays, rentals, and launch status")}
          </p>
        </div>
        <button type="button" className={adminUi.btnGhost} onClick={() => void load()} disabled={loading}>
          <MdRefresh />
          {t("refresh", "Refresh")}
        </button>
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {t(
          "propertyPolicyLegalNotice",
          "These settings do not make a lease legally compliant. Leave deposit notes empty until a qualified review adds them.",
        )}
      </p>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              [t("propertySummaryListings", "Listings"), summary.listings],
              [t("propertySummaryPending", "Pending approval"), summary.pending_approval],
              [t("propertySummaryBookings", "Active bookings"), summary.active_bookings],
              [t("propertySummaryLeases", "Active leases"), summary.active_leases],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className={`${adminUi.card} px-4 py-4`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-violet-800">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className={`${adminUi.card} h-40 animate-pulse`} />
      ) : policies.length === 0 ? (
        <div className={`${adminUi.card} px-5 py-10 text-center text-sm text-slate-500`}>
          {t("propertyPolicyEmpty", "No country property policies yet.")}
        </div>
      ) : selectedId && draft ? (
            <form
              className={`${adminUi.card} space-y-4 p-5`}
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <button
                    type="button"
                    className="mb-1 text-sm font-semibold text-violet-700"
                    onClick={() => setSelectedId(null)}
                  >
                    {t("back", "Back")}
                  </button>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {draft.country_name}
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                  {t("policyVersion", "Version")} {draft.version ?? "—"} · {draft.timezone}
                </p>
              </div>
              {draft.launch_status !== "ready" && draft.legal_notice ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {draft.legal_notice}
                </p>
              ) : null}
              {!canMarkReady ? (
                <p className="text-sm text-slate-500">
                  {t("onlySuperAdminReady", "Only a super admin can enable transactions or mark a country ready.")}
                </p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.is_active}
                    onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })}
                  />
                  {t("policyActive", "Open for new listings")}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.stay_enabled}
                    onChange={(event) => setDraft({ ...draft, stay_enabled: event.target.checked })}
                  />
                  {t("stayEnabled", "Short-term stays")}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.rent_enabled}
                    onChange={(event) => setDraft({ ...draft, rent_enabled: event.target.checked })}
                  />
                  {t("rentEnabled", "Long-term rentals")}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.sale_enabled}
                    onChange={(event) => setDraft({ ...draft, sale_enabled: event.target.checked })}
                  />
                  {t("saleEnabled", "Sales")}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.transactions_enabled}
                    disabled={!canEnableTransactions}
                    onChange={(event) => setDraft({ ...draft, transactions_enabled: event.target.checked })}
                  />
                  {t("transactionsEnabled", "Transactions enabled")}
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                {t("launchStatus", "Launch status")}
                <select
                  className={`${adminUi.input} mt-1`}
                  value={draft.launch_status}
                  onChange={(event) => setDraft({ ...draft, launch_status: event.target.value as LaunchStatus })}
                >
                  <option value="draft">{t("launchDraft", "Draft")}</option>
                  <option value="test">{t("launchTest", "Test")}</option>
                  <option value="ready" disabled={!canMarkReady && draft.launch_status !== "ready"}>
                    {t("launchReady", "Ready")}
                  </option>
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                {t("allowedLeaseMonthsAdmin", "Allowed lease months")}
                <input className={`${adminUi.input} mt-1`} value={leaseMonths} onChange={(event) => setLeaseMonths(event.target.value)} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {t("reminderOffsets", "Expiry reminder days")}
                <input className={`${adminUi.input} mt-1`} value={reminders} onChange={(event) => setReminders(event.target.value)} />
              </label>

              <fieldset>
                <legend className="text-sm font-medium text-slate-700">
                  {t("supportedLanguages", "Listing languages")}
                </legend>
                <div className="mt-2 flex gap-4">
                  {LISTING_LANGUAGES.map((code) => (
                    <label key={code} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={draft.supported_listing_languages.includes(code)}
                        onChange={() => toggleLanguage(code)}
                      />
                      {code}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block text-sm font-medium text-slate-700">
                {t("depositNotes", "Deposit notes")}
                <textarea
                  className={`${adminUi.input} mt-1 min-h-24`}
                  value={draft.deposit_notes}
                  onChange={(event) => setDraft({ ...draft, deposit_notes: event.target.value })}
                />
              </label>

              <button type="submit" className={adminUi.btnAccent} disabled={saving}>
                {t("savePolicy", "Save policy")}
              </button>
            </form>
      ) : (
        <div className={`${adminUi.card} overflow-x-auto`}>
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("selectCountry", "Country")}</th>
                <th className="px-4 py-3 font-semibold">{t("currency", "Currency")}</th>
                <th className="px-4 py-3 font-semibold">{t("launchStatus", "Launch status")}</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => {
                const launchLabel =
                  policy.launch_status === "ready"
                    ? t("launchReady", "Ready")
                    : policy.launch_status === "test"
                      ? t("launchTest", "Test")
                      : t("launchDraft", "Draft");
                return (
                  <tr key={policy.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-3">
                        {policy.flag_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={policy.flag_url} alt="" className="h-4 w-6 rounded-sm object-cover" />
                        ) : (
                          <span className="inline-flex h-6 min-w-8 items-center justify-center rounded bg-violet-50 text-xs font-bold text-violet-800">
                            {policy.flag_icon || policy.country_code}
                          </span>
                        )}
                        <span>
                          <span className="block font-semibold text-slate-900">{policy.country_name}</span>
                          <span className="text-xs text-slate-500">{policy.country_code}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{policy.currency}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">
                        {launchLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white"
                        onClick={() => setSelectedId(policy.id)}
                      >
                        {t("manageCountry", "Manage")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {canMarkReady ? (
        <form
          className={`${adminUi.card} flex flex-wrap items-end gap-3 p-4`}
          onSubmit={(event) => {
            event.preventDefault();
            void createPolicy();
          }}
        >
          <label className="min-w-56 flex-1 text-sm font-medium text-slate-700">
            {t("selectCountry", "Country")}
            <select
              className={`${adminUi.input} mt-1`}
              value={newCountryId}
              onChange={(event) => setNewCountryId(event.target.value)}
            >
              <option value="">{t("selectCountry", "Country")}</option>
              {availableCountries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name} {country.iso_code ? `(${country.iso_code})` : ""}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={adminUi.btnPrimary} disabled={saving || !newCountryId}>
            {t("propertyPolicyCreate", "Add country")}
          </button>
        </form>
      ) : null}
    </section>
  );
}
