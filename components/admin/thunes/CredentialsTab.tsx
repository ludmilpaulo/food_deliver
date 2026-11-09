"use client";

import React, { useState } from "react";
import { adminUi } from "@/lib/adminUi";
import {
  decideThunesApproval,
  fetchThunesCredentialHistory,
  saveThunesCredentials,
  setThunesProductActive,
  testThunesConnection,
} from "@/services/platformAdminApi";
import type { ThunesCredentialState, ThunesCredentialVersion } from "@/types/payments";
import { apiDetail, MfaField, StatusLine, type Translate } from "./shared";

const DEFAULT_HOSTS: Record<string, Record<string, string>> = {
  accept: { sandbox: "https://api.limonetik.com", live: "https://api.limonetik.com" },
  money_transfer: { sandbox: "https://api-mt.pre.thunes.com", live: "https://api-mt.thunes.com" },
};

type Props = {
  t: Translate;
  credentials: ThunesCredentialState[];
  mfaCode: string;
  setMfaCode: (value: string) => void;
  reload: () => Promise<void>;
};

export default function CredentialsTab({ t, credentials, mfaCode, setMfaCode, reload }: Props) {
  const [product, setProduct] = useState("accept");
  const [environment, setEnvironment] = useState("sandbox");
  const [baseUrl, setBaseUrl] = useState(DEFAULT_HOSTS.accept.sandbox);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<{ key: string; rows: ThunesCredentialVersion[] } | null>(null);

  function pick(nextProduct: string, nextEnvironment: string) {
    setProduct(nextProduct);
    setEnvironment(nextEnvironment);
    setBaseUrl(DEFAULT_HOSTS[nextProduct]?.[nextEnvironment] ?? "");
  }

  async function run(action: () => Promise<string | null>, failure: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const message = await action();
      if (message) setNotice(message);
      await reload();
    } catch (err) {
      setError(apiDetail(err, failure));
    } finally {
      setBusy(false);
    }
  }

  function onSave(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      const saved = (await saveThunesCredentials({
        product,
        environment,
        base_url: baseUrl,
        api_key: apiKey,
        api_secret: apiSecret,
        mfa_code: mfaCode,
      })) as ThunesCredentialState;
      setApiKey("");
      setApiSecret("");
      setMfaCode("");
      const base =
        environment === "live"
          ? t("thunesLivePending", "Production credentials are stored and waiting for a second administrator.")
          : t("thunesSaved", "Sandbox credentials were saved. Only a masked hint is shown after this.");
      return saved?.key_hint ? `${base} (${saved.key_hint})` : base;
    }, t("thunesSaveFailed", "Credentials were not saved. Check the authenticator code and the Thunes host."));
  }

  function onTest(row: ThunesCredentialState) {
    void run(async () => {
      const result = (await testThunesConnection({
        product: row.product,
        environment: row.environment,
        mfa_code: mfaCode,
      })) as { ok: boolean; detail: string };
      if (!result.ok) throw new Error(result.detail);
      return result.detail;
    }, t("thunesTestFailed", "Connection test failed."));
  }

  function onActive(row: ThunesCredentialState, active: boolean) {
    void run(async () => {
      await setThunesProductActive({ product: row.product, environment: row.environment, active, mfa_code: mfaCode });
      return active ? t("thunesActivated", "Product activated.") : t("thunesDeactivated", "Product deactivated.");
    }, t("thunesActiveFailed", "The product could not be changed. A current authenticator code is required."));
  }

  function onDecide(row: ThunesCredentialState, approve: boolean) {
    if (!row.pending_approval_id) return;
    const approvalId = row.pending_approval_id;
    void run(async () => {
      const result = await decideThunesApproval(approvalId, approve, mfaCode);
      return result.status === "approved"
        ? t("thunesApprovalDone", "Production credentials approved and active.")
        : t("thunesApprovalRejected", "Production credentials rejected.");
    }, t("thunesApprovalFailed", "The decision was not saved. The approver must be a different super admin."));
  }

  async function onHistory(row: ThunesCredentialState) {
    const key = `${row.product}-${row.environment}`;
    if (history?.key === key) {
      setHistory(null);
      return;
    }
    try {
      setHistory({ key, rows: await fetchThunesCredentialHistory(row.product, row.environment) });
    } catch (err) {
      setError(apiDetail(err, t("thunesHistoryFailed", "Version history could not be loaded.")));
    }
  }

  return (
    <div className="space-y-4">
      <StatusLine error={error} notice={notice} />
      <div className="grid gap-3 lg:grid-cols-2">
        {credentials.map((row) => {
          const key = `${row.product}-${row.environment}`;
          return (
            <div key={key} className={adminUi.card + " space-y-2 p-4 text-sm"}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">
                  {row.product === "accept" ? "Accept" : "Money Transfer"} · {row.environment}
                </p>
                <span
                  className={`${adminUi.chip} ${
                    row.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {row.active ? t("active", "Active") : t("inactive", "Inactive")}
                </span>
              </div>
              <p className="text-slate-600">
                {t("credentialStatus", "Credentials")}: {row.credentials_status}
                {row.key_hint ? ` · ${row.key_hint}` : ""}
                {row.credential_version ? ` · v${row.credential_version}` : ""}
              </p>
              <p className="break-all text-xs text-slate-500">
                {t("callbackUrl", "Callback URL")}: {row.callback_url}
              </p>
              {row.last_test_at ? (
                <p className="text-xs text-slate-500">
                  {t("lastConnectionTest", "Last connection test")}: {new Date(row.last_test_at).toLocaleString()} ·{" "}
                  {row.last_test_ok ? t("passed", "passed") : t("failed", "failed")}
                </p>
              ) : null}
              {row.pending_approval_id ? (
                <div className="rounded-xl bg-amber-50 p-3 text-amber-900">
                  <p>{t("thunesApprovalWaiting", "New production credentials are waiting for approval.")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" className={adminUi.btnAccent} disabled={busy} onClick={() => onDecide(row, true)}>
                      {t("approve", "Approve")}
                    </button>
                    <button type="button" className={adminUi.btnGhost} disabled={busy} onClick={() => onDecide(row, false)}>
                      {t("reject", "Reject")}
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  className={adminUi.btnGhost}
                  disabled={busy || row.credentials_status === "not_configured"}
                  onClick={() => onTest(row)}
                >
                  {t("testConnection", "Test connection")}
                </button>
                <button
                  type="button"
                  className={adminUi.btnGhost}
                  disabled={busy || row.credentials_status !== "configured"}
                  onClick={() => onActive(row, !row.active)}
                >
                  {row.active ? t("deactivate", "Deactivate") : t("activate", "Activate")}
                </button>
                <button type="button" className={adminUi.btnGhost} onClick={() => void onHistory(row)}>
                  {t("versionHistory", "Version history")}
                </button>
                <button type="button" className={adminUi.btnGhost} onClick={() => pick(row.product, row.environment)}>
                  {t("replaceCredentials", "Replace credentials")}
                </button>
              </div>
              {history?.key === key ? (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 text-xs">
                  {history.rows.length === 0 ? <li className="p-2 text-slate-500">{t("none", "None")}</li> : null}
                  {history.rows.map((version) => (
                    <li key={version.version} className="flex flex-wrap justify-between gap-2 p-2">
                      <span>
                        v{version.version} · {version.key_hint} {version.is_active ? `· ${t("active", "Active")}` : ""}
                      </span>
                      <span className="text-slate-500">
                        {version.created_by || "—"} · {new Date(version.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <form className={adminUi.card + " space-y-3 p-4"} onSubmit={onSave}>
        <p className="text-sm font-semibold text-slate-900">{t("saveCredentials", "Save credentials")}</p>
        <p className="text-sm text-slate-600">
          {t(
            "thunesLiveApproval",
            "Sandbox can be saved by one super admin. Production stays pending until a different super admin approves it.",
          )}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            {t("product", "Product")}
            <select className={adminUi.input} value={product} onChange={(event) => pick(event.target.value, environment)}>
              <option value="accept">Accept</option>
              <option value="money_transfer">Money Transfer</option>
            </select>
          </label>
          <label className="block text-sm">
            {t("environment", "Environment")}
            <select className={adminUi.input} value={environment} onChange={(event) => pick(product, event.target.value)}>
              <option value="sandbox">sandbox</option>
              <option value="live">live</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          {t("baseUrl", "API base URL")}
          <input className={adminUi.input} value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            {t("apiKey", "API key")}
            <input
              className={adminUi.input}
              type="password"
              autoComplete="new-password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
          <label className="block text-sm">
            {t("apiSecret", "API secret")}
            <input
              className={adminUi.input}
              type="password"
              autoComplete="new-password"
              value={apiSecret}
              onChange={(event) => setApiSecret(event.target.value)}
            />
          </label>
        </div>
        <MfaField value={mfaCode} onChange={setMfaCode} t={t} />
        <button className={adminUi.btnAccent} type="submit" disabled={busy || !apiKey || !apiSecret}>
          {t("saveCredentials", "Save credentials")}
        </button>
      </form>
    </div>
  );
}
