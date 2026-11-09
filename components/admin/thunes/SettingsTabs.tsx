"use client";

import React, { useCallback, useEffect, useState } from "react";
import { adminUi } from "@/lib/adminUi";
import {
  fetchPaymentCountryConfigs,
  fetchThunesServices,
  patchThunesControls,
  updatePaymentCountryConfig,
  updateThunesService,
} from "@/services/platformAdminApi";
import type { CountryPaymentConfigAdmin } from "@/types/payments";
import { apiDetail, EmptyState, MfaField, StatusLine, Toggle, type Translate } from "./shared";

const CONTROL_FIELDS = [
  ["global_enabled", "thunesGlobal", "Thunes global"],
  ["accept_enabled", "thunesAccept", "Thunes Accept"],
  ["money_transfer_enabled", "thunesTransfer", "Thunes Money Transfer"],
  ["customer_checkout", "customerCheckout", "Customer checkout"],
  ["provider_payouts", "providerPayouts", "Provider payouts"],
  ["wallet_deposits", "walletDeposits", "Wallet deposits"],
  ["wallet_withdrawals", "walletWithdrawals", "Wallet withdrawals"],
  ["international_transfers", "internationalTransfers", "International transfers"],
  ["refund_requests", "refundRequests", "Refund requests"],
  ["merchant_onboarding", "merchantOnboarding", "Merchant onboarding"],
] as const;

export function ControlsTab({
  t,
  controls,
  mfaCode,
  setMfaCode,
  reload,
}: {
  t: Translate;
  controls: Record<string, boolean | string>;
  mfaCode: string;
  setMfaCode: (value: string) => void;
  reload: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await patchThunesControls({ ...payload, mfa_code: mfaCode });
      await reload();
    } catch (err) {
      setError(apiDetail(err, t("thunesControlFailed", "The switch was not updated. A current authenticator code is required.")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={adminUi.card + " space-y-3 p-4"}>
      <p className="text-sm text-slate-600">
        {t(
          "thunesControlsHelp",
          "Turning Thunes off hides Thunes methods for new checkouts immediately. Payments already in progress keep being verified.",
        )}
      </p>
      <StatusLine error={error} notice={null} />
      <MfaField value={mfaCode} onChange={setMfaCode} t={t} />
      <label className="block text-sm">
        {t("activeEnvironment", "Active environment")}
        <select
          className={adminUi.input + " max-w-xs"}
          value={String(controls.active_environment || "sandbox")}
          disabled={busy}
          onChange={(event) => void patch({ active_environment: event.target.value })}
        >
          <option value="sandbox">sandbox</option>
          <option value="live">live</option>
        </select>
      </label>
      <div className="divide-y divide-slate-100">
        {CONTROL_FIELDS.map(([field, key, fallback]) => (
          <Toggle
            key={field}
            label={t(key, fallback)}
            checked={Boolean(controls[field])}
            disabled={busy}
            onChange={(next) => void patch({ [field]: next })}
          />
        ))}
      </div>
    </div>
  );
}

export function CountriesTab({ t }: { t: Translate }) {
  const [rows, setRows] = useState<CountryPaymentConfigAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await fetchPaymentCountryConfigs());
    } catch (err) {
      setError(apiDetail(err, t("thunesLoadFailed", "Thunes settings could not be loaded.")));
      setRows([]);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function update(row: CountryPaymentConfigAdmin, patch: Partial<CountryPaymentConfigAdmin>) {
    setError(null);
    try {
      await updatePaymentCountryConfig(row.id, patch);
      await load();
    } catch (err) {
      setError(apiDetail(err, t("thunesCountryFailed", "The country setting was not saved.")));
    }
  }

  if (rows === null) return <p className="text-sm text-slate-500">{t("loading", "Loading")}</p>;
  return (
    <div className="space-y-2">
      <StatusLine error={error} notice={null} />
      {rows.length === 0 ? <EmptyState text={t("noCountries", "No country payment configuration yet.")} /> : null}
      {rows.map((row) => {
        const approved = row.compliance_status === "approved";
        return (
          <div key={row.id} className={adminUi.card + " grid gap-3 p-4 sm:grid-cols-[1fr_auto]"}>
            <div>
              <p className="font-medium text-slate-900">{row.country_name}</p>
              <p className="text-sm text-slate-500">
                {row.country_code} · {row.currency} · {t("compliance", "Compliance")}: {row.compliance_status || "pending"}
              </p>
              {!approved ? (
                <p className="mt-1 text-xs text-amber-700">
                  {t("thunesComplianceGate", "Thunes stays hidden for customers until compliance approves this country.")}
                </p>
              ) : null}
            </div>
            <div className="min-w-[14rem]">
              <Toggle
                label={t("thunesAccept", "Thunes Accept")}
                checked={Boolean(row.thunes_accept_enabled)}
                onChange={(next) => void update(row, { thunes_accept_enabled: next })}
              />
              <Toggle
                label={t("thunesTransfer", "Thunes Money Transfer")}
                checked={Boolean(row.thunes_money_transfer_enabled)}
                onChange={(next) => void update(row, { thunes_money_transfer_enabled: next })}
              />
              <Toggle
                label={t("thunesRefunds", "Thunes refunds")}
                checked={Boolean(row.thunes_refunds_enabled)}
                onChange={(next) => void update(row, { thunes_refunds_enabled: next })}
              />
            </div>
          </div>
        );
      })}
      <p className="text-sm text-slate-500">
        {t(
          "angolaEftRemains",
          "Angola bank transfer and proof of payment stay available until a Thunes collection method is approved.",
        )}
      </p>
    </div>
  );
}

export function ServicesTab({ t }: { t: Translate }) {
  const [rows, setRows] = useState<Array<{ service_type: string; thunes_enabled: boolean }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await fetchThunesServices());
    } catch (err) {
      setError(apiDetail(err, t("thunesLoadFailed", "Thunes settings could not be loaded.")));
      setRows([]);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (rows === null) return <p className="text-sm text-slate-500">{t("loading", "Loading")}</p>;
  return (
    <div className={adminUi.card + " divide-y divide-slate-100 p-4"}>
      <StatusLine error={error} notice={null} />
      {rows.map((row) => (
        <Toggle
          key={row.service_type}
          label={row.service_type}
          checked={row.thunes_enabled}
          onChange={(next) => {
            setError(null);
            void updateThunesService(row.service_type, next)
              .then(load)
              .catch((err) => setError(apiDetail(err, t("thunesServiceFailed", "The service flag was not saved."))));
          }}
        />
      ))}
    </div>
  );
}
