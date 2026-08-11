"use client";

import { useCallback, useEffect, useState } from "react";
import { baseAPI } from "@/services/api";
import { readAuthToken } from "@/lib/authToken";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";

type ApplicationDocument = {
  id: number;
  document_type: string;
  status: string;
  original_filename?: string;
  rejection_reason?: string;
};

type Viewing = {
  id: number;
  scheduled_at: string;
  location: string;
  status: string;
};

type Lease = {
  id: number;
  status: string;
  monthly_rent: string;
  deposit: string;
  currency: string;
  rendered_body: string;
  signatures: Array<{ role: string; is_signed: boolean; signature_name: string }>;
};

type ApplicationDetail = {
  id: number;
  property_title: string;
  property_city?: string;
  status: string;
  full_name: string;
  email: string;
  phone: string;
  current_address: string;
  employment_status: string;
  occupation: string;
  move_in_date: string | null;
  rental_period_months: number | null;
  adults: number;
  children: number;
  proposed_rent: string | null;
  proposed_deposit: string | null;
  currency: string;
  additional_notes: string;
  preferred_lease_language: string;
  documents: ApplicationDocument[];
  viewings: Viewing[];
  leases: Lease[];
};

type Props = {
  applicationId: number;
  onClose: () => void;
  onUpdated: () => void;
};

