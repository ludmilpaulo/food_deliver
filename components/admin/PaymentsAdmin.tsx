"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { adminUi } from "@/lib/adminUi";
import {
  approvePaymentProof,
  createPaymentBankAccount,
  createPaymentCountryConfig,
  fetchPaymentAudit,
  fetchPaymentBankAccounts,
  fetchPaymentCountryConfigs,
  fetchPaymentOverview,
  fetchPaymentProviders,
  fetchPaymentVerificationQueue,
  rejectPaymentProof,
  savePaymentProvider,
  updatePaymentBankAccount,
  updatePaymentCountryConfig,
} from "@/services/platformAdminApi";
import type {
  BankAccount,
  CountryPaymentConfigAdmin,
  PaymentAdminRow,
  PaymentAuditEvent,
  PaymentOverview,
  PaymentProviderAdmin,
} from "@/types/payments";

type Tab = "overview" | "countries" | "banks" | "providers" | "queue" | "audit";

export default function PaymentsAdmin() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<PaymentOverview | null>(null);
  const [configs, setConfigs] = useState<CountryPaymentConfigAdmin[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [providers, setProviders] = useState<PaymentProviderAdmin[]>([]);
  const [queue, setQueue] = useState<PaymentAdminRow[]>([]);
  const [audit, setAudit] = useState<PaymentAuditEvent[]>([]);
  const [rejectReason, setRejectReason] = useState<Partial<Record<number, string>>>({});
  const [apiKeyDraft, setApiKeyDraft] = useState<Partial<Record<number | "new", string>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, cf, bk, pr, q, au] = await Promise.all([
        fetchPaymentOverview(),
        fetchPaymentCountryConfigs(),
        fetchPaymentBankAccounts(),
        fetchPaymentProviders(),
        fetchPaymentVerificationQueue(),
        fetchPaymentAudit(),
      ]);
      setOverview(ov);
      setConfigs(cf);
      setBanks(bk);
      setProviders(pr);
      setQueue(q);
      setAudit(au);
    } catch {
      setError(t("paymentsAdminLoadFailed", "Failed to load payment settings. Finance admin role required."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      key={id}
      onClick={() => setTab(id)}
      className={tab === id ? adminUi.btnAccent : adminUi.btnGhost}
    >
      {label}
    </button>
  );

  if (loading) return <p className="text-slate-500">{t("loading", "Loading...")}</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {tabBtn("overview", t("paymentOverview", "Overview"))}
        {tabBtn("countries", t("paymentCountries", "Country config"))}
        {tabBtn("banks", t("bankAccounts", "Bank accounts"))}
        {tabBtn("providers", t("paymentProviders", "Provider credentials"))}
        {tabBtn("queue", t("eftQueue", "EFT verification"))}
        {tabBtn("audit", t("paymentAudit", "Audit trail"))}
      </div>

      {tab === "overview" && overview ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["successful", overview.successful],
              ["pending", overview.pending],
              ["failed", overview.failed],
              ["refunds", overview.refunds],
              ["eft_awaiting", overview.eft_awaiting],
              ["ecocash", overview.ecocash],
            ] as const
          ).map(([key, stat]) => (
            <div key={key} className={adminUi.card + " p-4"}>
              <p className={adminUi.kpiLabel}>{key.replace("_", " ")}</p>
              <p className={adminUi.kpiValue}>{stat.count}</p>
              <p className="text-sm text-slate-500">{stat.amount}</p>
            </div>
          ))}
          <div className={adminUi.card + " p-4"}>
            <p className={adminUi.kpiLabel}>{t("commission", "Commission")}</p>
            <p className={adminUi.kpiValue}>{overview.commission}</p>
          </div>
          <div className={adminUi.card + " p-4"}>
            <p className={adminUi.kpiLabel}>{t("partnerEarnings", "Partner earnings")}</p>
            <p className={adminUi.kpiValue}>{overview.partner_earnings}</p>
          </div>
        </div>
      ) : null}

      {tab === "countries" ? (
        <div className="space-y-3">
          {configs.map((cfg) => (
            <form
              key={cfg.id}
              className={adminUi.card + " grid gap-3 p-4 sm:grid-cols-3"}
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                void updatePaymentCountryConfig(cfg.id, {
                  enabled: fd.get("enabled") === "on",
                  ecocash_enabled: fd.get("ecocash_enabled") === "on",
                  bank_transfer_enabled: fd.get("bank_transfer_enabled") === "on",
                  card_enabled: fd.get("card_enabled") === "on",
                  wallet_enabled: fd.get("wallet_enabled") === "on",
                  cash_on_delivery_enabled: fd.get("cash_on_delivery_enabled") === "on",
                  manual_proof_required: fd.get("manual_proof_required") === "on",
                  currency: String(fd.get("currency") || cfg.currency),
                  default_payment_method: String(fd.get("default_payment_method") || cfg.default_payment_method),
                  min_amount: String(fd.get("min_amount") || cfg.min_amount),
                  max_amount: String(fd.get("max_amount") || "") || null,
                }).then(load);
              }}
            >
              <p className="sm:col-span-3 font-semibold">
                {cfg.country_name} ({cfg.country_code})
              </p>
              <label className="text-sm">
                {t("currency", "Currency")}
                <input name="currency" defaultValue={cfg.currency} className={adminUi.input} />
              </label>
              <label className="text-sm">
                {t("defaultMethod", "Default method")}
                <input name="default_payment_method" defaultValue={cfg.default_payment_method} className={adminUi.input} />
              </label>
              <label className="text-sm">
                {t("minAmount", "Min")}
                <input name="min_amount" defaultValue={cfg.min_amount} className={adminUi.input} />
              </label>
              <label className="text-sm">
                {t("maxAmount", "Max")}
                <input name="max_amount" defaultValue={cfg.max_amount ?? ""} className={adminUi.input} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="enabled" defaultChecked={cfg.enabled} /> {t("enabled", "Enabled")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="ecocash_enabled" defaultChecked={cfg.ecocash_enabled} /> EcoCash
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="bank_transfer_enabled" defaultChecked={cfg.bank_transfer_enabled} />{" "}
                {t("bankTransfer", "Bank / EFT")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="card_enabled" defaultChecked={cfg.card_enabled} /> {t("card", "Card")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="wallet_enabled" defaultChecked={cfg.wallet_enabled} /> {t("wallet", "Wallet")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="cash_on_delivery_enabled" defaultChecked={cfg.cash_on_delivery_enabled} />{" "}
                {t("cash", "Cash")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="manual_proof_required" defaultChecked={cfg.manual_proof_required} />{" "}
                {t("manualProof", "Manual proof")}
              </label>
              <button type="submit" className={adminUi.btnPrimary}>
                {t("save", "Save")}
              </button>
            </form>
          ))}
          <form
            className={adminUi.card + " grid gap-3 p-4 sm:grid-cols-3"}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void createPaymentCountryConfig({
                country: Number(fd.get("country")),
                currency: String(fd.get("currency") || "USD"),
                enabled: true,
                default_payment_method: String(fd.get("default_payment_method") || "cash"),
              }).then(load);
            }}
          >
            <p className="sm:col-span-3 font-semibold">{t("addCountryConfig", "Add country configuration")}</p>
            <input name="country" placeholder={t("countryId", "Country ID")} className={adminUi.input} required />
            <input name="currency" placeholder="USD" className={adminUi.input} />
            <input name="default_payment_method" placeholder="ecocash" className={adminUi.input} />
            <button type="submit" className={adminUi.btnAccent}>
              {t("add", "Add")}
            </button>
          </form>
        </div>
      ) : null}

      {tab === "banks" ? (
        <div className="space-y-3">
          {banks.map((bank) => (
            <form
              key={bank.id}
              className={adminUi.card + " grid gap-3 p-4 sm:grid-cols-2"}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void updatePaymentBankAccount(bank.id, {
                  bank_name: String(fd.get("bank_name") || ""),
                  account_name: String(fd.get("account_name") || ""),
                  account_number: String(fd.get("account_number") || ""),
                  iban: String(fd.get("iban") || ""),
                  swift_bic: String(fd.get("swift_bic") || ""),
                  branch: String(fd.get("branch") || ""),
                  branch_code: String(fd.get("branch_code") || ""),
                  currency: String(fd.get("currency") || ""),
                  payment_reference_instructions: String(fd.get("payment_reference_instructions") || ""),
                  additional_instructions: String(fd.get("additional_instructions") || ""),
                  is_active: fd.get("is_active") === "on",
                }).then(load);
              }}
            >
              <input name="bank_name" defaultValue={bank.bank_name} className={adminUi.input} />
              <input name="account_name" defaultValue={bank.account_name} className={adminUi.input} />
              <input name="account_number" defaultValue={bank.account_number} className={adminUi.input} />
              <input name="iban" defaultValue={bank.iban} className={adminUi.input} placeholder="IBAN" />
              <input name="swift_bic" defaultValue={bank.swift_bic} className={adminUi.input} placeholder="SWIFT" />
              <input name="branch" defaultValue={bank.branch} className={adminUi.input} placeholder="Branch" />
              <input name="branch_code" defaultValue={bank.branch_code} className={adminUi.input} placeholder="Branch code" />
              <input name="currency" defaultValue={bank.currency} className={adminUi.input} />
              <textarea
                name="payment_reference_instructions"
                defaultValue={bank.payment_reference_instructions}
                className={adminUi.input + " sm:col-span-2"}
              />
              <textarea
                name="additional_instructions"
                defaultValue={bank.additional_instructions}
                className={adminUi.input + " sm:col-span-2"}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={bank.is_active !== false} /> {t("active", "Active")}
              </label>
              <button type="submit" className={adminUi.btnPrimary}>
                {t("save", "Save")}
              </button>
            </form>
          ))}
          <form
            className={adminUi.card + " grid gap-3 p-4 sm:grid-cols-2"}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void createPaymentBankAccount({
                country: Number(fd.get("country")),
                bank_name: String(fd.get("bank_name") || ""),
                account_name: String(fd.get("account_name") || ""),
                account_number: String(fd.get("account_number") || ""),
                iban: String(fd.get("iban") || ""),
                swift_bic: String(fd.get("swift_bic") || ""),
                branch: String(fd.get("branch") || ""),
                branch_code: String(fd.get("branch_code") || ""),
                currency: String(fd.get("currency") || "USD"),
                payment_reference_instructions: String(fd.get("payment_reference_instructions") || ""),
                additional_instructions: String(fd.get("additional_instructions") || ""),
                is_active: true,
              }).then(load);
            }}
          >
            <p className="sm:col-span-2 font-semibold">{t("addBankAccount", "Add bank account")}</p>
            <input name="country" placeholder={t("countryId", "Country ID")} className={adminUi.input} required />
            <input name="bank_name" placeholder={t("bankName", "Bank name")} className={adminUi.input} required />
            <input name="account_name" placeholder={t("accountName", "Account name")} className={adminUi.input} required />
            <input name="account_number" placeholder={t("accountNumber", "Account number")} className={adminUi.input} required />
            <input name="iban" placeholder="IBAN" className={adminUi.input} />
            <input name="swift_bic" placeholder="SWIFT/BIC" className={adminUi.input} />
            <input name="branch" placeholder={t("branch", "Branch")} className={adminUi.input} />
            <input name="branch_code" placeholder={t("branchCode", "Branch code")} className={adminUi.input} />
            <input name="currency" placeholder="USD" className={adminUi.input} />
            <textarea name="payment_reference_instructions" placeholder={t("referenceInstructions", "Reference instructions")} className={adminUi.input + " sm:col-span-2"} />
            <textarea name="additional_instructions" placeholder={t("additionalInstructions", "Additional instructions")} className={adminUi.input + " sm:col-span-2"} />
            <button type="submit" className={adminUi.btnAccent}>
              {t("add", "Add")}
            </button>
          </form>
        </div>
      ) : null}

      {tab === "providers" ? (
        <div className="space-y-3">
          {providers.map((provider) => (
            <form
              key={provider.id}
              className={adminUi.card + " grid gap-3 p-4 sm:grid-cols-2"}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const apiKey = apiKeyDraft[provider.id];
                void savePaymentProvider(provider.id, {
                  environment: String(fd.get("environment") || provider.environment),
                  base_url: String(fd.get("base_url") || ""),
                  merchant_code: String(fd.get("merchant_code") || ""),
                  active: fd.get("active") === "on",
                  credentials: apiKey ? { api_key: apiKey } : {},
                }).then(() => {
                  setApiKeyDraft((prev) => ({ ...prev, [provider.id]: "" }));
                  return load();
                });
              }}
            >
              <p className="sm:col-span-2 font-semibold">
                {provider.provider} · {provider.country_name || provider.country}
              </p>
              <input name="environment" defaultValue={provider.environment} className={adminUi.input} />
              <input name="base_url" defaultValue={provider.base_url} className={adminUi.input} placeholder="Base URL" />
              <input name="merchant_code" defaultValue={provider.merchant_code} className={adminUi.input} placeholder="Merchant code" />
              <input
                type="password"
                autoComplete="new-password"
                value={apiKeyDraft[provider.id] ?? ""}
                onChange={(e) => setApiKeyDraft((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                placeholder={provider.masked_credentials?.api_key || t("apiKeyLeaveBlank", "API key (leave blank to keep)")}
                className={adminUi.input}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={provider.active} /> {t("active", "Active")}
              </label>
              <p className="text-xs text-slate-500 sm:col-span-2">
                {t("secretsNeverEchoed", "Secrets are stored encrypted and never shown again after save.")}
              </p>
              <button type="submit" className={adminUi.btnPrimary}>
                {t("save", "Save")}
              </button>
            </form>
          ))}
          <form
            className={adminUi.card + " grid gap-3 p-4 sm:grid-cols-2"}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void savePaymentProvider(null, {
                provider: String(fd.get("provider") || "ecocash"),
                country_ref: Number(fd.get("country_ref")),
                environment: String(fd.get("environment") || "sandbox"),
                base_url: String(fd.get("base_url") || ""),
                merchant_code: String(fd.get("merchant_code") || ""),
                active: true,
                credentials: { api_key: String(fd.get("api_key") || "") },
              }).then(load);
            }}
          >
            <p className="sm:col-span-2 font-semibold">{t("addProvider", "Add provider")}</p>
            <input name="provider" defaultValue="ecocash" className={adminUi.input} />
            <input name="country_ref" placeholder={t("countryId", "Country ID")} className={adminUi.input} required />
            <input name="environment" defaultValue="sandbox" className={adminUi.input} />
            <input name="base_url" placeholder="Base URL (optional)" className={adminUi.input} />
            <input name="merchant_code" placeholder="Merchant code" className={adminUi.input} />
            <input name="api_key" type="password" placeholder="API key" className={adminUi.input} />
            <button type="submit" className={adminUi.btnAccent}>
              {t("add", "Add")}
            </button>
          </form>
        </div>
      ) : null}

      {tab === "queue" ? (
        <div className="space-y-3">
          {queue.length === 0 ? <p className="text-slate-500">{t("noEftProofs", "No EFT proofs awaiting review.")}</p> : null}
          {queue.map((row) => (
            <div key={row.id} className={adminUi.card + " space-y-2 p-4"}>
              <p className="font-semibold">
                {row.customer_email} · {row.amount} {row.currency} · {row.kudya_reference}
              </p>
              <p className="text-sm text-slate-500">
                {row.country_name} · {row.service_type} #{row.object_id} · {row.bank_account_detail?.bank_name}
              </p>
              {row.proofs.map((proof) => (
                <a key={proof.id} href={proof.download_url} className="text-sm text-blue-600 underline" target="_blank" rel="noreferrer">
                  {proof.original_filename}
                </a>
              ))}
              <div className="flex flex-wrap gap-2">
                <button type="button" className={adminUi.btnAccent} onClick={() => void approvePaymentProof(row.id).then(load)}>
                  {t("approve", "Approve")}
                </button>
                <input
                  className={adminUi.input + " max-w-xs"}
                  placeholder={t("rejectionReason", "Rejection reason")}
                  value={rejectReason[row.id] ?? ""}
                  onChange={(e) => setRejectReason((prev) => ({ ...prev, [row.id]: e.target.value }))}
                />
                <button
                  type="button"
                  className={adminUi.btnGhost}
                  onClick={() => void rejectPaymentProof(row.id, rejectReason[row.id] || "").then(load)}
                >
                  {t("reject", "Reject")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "audit" ? (
        <div className="space-y-2">
          {audit.map((event) => (
            <div key={event.id} className={adminUi.card + " p-3 text-sm"}>
              <span className="font-medium">{event.action}</span> · {event.actor_email || "system"} · {event.target_repr} ·{" "}
              {new Date(event.created_at).toLocaleString()}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
