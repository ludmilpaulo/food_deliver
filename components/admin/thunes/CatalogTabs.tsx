"use client";

import React, { useCallback, useEffect, useState } from "react";
import { adminUi } from "@/lib/adminUi";
import {
  createThunesFee,
  fetchPaymentCountryConfigs,
  fetchThunesFees,
  fetchThunesMethods,
  saveThunesMethod,
  setThunesFeeEnabled,
} from "@/services/platformAdminApi";
import type { CountryPaymentConfigAdmin, ThunesFeeRule, ThunesMethodConfig } from "@/types/payments";
import { apiDetail, EmptyState, StatusLine, type Translate } from "./shared";

type MethodForm = {
  country: string;
  method_code: string;
  display_name: string;
  currency: string;
  min_amount: string;
  max_amount: string;
  display_order: string;
  services: string;
  payment_page_id: string;
  enabled: boolean;
  can_charge: boolean;
  can_cancel: boolean;
  can_refund: boolean;
};

const EMPTY_METHOD: MethodForm = {
  country: "",
  method_code: "thunes_card",
  display_name: "",
  currency: "",
  min_amount: "0",
  max_amount: "",
  display_order: "0",
  services: "",
  payment_page_id: "",
  enabled: false,
  can_charge: true,
  can_cancel: true,
  can_refund: true,
};

