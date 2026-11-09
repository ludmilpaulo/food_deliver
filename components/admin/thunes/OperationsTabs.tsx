"use client";

import React, { useCallback, useEffect, useState } from "react";
import { adminUi } from "@/lib/adminUi";
import {
  fetchThunesCompliance,
  fetchThunesReconciliation,
  fetchThunesRfis,
  fetchWalletReconciliation,
  provideThunesRfiInformation,
  resolveThunesReconciliation,
  setThunesCompliance,
  submitThunesRfi,
  syncThunesRfis,
  uploadThunesRfiDocument,
} from "@/services/platformAdminApi";
import type {
  ThunesCountryCompliance,
  ThunesReconciliationRow,
  ThunesRfi,
  WalletReconciliationReport,
} from "@/types/payments";
import { apiDetail, EmptyState, MfaField, StatusLine, type Translate } from "./shared";

const COMPLIANCE_STATUSES = ["pending", "approved", "rejected", "suspended"] as const;

export function ComplianceTab({
  t,
  mfaCode,
  setMfaCode,
}: {
  t: Translate;
  mfaCode: string;
  setMfaCode: (value: string) => void;
}) {
  const [rows, setRows] = useState<ThunesCountryCompliance[] | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await fetchThunesCompliance());
    } catch (err) {
      setError(apiDetail(err, t("thunesComplianceOnly", "Only compliance officers can review countries.")));
      setRows([]);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(row: ThunesCountryCompliance, status: string) {
    setError(null);
    setNotice(null);
    try {
      await setThunesCompliance(row.id, status, mfaCode, note);
      setNotice(t("thunesComplianceSaved", "Compliance status saved."));
      setNote("");
      await load();
    } catch (err) {
      setError(apiDetail(err, t("thunesComplianceFailed", "Compliance status was not saved.")));
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        {t(
          "thunesComplianceHelp",
          "A country is only offered Thunes once compliance approves it. Finance can switch products, but cannot approve a country.",
        )}
      </p>
      <StatusLine error={error} notice={notice} />
      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <MfaField value={mfaCode} onChange={setMfaCode} t={t} />
        <label className="block text-sm">
          <span className="font-medium text-slate-700">{t("decisionNote", "Decision note")}</span>
          <input className={adminUi.input + " mt-1"} value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>
      {rows === null ? <p className="text-sm text-slate-500">{t("loading", "Loading")}</p> : null}
      {rows && rows.length === 0 ? <EmptyState text={t("noCountries", "No country payment configuration yet.")} /> : null}
      {rows?.map((row) => (
        <div key={row.id} className={adminUi.card + " flex flex-wrap items-center justify-between gap-3 p-4 text-sm"}>
          <div>
            <p className="font-medium text-slate-900">
              {row.country_name} ({row.country_code})
            </p>
            <p className="text-slate-500">
              Accept {row.thunes_accept_enabled ? "✓" : "—"} · Money Transfer {row.thunes_money_transfer_enabled ? "✓" : "—"}
            </p>
          </div>
          <select
            className={adminUi.input + " max-w-[12rem]"}
            value={row.compliance_status}
            onChange={(event) => void decide(row, event.target.value)}
          >
            {COMPLIANCE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`compliance_${status}`, status)}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function RfiCard({ t, row, onChanged }: { t: Translate; row: ThunesRfi; onChanged: () => Promise<void> }) {
  const requested = Object.entries(row.requested_information || {}).flatMap(([party, fields]) =>
    (Array.isArray(fields) ? fields : []).map((field) => ({ party, field })),
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [comments, setComments] = useState("");
  const [docType, setDocType] = useState(row.requested_documents[0] ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const closed = row.status === "closed";

  async function run(action: () => Promise<unknown>, success: string, failure: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      await onChanged();
    } catch (err) {
      setError(apiDetail(err, failure));
    } finally {
      setBusy(false);
    }
  }

  function sendInformation() {
    const information: Record<string, Record<string, string>> = {};
    for (const { party, field } of requested) {
      const value = values[`${party}.${field}`]?.trim();
      if (!value) continue;
      information[party] = { ...(information[party] || {}), [field]: value };
    }
    void run(
      () => provideThunesRfiInformation(row.id, information, comments),
      t("thunesRfiInfoSent", "Information sent to Thunes."),
      t("thunesRfiInfoFailed", "Thunes did not accept the information."),
    );
  }

  return (
    <div className={adminUi.card + " space-y-3 p-4 text-sm"}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">
            {t("transfer", "Transfer")} #{row.transfer_id} · {row.transfer_external_id}
          </p>
          <p className="text-slate-500">
            {row.provider_rfi_id ? `RFI ${row.provider_rfi_id}` : t("thunesRfiUnlinked", "Not linked to Thunes yet")} ·{" "}
            {row.provider_status || row.status}
            {row.deadline ? ` · ${t("deadline", "Deadline")}: ${new Date(row.deadline).toLocaleString()}` : ""}
          </p>
        </div>
        <span className={`${adminUi.chip} ${closed ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-800"}`}>
          {row.status}
        </span>
      </div>
      {row.description ? <p className="rounded-xl bg-slate-50 p-3 text-slate-700">{row.description}</p> : null}
      <StatusLine error={error} notice={notice} />
      {requested.length > 0 && !closed ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {requested.map(({ party, field }) => (
            <label key={`${party}.${field}`} className="block">
              <span className="text-xs font-medium text-slate-600">
                {party} · {field}
              </span>
              <input
                className={adminUi.input}
                value={values[`${party}.${field}`] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [`${party}.${field}`]: event.target.value }))}
              />
            </label>
          ))}
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">{t("comments", "Comments")}</span>
            <input className={adminUi.input} maxLength={256} value={comments} onChange={(event) => setComments(event.target.value)} />
          </label>
          <div className="sm:col-span-2">
            <button type="button" className={adminUi.btnGhost} disabled={busy || !row.provider_rfi_id} onClick={sendInformation}>
              {t("sendInformation", "Send information")}
            </button>
          </div>
        </div>
      ) : null}
      {!closed ? (
        <div className="flex flex-wrap items-end gap-2">
          {row.requested_documents.length > 0 ? (
            <label className="block">
              <span className="text-xs font-medium text-slate-600">{t("documentType", "Document type")}</span>
              <select className={adminUi.input} value={docType} onChange={(event) => setDocType(event.target.value)}>
                {row.requested_documents.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block">
            <span className="text-xs font-medium text-slate-600">{t("document", "Document")} (PDF, JPG, PNG · 8 MB)</span>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="block text-sm"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            className={adminUi.btnGhost}
            disabled={busy || !file || !row.provider_rfi_id}
            onClick={() =>
              file &&
              void run(
                () => uploadThunesRfiDocument(row.id, file, docType),
                t("thunesRfiDocSent", "Document uploaded to Thunes."),
                t("thunesRfiDocFailed", "Thunes did not accept the document."),
              )
            }
          >
            {t("uploadDocument", "Upload document")}
          </button>
          <button
            type="button"
            className={adminUi.btnAccent}
            disabled={busy || !row.provider_rfi_id}
            onClick={() =>
              void run(
                () => submitThunesRfi(row.id),
                t("thunesRfiSubmitted", "RFI submitted to Thunes for review."),
                t("thunesRfiSubmitFailed", "Thunes did not accept the submission."),
              )
            }
          >
            {t("submitRfi", "Submit to Thunes")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function RfiTab({ t }: { t: Translate }) {
  const [rows, setRows] = useState<ThunesRfi[] | null>(null);
  const [filter, setFilter] = useState("open");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await fetchThunesRfis(filter || undefined));
    } catch (err) {
      setError(apiDetail(err, t("thunesRfiOnly", "Only compliance officers can open the RFI queue.")));
      setRows([]);
    }
  }, [filter, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function sync() {
    setError(null);
    setNotice(null);
    try {
      const result = await syncThunesRfis(14);
      setNotice(t("thunesRfiSynced", "{count} request(s) synced from Thunes.").replace("{count}", String(result.synced)));
      await load();
    } catch (err) {
      setError(apiDetail(err, t("thunesRfiSyncFailed", "Requests could not be synced from Thunes.")));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select className={adminUi.input + " max-w-[12rem]"} value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="open">{t("open", "Open")}</option>
          <option value="submitted">{t("submitted", "Submitted")}</option>
          <option value="closed">{t("closed", "Closed")}</option>
          <option value="">{t("all", "All")}</option>
        </select>
        <button type="button" className={adminUi.btnGhost} onClick={() => void sync()}>
          {t("syncFromThunes", "Sync from Thunes")}
        </button>
      </div>
      <StatusLine error={error} notice={notice} />
      {rows === null ? <p className="text-sm text-slate-500">{t("loading", "Loading")}</p> : null}
      {rows && rows.length === 0 ? <EmptyState text={t("thunesNoRfi", "No requests for information.")} /> : null}
      {rows?.map((row) => <RfiCard key={row.id} t={t} row={row} onChanged={load} />)}
    </div>
  );
}

export function ReconciliationTab({ t }: { t: Translate }) {
  const [rows, setRows] = useState<ThunesReconciliationRow[] | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletReconciliationReport | null>(null);

  useEffect(() => {
    fetchWalletReconciliation()
      .then(setWallets)
      .catch(() => setWallets(null));
  }, []);

  const load = useCallback(async () => {
    try {
      setRows(await fetchThunesReconciliation(showResolved));
    } catch (err) {
      setError(apiDetail(err, t("thunesLoadFailed", "Thunes settings could not be loaded.")));
      setRows([]);
    }
  }, [showResolved, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolve(row: ThunesReconciliationRow) {
    setError(null);
    try {
      await resolveThunesReconciliation(row.id, notes[row.id] ?? "");
      await load();
    } catch (err) {
      setError(apiDetail(err, t("thunesResolveFailed", "The exception was not resolved.")));
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        {t(
          "thunesReconciliationHelp",
          "Mismatches between Thunes and the Kudya ledger. Fix the cause first, then record how it was resolved.",
        )}
      </p>
      {wallets ? (
        <div className={adminUi.card + " p-4 text-sm"}>
          <p className={adminUi.kpiLabel}>{t("walletLedgerCheck", "Wallet balances versus ledger")}</p>
          {wallets.currencies.length === 0 ? (
            <p className="mt-2 text-slate-500">{t("none", "None")}</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="py-1 pr-4">{t("currency", "Currency")}</th>
                    <th className="py-1 pr-4">{t("walletLiabilities", "Wallet balances")}</th>
                    <th className="py-1 pr-4">{t("ledgerLiabilities", "Ledger")}</th>
                    <th className="py-1">{t("difference", "Difference")}</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.currencies.map((row) => (
                    <tr key={row.currency} className="border-t border-slate-100">
                      <td className="py-1 pr-4">{row.currency}</td>
                      <td className="py-1 pr-4">{row.wallet_liabilities}</td>
                      <td className="py-1 pr-4">{row.ledger_liabilities}</td>
                      <td className={"py-1 " + (Number(row.difference) !== 0 ? "font-semibold text-red-700" : "")}>{row.difference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500">
            {t("walletMismatchCount", "Wallets out of balance: {count}").replace("{count}", String(wallets.mismatches.length))}
          </p>
        </div>
      ) : null}
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={showResolved} onChange={(event) => setShowResolved(event.target.checked)} />
        {t("showResolved", "Show resolved")}
      </label>
      <StatusLine error={error} notice={null} />
      {rows === null ? <p className="text-sm text-slate-500">{t("loading", "Loading")}</p> : null}
      {rows && rows.length === 0 ? <EmptyState text={t("thunesNoReconciliation", "No reconciliation exceptions.")} /> : null}
      {rows?.map((row) => (
        <div key={row.id} className={adminUi.card + " space-y-2 p-4 text-sm"}>
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-medium text-slate-900">
              {row.kind} {row.reference ? `· ${row.reference}` : ""}
            </p>
            <span className="text-xs text-slate-500">{new Date(row.created_at).toLocaleString()}</span>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(row.detail, null, 2)}</pre>
          {!row.resolved ? (
            <div className="flex flex-wrap gap-2">
              <input
                className={adminUi.input + " max-w-md"}
                placeholder={t("resolutionNote", "How was this resolved?")}
                value={notes[row.id] ?? ""}
                onChange={(event) => setNotes((current) => ({ ...current, [row.id]: event.target.value }))}
              />
              <button type="button" className={adminUi.btnGhost} disabled={!notes[row.id]?.trim()} onClick={() => void resolve(row)}>
                {t("markResolved", "Mark resolved")}
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
