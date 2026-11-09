"use client";

import React, { useCallback, useEffect, useState } from "react";
import { adminUi } from "@/lib/adminUi";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchThunesAudit, fetchThunesOverview, runThunesJobs } from "@/services/platformAdminApi";
import type { PaymentAuditEvent, ThunesCredentialState } from "@/types/payments";
import CredentialsTab from "./thunes/CredentialsTab";
import { FeesTab, MethodsTab } from "./thunes/CatalogTabs";
import MfaEnrollment from "./thunes/MfaEnrollment";
import { ComplianceTab, ReconciliationTab, RfiTab } from "./thunes/OperationsTabs";
import { ControlsTab, CountriesTab, ServicesTab } from "./thunes/SettingsTabs";
import { apiDetail, EmptyState, MfaField, StatusLine } from "./thunes/shared";

type Tab =
  | "overview"
  | "credentials"
  | "controls"
  | "countries"
  | "compliance"
  | "methods"
  | "fees"
  | "services"
  | "rfi"
  | "reconciliation"
  | "audit";

type Overview = {
  provider: string;
  global_enabled: boolean;
  accept_enabled: boolean;
  money_transfer_enabled: boolean;
  environment: string;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  refund_total: string;
  reconciliation_exceptions: number;
  enabled_countries: string[];
  enabled_currencies?: string[];
  last_test_at: string | null;
  last_test_ok: boolean | null;
  last_successful_payment: string | null;
  credentials: ThunesCredentialState[];
  latest_errors: Array<{ id: number; product: string; authenticated: boolean; created_at: string }>;
  provider_balances?: Array<{ currency: string; available: string; pending: string; captured_at: string }>;
  low_balance_threshold?: string | null;
  controls?: Record<string, boolean | string>;
};