function useCountries(t: Translate) {
  const [countries, setCountries] = useState<CountryPaymentConfigAdmin[]>([]);
  useEffect(() => {
    fetchPaymentCountryConfigs()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, [t]);
  return countries;
}

export function MethodsTab({ t }: { t: Translate }) {
  const countries = useCountries(t);
  const [rows, setRows] = useState<ThunesMethodConfig[] | null>(null);
  const [form, setForm] = useState<MethodForm>(EMPTY_METHOD);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await fetchThunesMethods());
    } catch (err) {
      setError(apiDetail(err, t("thunesLoadFailed", "Thunes settings could not be loaded.")));
      setRows([]);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  function edit(row: ThunesMethodConfig) {
    setForm({
      country: String(row.country),
      method_code: row.method_code,
      display_name: row.display_name,
      currency: row.currency,
      min_amount: row.min_amount,
      max_amount: row.max_amount ?? "",
      display_order: String(row.display_order),
      services: row.services.join(", "),
      payment_page_id: row.payment_page_id,
      enabled: row.enabled,
      can_charge: row.can_charge,
      can_cancel: row.can_cancel,
      can_refund: row.can_refund,
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await saveThunesMethod({
        ...form,
        country: Number(form.country),
        services: form.services
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setNotice(t("thunesMethodSaved", "Payment method saved."));
      setForm(EMPTY_METHOD);
      await load();
    } catch (err) {
      setError(apiDetail(err, t("thunesMethodFailed", "The payment method was not saved.")));
    }
  }

  const set = (patch: Partial<MethodForm>) => setForm((current) => ({ ...current, ...patch }));

  return (
    <div className="space-y-4">
      <StatusLine error={error} notice={notice} />
      {rows === null ? <p className="text-sm text-slate-500">{t("loading", "Loading")}</p> : null}
      {rows && rows.length === 0 ? <EmptyState text={t("thunesNoMethods", "No Thunes methods configured yet.")} /> : null}
      {rows && rows.length > 0 ? (
        <div className={adminUi.card + " overflow-x-auto"}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="p-3">{t("country", "Country")}</th>
                <th className="p-3">{t("method", "Method")}</th>
                <th className="p-3">{t("limits", "Limits")}</th>
                <th className="p-3">{t("services", "Services")}</th>
                <th className="p-3">{t("status", "Status")}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="p-3">{row.country_code}</td>
                  <td className="p-3">
                    {row.display_name}
                    <span className="block text-xs text-slate-500">{row.method_code}</span>
                  </td>
                  <td className="p-3 tabular-nums">
                    {row.min_amount} – {row.max_amount ?? "∞"} {row.currency}
                  </td>
                  <td className="p-3 text-xs">{row.services.join(", ") || t("allServices", "All services")}</td>
                  <td className="p-3">{row.enabled ? t("enabled", "Enabled") : t("disabled", "Disabled")}</td>
                  <td className="p-3 text-right">
                    <button type="button" className={adminUi.btnGhost} onClick={() => edit(row)}>
                      {t("edit", "Edit")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <form className={adminUi.card + " grid gap-3 p-4 sm:grid-cols-2"} onSubmit={onSubmit}>
        <p className="text-sm font-semibold text-slate-900 sm:col-span-2">{t("thunesMethodForm", "Add or update a method")}</p>
        <label className="text-sm">
          {t("country", "Country")}
          <select
            className={adminUi.input}
            value={form.country}
            required
            onChange={(event) => {
              const match = countries.find((row) => String(row.country) === event.target.value);
              set({ country: event.target.value, currency: form.currency || match?.currency || "" });
            }}
          >
            <option value="">—</option>
            {countries.map((row) => (
              <option key={row.id} value={String(row.country)}>
                {row.country_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t("methodCode", "Method code")}
          <input className={adminUi.input} value={form.method_code} required onChange={(event) => set({ method_code: event.target.value })} />
        </label>
        <label className="text-sm">
          {t("displayName", "Display name")}
          <input className={adminUi.input} value={form.display_name} onChange={(event) => set({ display_name: event.target.value })} />
        </label>
        <label className="text-sm">
          {t("currency", "Currency")}
          <input
            className={adminUi.input}
            value={form.currency}
            maxLength={3}
            required
            onChange={(event) => set({ currency: event.target.value.toUpperCase() })}
          />
        </label>
        <label className="text-sm">
          {t("minAmount", "Minimum")}
          <input className={adminUi.input} inputMode="decimal" value={form.min_amount} onChange={(event) => set({ min_amount: event.target.value })} />
        </label>
        <label className="text-sm">
          {t("maxAmount", "Maximum")}
          <input className={adminUi.input} inputMode="decimal" value={form.max_amount} onChange={(event) => set({ max_amount: event.target.value })} />
        </label>
        <label className="text-sm">
          {t("services", "Services")}
          <input
            className={adminUi.input}
            placeholder="food, grocery, wallet_topup"
            value={form.services}
            onChange={(event) => set({ services: event.target.value })}
          />
        </label>
        <label className="text-sm">
          {t("paymentPageId", "Payment page ID")}
          <input className={adminUi.input} value={form.payment_page_id} onChange={(event) => set({ payment_page_id: event.target.value })} />
        </label>
        <div className="flex flex-wrap gap-4 text-sm sm:col-span-2">
          {(
            [
              ["enabled", t("enabled", "Enabled")],
              ["can_charge", t("canCharge", "Can charge")],
              ["can_cancel", t("canCancel", "Can cancel")],
              ["can_refund", t("canRefund", "Can refund")],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-blue-600"
                checked={form[field]}
                onChange={(event) => set({ [field]: event.target.checked } as Partial<MethodForm>)}
              />
              {label}
            </label>
          ))}
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className={adminUi.btnAccent}>
            {t("save", "Save")}
          </button>
          <button type="button" className={adminUi.btnGhost} onClick={() => setForm(EMPTY_METHOD)}>
            {t("clear", "Clear")}
          </button>
        </div>
      </form>
    </div>
  );
}

export function FeesTab({ t }: { t: Translate }) {
  const countries = useCountries(t);
  const [rows, setRows] = useState<ThunesFeeRule[] | null>(null);
  const [audience, setAudience] = useState("kudya_fee");
  const [feeType, setFeeType] = useState("fixed");
  const [value, setValue] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await fetchThunesFees());
    } catch (err) {
      setError(apiDetail(err, t("thunesLoadFailed", "Thunes settings could not be loaded.")));
      setRows([]);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await createThunesFee({
        audience,
        fee_type: feeType,
        value,
        country: country ? Number(country) : null,
        currency,
        service_type: serviceType,
      });
      setNotice(t("thunesFeeSaved", "Fee rule added."));
      setValue("");
      await load();
    } catch (err) {
      setError(apiDetail(err, t("thunesFeeFailed", "The fee rule was not saved.")));
    }
  }

  const countryName = (id: number | null) =>
    id === null ? t("allCountries", "All countries") : countries.find((row) => row.country === id)?.country_name ?? String(id);

  return (
    <div className="space-y-4">
      <StatusLine error={error} notice={notice} />
      <p className="text-sm text-slate-600">
        {t(
          "thunesFeesHelp",
          "Customers see every fee before they pay. Provider fees come from Thunes; Kudya fees are added on top.",
        )}
      </p>
      {rows === null ? <p className="text-sm text-slate-500">{t("loading", "Loading")}</p> : null}
      {rows && rows.length === 0 ? <EmptyState text={t("thunesNoFees", "No fee rules yet.")} /> : null}
      {rows?.map((row) => (
        <div key={row.id} className={adminUi.card + " flex flex-wrap justify-between gap-2 p-3 text-sm"}>
          <span>
            {row.audience} · {row.fee_type} · {row.value}
            {row.fee_type === "percent" ? "%" : ` ${row.currency}`}
          </span>
          <span className="flex items-center gap-3 text-slate-500">
            {countryName(row.country)} · {row.service_type || t("allServices", "All services")}
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                className="h-4 w-4 accent-blue-600"
                checked={row.enabled}
                onChange={(event) => {
                  setError(null);
                  void setThunesFeeEnabled(row.id, event.target.checked)
                    .then(load)
                    .catch((err) => setError(apiDetail(err, t("thunesFeeFailed", "The fee rule was not saved."))));
                }}
              />
              {t("enabled", "Enabled")}
            </label>
          </span>
        </div>
      ))}
      <form className={adminUi.card + " grid gap-3 p-4 sm:grid-cols-3"} onSubmit={onSubmit}>
        <label className="text-sm">
          {t("feeAudience", "Who pays")}
          <select className={adminUi.input} value={audience} onChange={(event) => setAudience(event.target.value)}>
            <option value="kudya_fee">{t("kudyaFee", "Kudya fee")}</option>
            <option value="provider_fee">{t("providerFee", "Provider fee")}</option>
          </select>
        </label>
        <label className="text-sm">
          {t("feeType", "Fee type")}
          <select className={adminUi.input} value={feeType} onChange={(event) => setFeeType(event.target.value)}>
            <option value="fixed">fixed</option>
            <option value="percent">percent</option>
          </select>
        </label>
        <label className="text-sm">
          {t("value", "Value")}
          <input className={adminUi.input} inputMode="decimal" required value={value} onChange={(event) => setValue(event.target.value)} />
        </label>
        <label className="text-sm">
          {t("country", "Country")}
          <select className={adminUi.input} value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="">{t("allCountries", "All countries")}</option>
            {countries.map((row) => (
              <option key={row.id} value={String(row.country)}>
                {row.country_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t("currency", "Currency")}
          <input className={adminUi.input} maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} />
        </label>
        <label className="text-sm">
          {t("serviceType", "Service")}
          <input className={adminUi.input} placeholder="food" value={serviceType} onChange={(event) => setServiceType(event.target.value)} />
        </label>
        <div className="sm:col-span-3">
          <button type="submit" className={adminUi.btnAccent}>
            {t("addFee", "Add fee rule")}
          </button>
        </div>
      </form>
    </div>
  );
}
