"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MdDirections } from "react-icons/md";
import { baseAPI } from "@/services/types";
import { readAuthToken } from "@/lib/authToken";
import { useTranslation } from "@/hooks/useTranslation";
import { getDirectionsUrl, toMapCoords, type MapCoords } from "@/lib/propertyDirections";
import type { PropertyApplicationDetail } from "@/types/propertyApplication";
import {
  confirmPropertyViewing,
  downloadAuthenticatedBlob,
  getPropertyApplication,
  PropertyApplicationApiError,
  requirementLabel,
  reschedulePropertyViewing,
  signLease,
  uploadApplicationDocument,
} from "@/services/propertyApplicationApi";

export default function PropertyApplicationDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();
  const { t, languageCode } = useTranslation();
  const [detail, setDetail] = useState<PropertyApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState("");
  const [busy, setBusy] = useState(false);
  const [directionsCoords, setDirectionsCoords] = useState<MapCoords | null>(null);
  const [fileByType, setFileByType] = useState<Record<string, File | null>>({});
  const [rescheduleNotes, setRescheduleNotes] = useState<Record<number, string>>({});

  const loginHref = `/LoginScreenUser?next=${encodeURIComponent(`/properties/applications/${id}`)}`;

  const loadPropertyDirections = useCallback(async (propertyId: number, token: string) => {
    try {
      const res = await fetch(`${baseAPI}/api/properties/${propertyId}/`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setDirectionsCoords(null);
        return;
      }
      const data: unknown = await res.json();
      if (!data || typeof data !== "object") {
        setDirectionsCoords(null);
        return;
      }
      const row = data as {
        can_get_directions?: boolean;
        latitude?: number | null;
        longitude?: number | null;
        location?: { latitude?: number | null; longitude?: number | null };
      };
      if (!row.can_get_directions) {
        setDirectionsCoords(null);
        return;
      }
      setDirectionsCoords(
        toMapCoords(row.location?.latitude, row.location?.longitude) ||
          toMapCoords(row.latitude, row.longitude),
      );
    } catch {
      setDirectionsCoords(null);
    }
  }, []);

  const load = useCallback(async () => {
    const token = readAuthToken();
    if (!token) {
      router.replace(loginHref);
      return;
    }
    try {
      const next = await getPropertyApplication(id);
      setDetail(next);
      setError(null);
      const hasConfirmedViewing = (next.viewings || []).some(
        (v) => v.status === "confirmed" || v.status === "completed",
      );
      if (hasConfirmedViewing && next.property_listing) {
        await loadPropertyDirections(next.property_listing, token);
      } else {
        setDirectionsCoords(null);
      }
    } catch (err) {
      setError(
        err instanceof PropertyApplicationApiError
          ? err.message
          : t("applicationSubmitFailed"),
      );
    }
  }, [id, t, loadPropertyDirections, loginHref, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const onUploadDocuments = async () => {
    if (!detail) return;
    setBusy(true);
    setError(null);
    try {
      let uploaded = 0;
      for (const [docType, file] of Object.entries(fileByType)) {
        if (!file) continue;
        await uploadApplicationDocument(detail.id, docType, file);
        uploaded += 1;
      }
      if (uploaded === 0) {
        setError(t("selectFile"));
        return;
      }
      setFileByType({});
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("documentUploadFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const onSignLease = async (leaseId: number) => {
    if (!signatureName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await signLease(leaseId, signatureName.trim());
      await load();
    } catch {
      setError(t("leaseSignFailed"));
    } finally {
      setBusy(false);
    }
  };

  const onConfirmViewing = async (vid: number) => {
    setBusy(true);
    setError(null);
    try {
      await confirmPropertyViewing(id, vid);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("applicationSubmitFailed"));
    } finally {
      setBusy(false);
    }
  };

  const onRescheduleViewing = async (vid: number) => {
    const note = (rescheduleNotes[vid] || "").trim();
    if (!note) {
      setError(t("rescheduleNoteRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await reschedulePropertyViewing(id, vid, note);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("applicationSubmitFailed"));
    } finally {
      setBusy(false);
    }
  };

  if (!readAuthToken()) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <p className="mb-4">{t("applicationLoginRequired")}</p>
        <Link className="rounded-xl bg-teal-700 px-4 py-2 text-white" href={loginHref}>
          {t("login")}
        </Link>
      </div>
    );
  }

  if (!detail) {
    return <div className="p-8 text-center text-slate-500">{error || t("loading")}</div>;
  }

  const lease = detail.leases?.[0];
  const canUploadDocs =
    detail.status === "documents_required" ||
    detail.status === "conditionally_approved" ||
    detail.status === "draft" ||
    detail.status === "submitted" ||
    detail.status === "under_review";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <Link href="/properties/applications" className="text-sm text-teal-700">
        ← {t("propertyApplications")}
      </Link>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{detail.property_title}</h1>
        <p className="mt-1 text-sm uppercase tracking-wide text-teal-700">
          {t("applicationStatus")}: {detail.status.replace(/_/g, " ")}
        </p>
      </div>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="font-semibold">{t("applicationTimeline")}</h2>
        <ol className="mt-4 space-y-3">
          {(detail.timeline || []).map((step) => (
            <li key={step.key} className="flex gap-3 text-sm">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  step.state === "done"
                    ? "bg-emerald-500"
                    : step.state === "current"
                      ? "bg-amber-500"
                      : "bg-slate-300"
                }`}
              />
              <div>
                <p className="font-medium">{step.label}</p>
                {step.at && (
                  <p className="text-xs text-slate-500">{new Date(step.at).toLocaleString()}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="font-semibold">{t("documents")}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(detail.documents || []).map((doc) => (
            <li key={doc.id} className="flex justify-between rounded-xl border px-3 py-2">
              <span>{doc.document_type}</span>
              <span className="text-xs font-semibold uppercase">{doc.status}</span>
            </li>
          ))}
          {(detail.documents || []).length === 0 && (
            <li className="text-slate-500">{t("noDocumentsRequired")}</li>
          )}
        </ul>

        {canUploadDocs && (detail.requirements || []).length > 0 && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <h3 className="text-sm font-semibold">{t("requiredDocuments")}</h3>
            {(detail.requirements || []).map((req) => (
              <label key={req.document_type} className="block rounded-xl border p-3 text-sm">
                <span className="font-semibold">
                  {requirementLabel(req, languageCode)}
                  {req.is_required ? " *" : ""}
                </span>
                <input
                  type="file"
                  className="mt-2 block w-full"
                  onChange={(e) =>
                    setFileByType((prev) => ({
                      ...prev,
                      [req.document_type]: e.target.files?.[0] || null,
                    }))
                  }
                />
              </label>
            ))}
            <button
              type="button"
              disabled={busy}
              onClick={() => void onUploadDocuments()}
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? t("loading") : t("uploadDocument")}
            </button>
          </div>
        )}
      </section>

      {(detail.viewings || []).map((v) => (
        <section key={v.id} className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">{t("propertyViewing")}</h2>
          <p className="mt-2 text-sm">{new Date(v.scheduled_at).toLocaleString()}</p>
          <p className="text-sm text-slate-500">{v.location}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{v.status}</p>
          {v.status === "proposed" && (
            <div className="mt-3 space-y-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void onConfirmViewing(v.id)}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {t("confirmViewing")}
              </button>
              <label className="block text-sm">
                <span className="font-medium">{t("rescheduleNote")}</span>
                <textarea
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  rows={2}
                  value={rescheduleNotes[v.id] || ""}
                  onChange={(e) =>
                    setRescheduleNotes((prev) => ({ ...prev, [v.id]: e.target.value }))
                  }
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onRescheduleViewing(v.id)}
                className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                {t("rescheduleViewing")}
              </button>
            </div>
          )}
          {(v.status === "confirmed" || v.status === "completed") && directionsCoords ? (
            <a
              href={getDirectionsUrl(directionsCoords)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              <MdDirections size={18} />
              {t("getDirections", "Get Directions")}
            </a>
          ) : null}
        </section>
      ))}

      {lease ? (
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">{t("lease")}</h2>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs">
            {lease.rendered_body}
          </pre>
          {lease.pdf_download_path && (
            <button
              type="button"
              className="mt-3 inline-block text-sm font-semibold text-teal-700"
              onClick={() => {
                void (async () => {
                  if (!lease.pdf_download_path) return;
                  try {
                    const blob = await downloadAuthenticatedBlob(lease.pdf_download_path);
                    const objectUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = objectUrl;
                    a.download = "lease.pdf";
                    a.click();
                    URL.revokeObjectURL(objectUrl);
                  } catch {
                    setError(t("leaseSignFailed"));
                  }
                })();
              }}
            >
              {t("downloadLeasePdf")}
            </button>
          )}
          {detail.status === "tenant_signature_required" && (
            <div className="mt-4 space-y-2">
              <input
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder={t("signatureName")}
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
              />
              <button
                type="button"
                disabled={busy || !signatureName.trim()}
                onClick={() => void onSignLease(lease.id)}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {t("signLease")}
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">{t("lease")}</h2>
          <p className="mt-2 text-sm text-slate-500">{t("noLeaseAvailable")}</p>
        </section>
      )}

      {error && <p className="text-sm text-rose-700">{error}</p>}
    </div>
  );
}