export default function ThunesGatewayAdmin() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [audit, setAudit] = useState<PaymentAuditEvent[] | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [jobNotice, setJobNotice] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    try {
      setOverview((await fetchThunesOverview()) as Overview);
      setOverviewError(null);
    } catch (err) {
      setOverviewError(apiDetail(err, t("thunesLoadFailed", "Thunes settings could not be loaded.")));
    }
  }, [t]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (tab !== "audit") return;
    fetchThunesAudit()
      .then(setAudit)
      .catch(() => setAudit([]));
  }, [tab]);

  async function onRunJobs() {
    setJobError(null);
    setJobNotice(null);
    try {
      const result = await runThunesJobs(mfaCode);
      setJobNotice(t("thunesJobsRun", "{count} background job(s) processed.").replace("{count}", String(result.processed)));
      await loadOverview();
    } catch (err) {
      setJobError(apiDetail(err, t("thunesJobsFailed", "Jobs could not be run. A current authenticator code is required.")));
    }
  }

  const tabs: Array<[Tab, string]> = [
    ["overview", t("overview", "Overview")],
    ["credentials", t("credentials", "Credentials")],
    ["controls", t("controls", "Controls")],
    ["countries", t("countries", "Countries")],
    ["compliance", t("compliance", "Compliance")],
    ["methods", t("paymentMethods", "Methods")],
    ["fees", t("fees", "Fees")],
    ["services", t("services", "Services")],
    ["rfi", t("thunesRfiQueue", "RFI queue")],
    ["reconciliation", t("reconciliation", "Reconciliation")],
    ["audit", t("audit", "Audit")],
  ];

  const yesNo = (value: boolean) => (value ? t("enabled", "Enabled") : t("disabled", "Disabled"));

  return (
    <div className="space-y-4">
      <div>
        <h1 className={adminUi.sectionTitle}>{t("thunesGateway", "Thunes")}</h1>
        <p className={adminUi.sectionSub}>
          {t(
            "thunesGatewayHelp",
            "Configure Thunes without a redeploy. API secrets stay on the server and are never shown again after saving.",
          )}
        </p>
      </div>
      <MfaEnrollment t={t} />
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={(tab === id ? adminUi.btnAccent : adminUi.btnGhost) + " shrink-0"}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        overviewError ? (
          <StatusLine error={overviewError} notice={null} />
        ) : !overview ? (
          <p className="text-sm text-slate-500">{t("loading", "Loading")}</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [t("globalStatus", "Global"), yesNo(overview.global_enabled)],
                [t("acceptStatus", "Accept"), yesNo(overview.accept_enabled)],
                [t("transferStatus", "Money Transfer"), yesNo(overview.money_transfer_enabled)],
                [t("environment", "Environment"), overview.environment],
                [t("successfulPayments", "Successful payments"), String(overview.successful_payments)],
                [t("failedPayments", "Failed payments"), String(overview.failed_payments)],
                [t("pendingPayments", "Pending payments"), String(overview.pending_payments)],
                [t("refundTotal", "Refunds"), overview.refund_total],
                [t("reconciliationExceptions", "Reconciliation exceptions"), String(overview.reconciliation_exceptions)],
                [
                  t("lastSuccessfulPayment", "Last successful payment"),
                  overview.last_successful_payment ? new Date(overview.last_successful_payment).toLocaleString() : "—",
                ],
              ].map(([label, value]) => (
                <div key={label} className={adminUi.card + " p-4"}>
                  <p className={adminUi.kpiLabel}>{label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
                </div>
              ))}
              <div className={adminUi.card + " p-4 sm:col-span-2"}>
                <p className={adminUi.kpiLabel}>{t("enabledCountries", "Enabled countries")}</p>
                <p className="mt-1 text-sm text-slate-700">{overview.enabled_countries.join(", ") || t("none", "None")}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {t("enabledCurrencies", "Currencies")}: {(overview.enabled_currencies || []).join(", ") || "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {t("lastConnectionTest", "Last connection test")}:{" "}
                  {overview.last_test_at
                    ? `${new Date(overview.last_test_at).toLocaleString()} · ${
                        overview.last_test_ok ? t("passed", "passed") : t("failed", "failed")
                      }`
                    : "—"}
                </p>
              </div>
            </div>
            <div className={adminUi.card + " p-4"}>
              <p className={adminUi.kpiLabel}>{t("thunesProviderBalances", "Thunes Money Transfer balances")}</p>
              <p className="mt-1 text-xs text-slate-500">
                {t("thunesBalanceHelp", "Prefunded provider balance. It is not a customer wallet balance.")}
              </p>
              {!overview.provider_balances?.length ? (
                <p className="mt-2 text-sm text-slate-500">{t("none", "None")}</p>
              ) : (
                <ul className="mt-2 divide-y divide-slate-100 text-sm">
                  {overview.provider_balances.map((row) => {
                    const low =
                      overview.low_balance_threshold != null &&
                      Number(row.available) < Number(overview.low_balance_threshold);
                    return (
                      <li key={row.currency} className="flex flex-wrap justify-between gap-2 py-1.5">
                        <span className={low ? "font-semibold text-red-700" : ""}>
                          {row.available} {row.currency}
                          {low ? ` · ${t("thunesLowBalance", "below threshold")}` : ""}
                        </span>
                        <span className="text-slate-500">{new Date(row.captured_at).toLocaleString()}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className={adminUi.card + " p-4"}>
              <p className={adminUi.kpiLabel}>{t("latestCallbacks", "Latest callbacks")}</p>
              {overview.latest_errors.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">{t("none", "None")}</p>
              ) : (
                <ul className="mt-2 divide-y divide-slate-100 text-sm">
                  {overview.latest_errors.map((row) => (
                    <li key={row.id} className="flex flex-wrap justify-between gap-2 py-1.5">
                      <span>
                        {row.product} ·{" "}
                        {row.authenticated ? t("authenticated", "authenticated") : t("rejected", "rejected")}
                      </span>
                      <span className="text-slate-500">{new Date(row.created_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className={adminUi.card + " space-y-2 p-4"}>
              <p className="text-sm text-slate-600">
                {t(
                  "thunesJobsHelp",
                  "Verification, catalogue, balance, and RFI jobs normally run on a schedule. Run them now after sandbox tests.",
                )}
              </p>
              <StatusLine error={jobError} notice={jobNotice} />
              <div className="flex flex-wrap items-end gap-2">
                <MfaField value={mfaCode} onChange={setMfaCode} t={t} />
                <button type="button" className={adminUi.btnGhost} onClick={() => void onRunJobs()}>
                  {t("runJobs", "Run jobs now")}
                </button>
              </div>
            </div>
          </div>
        )
      ) : null}

      {tab === "credentials" ? (
        overview ? (
          <CredentialsTab
            t={t}
            credentials={overview.credentials}
            mfaCode={mfaCode}
            setMfaCode={setMfaCode}
            reload={loadOverview}
          />
        ) : (
          <StatusLine error={overviewError} notice={null} />
        )
      ) : null}
      {tab === "controls" ? (
        overview ? (
          <ControlsTab t={t} controls={overview.controls || {}} mfaCode={mfaCode} setMfaCode={setMfaCode} reload={loadOverview} />
        ) : (
          <StatusLine error={overviewError} notice={null} />
        )
      ) : null}
      {tab === "countries" ? <CountriesTab t={t} /> : null}
      {tab === "compliance" ? <ComplianceTab t={t} mfaCode={mfaCode} setMfaCode={setMfaCode} /> : null}
      {tab === "methods" ? <MethodsTab t={t} /> : null}
      {tab === "fees" ? <FeesTab t={t} /> : null}
      {tab === "services" ? <ServicesTab t={t} /> : null}
      {tab === "rfi" ? <RfiTab t={t} /> : null}
      {tab === "reconciliation" ? <ReconciliationTab t={t} /> : null}
      {tab === "audit" ? (
        audit === null ? (
          <p className="text-sm text-slate-500">{t("loading", "Loading")}</p>
        ) : audit.length === 0 ? (
          <EmptyState text={t("noAudit", "No Thunes configuration changes yet.")} />
        ) : (
          <div className="space-y-2">
            {audit.map((row) => (
              <div key={row.id} className={adminUi.card + " flex flex-wrap justify-between gap-2 p-3 text-sm"}>
                <span className="font-medium text-slate-900">{row.action}</span>
                <span className="text-slate-500">
                  {row.actor_email || "—"} · {new Date(row.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