async function partnerApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = readAuthToken();
  if (!token) throw new Error("Authentication required");
  const res = await fetch(`${baseAPI}/api/properties${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers || {}),
    },
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Request failed";
    throw new Error(detail);
  }
  return data as T;
}

export default function PartnerApplicationReview({ applicationId, onClose, onUpdated }: Props) {
  const { pt, languageCode } = usePropertyTranslation();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [proposedRent, setProposedRent] = useState("");
  const [proposedDeposit, setProposedDeposit] = useState("");
  const [specialConditions, setSpecialConditions] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [documentReason, setDocumentReason] = useState("");
  const [viewingAt, setViewingAt] = useState("");
  const [viewingLocation, setViewingLocation] = useState("");
  const [signatureName, setSignatureName] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const detail = await partnerApi<ApplicationDetail>(`/me/applications/${applicationId}/`);
      setApp(detail);
      setProposedRent(detail.proposed_rent || "");
      setProposedDeposit(detail.proposed_deposit || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : pt("applicationLoadError"));
    }
  }, [applicationId, pt]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await load();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : pt("applicationActionFailed"));
    } finally {
      setBusy(false);
    }
  };

  if (!app) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        {error ? <p className="text-rose-700">{error}</p> : <p className="text-slate-500">{pt("loadingDashboard")}</p>}
        <button type="button" className="mt-4 text-sm font-semibold text-teal-700" onClick={onClose}>
          {pt("cancel")}
        </button>
      </div>
    );
  }

  const lease = app.leases?.[0];
  const canReview = app.status === "submitted";
  const canDecide = app.status === "under_review" || app.status === "viewing_completed";
  const canGenerateLease = app.status === "documents_verified";
  const canOwnerSign = lease?.status === "awaiting_owner";

  return (
    <div className="space-y-4 rounded-2xl border border-teal-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{app.property_title}</h3>
          <p className="text-sm capitalize text-teal-700">{app.status.replaceAll("_", " ")}</p>
        </div>
        <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500">
          {pt("cancel")}
        </button>
      </div>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p> : null}

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">{pt("applicationName")}</dt><dd className="font-medium">{app.full_name}</dd></div>
        <div><dt className="text-slate-500">{pt("applicationEmail")}</dt><dd className="font-medium">{app.email}</dd></div>
        <div><dt className="text-slate-500">{pt("applicationPhone")}</dt><dd className="font-medium">{app.phone}</dd></div>
        <div><dt className="text-slate-500">{pt("applicationEmployment")}</dt><dd className="font-medium">{app.employment_status} · {app.occupation}</dd></div>
        <div className="sm:col-span-2"><dt className="text-slate-500">{pt("applicationAddress")}</dt><dd className="font-medium">{app.current_address}</dd></div>
        <div><dt className="text-slate-500">{pt("applicationMoveIn")}</dt><dd className="font-medium">{app.move_in_date || "—"}</dd></div>
        <div><dt className="text-slate-500">{pt("applicationPeriod")}</dt><dd className="font-medium">{app.rental_period_months ?? "—"}</dd></div>
      </dl>

      {canReview ? (
        <button
          type="button"
          disabled={busy}
          className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() => void run(() => partnerApi(`/me/applications/${app.id}/review/`, { method: "POST", body: "{}" }))}
        >
          {pt("applicationStartReview")}
        </button>
      ) : null}

      {canDecide ? (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800">{pt("applicationDecision")}</h4>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={pt("applicationProposedRent")} value={proposedRent} onChange={(e) => setProposedRent(e.target.value)} />
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={pt("applicationProposedDeposit")} value={proposedDeposit} onChange={(e) => setProposedDeposit(e.target.value)} />
          <textarea className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={pt("applicationSpecialConditions")} value={specialConditions} onChange={(e) => setSpecialConditions(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              onClick={() =>
                void run(() =>
                  partnerApi(`/me/applications/${app.id}/approve/`, {
                    method: "POST",
                    body: JSON.stringify({
                      proposed_rent: proposedRent || undefined,
                      proposed_deposit: proposedDeposit || undefined,
                      special_conditions: specialConditions,
                    }),
                  }),
                )
              }
            >
              {pt("applicationApprove")}
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              onClick={() =>
                void run(() =>
                  partnerApi(`/me/applications/${app.id}/reject/`, {
                    method: "POST",
                    body: JSON.stringify({ reason: rejectionReason || "Rejected by owner" }),
                  }),
                )
              }
            >
              {pt("applicationReject")}
            </button>
          </div>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={pt("applicationRejectionReason")} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="rounded-lg border px-3 py-2 text-sm" type="datetime-local" value={viewingAt} onChange={(e) => setViewingAt(e.target.value)} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder={pt("applicationViewingLocation")} value={viewingLocation} onChange={(e) => setViewingLocation(e.target.value)} />
          </div>
          <button
            type="button"
            disabled={busy || !viewingAt}
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            onClick={() =>
              void run(() =>
                partnerApi(`/me/applications/${app.id}/viewing/`, {
                  method: "POST",
                  body: JSON.stringify({ scheduled_at: viewingAt, location: viewingLocation }),
                }),
              )
            }
          >
            {pt("applicationProposeViewing")}
          </button>
        </div>
      ) : null}

      {app.documents?.length ? (
        <div className="space-y-2 rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800">{pt("requiredDocuments")}</h4>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={pt("applicationDocumentRejectReason")} value={documentReason} onChange={(e) => setDocumentReason(e.target.value)} />
          {app.documents.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span>{doc.document_type} · {doc.status}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy || doc.status === "verified"}
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  onClick={() => void run(() => partnerApi(`/me/applications/${app.id}/documents/${doc.id}/verify/`, { method: "POST", body: "{}" }))}
                >
                  {pt("applicationVerifyDocument")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  onClick={() =>
                    void run(() =>
                      partnerApi(`/me/applications/${app.id}/documents/${doc.id}/reject/`, {
                        method: "POST",
                        body: JSON.stringify({ reason: documentReason || "Please re-upload" }),
                      }),
                    )
                  }
                >
                  {pt("applicationRejectDocument")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {canGenerateLease ? (
        <button
          type="button"
          disabled={busy}
          className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() =>
            void run(() =>
              partnerApi(`/me/applications/${app.id}/generate-lease/`, {
                method: "POST",
                body: JSON.stringify({ language: app.preferred_lease_language || languageCode }),
              }),
            )
          }
        >
          {pt("applicationGenerateLease")}
        </button>
      ) : null}

      {lease ? (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800">{pt("lease")} · {lease.status}</h4>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            {lease.rendered_body}
          </pre>
          {canOwnerSign ? (
            <div className="flex flex-wrap gap-2">
              <input className="flex-1 rounded-lg border px-3 py-2 text-sm" placeholder={pt("applicationSignatureName")} value={signatureName} onChange={(e) => setSignatureName(e.target.value)} />
              <button
                type="button"
                disabled={busy || !signatureName.trim()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() =>
                  void run(() =>
                    partnerApi(`/me/leases/${lease.id}/sign/`, {
                      method: "POST",
                      body: JSON.stringify({ signature_name: signatureName.trim() }),
                    }),
                  )
                }
              >
                {pt("applicationSignLease")}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
