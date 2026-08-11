"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MdHome, MdRefresh, MdVerified } from "react-icons/md";
import { baseAPI } from "@/services/types";
import { readAuthToken } from "@/lib/authToken";
import { useTranslation } from "@/hooks/useTranslation";

type ApplicationRow = {
  id: number;
  property_title: string;
  property_city?: string;
  status: string;
  proposed_rent?: string | null;
  currency?: string;
  submitted_at?: string | null;
  created_at: string;
};

type ApplicationDocument = {
  id: number;
  document_type: string;
  status: string;
  rejection_reason?: string;
};

type ApplicationDetail = ApplicationRow & {
  full_name?: string;
  email?: string;
  phone?: string;
  documents?: ApplicationDocument[];
};

async function adminFetch(path: string, init?: RequestInit) {
  const token = readAuthToken();
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init?.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  if (init?.body && !(init.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  return fetch(`${baseAPI}/properties${path}`, { ...init, headers });
}

export default function PropertyApplicationsAdmin() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/admin/applications/");
      const data: unknown = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        throw new Error(
          data && typeof data === "object" && "detail" in data
            ? String((data as { detail: unknown }).detail)
            : "Failed to load applications",
        );
      }
      setRows(data as ApplicationRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: number) => {
    setBusy(true);
    setError(null);
    try {
      const res = await adminFetch(`/admin/applications/${id}/`);
      const data: unknown = await res.json();
      if (!res.ok || !data || typeof data !== "object") {
        throw new Error("Failed to load application detail");
      }
      setDetail(data as ApplicationDetail);
      setSelectedId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load detail");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return rows;
    if (statusFilter === "stuck_docs") {
      return rows.filter((row) =>
        ["documents_required", "conditionally_approved"].includes(row.status),
      );
    }
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  const verifyDocument = async (docId: number) => {
    if (!selectedId) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminFetch(
        `/admin/applications/${selectedId}/documents/${docId}/verify/`,
        { method: "POST", body: JSON.stringify({ note: "Admin verified stuck document" }) },
      );
      if (!res.ok) throw new Error("Verify failed");
      setMessage(t("documentVerified", "Document verified"));
      await loadDetail(selectedId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setBusy(false);
    }
  };

  const forceDocumentsVerified = async () => {
    if (!selectedId) return;
    setBusy(true);
    try {
      const res = await adminFetch(`/admin/applications/${selectedId}/transition/`, {
        method: "POST",
        body: JSON.stringify({
          status: "documents_verified",
          note: "Admin unblocked documents stage",
        }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        throw new Error(
          data && typeof data === "object" && "detail" in data
            ? String((data as { detail: unknown }).detail)
            : "Transition failed",
        );
      }
      setMessage(t("documentsVerified", "Documents marked verified"));
      await loadDetail(selectedId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transition failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <MdHome className="text-teal-700" />
            {t("propertyApplicationsAdmin", "Property applications")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t(
              "propertyApplicationsAdminDesc",
              "Read-only overview with tools to unblock stuck document reviews.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700"
        >
          <MdRefresh />
          {t("refresh", "Refresh")}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", t("all", "All")],
            ["stuck_docs", t("stuckDocuments", "Stuck documents")],
            ["submitted", t("submitted", "Submitted")],
            ["documents_required", t("documents_required", "Documents required")],
            ["active", t("active", "Active")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              statusFilter === key
                ? "bg-teal-700 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-rose-700">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white">
          {loading ? (
            <p className="p-6 text-sm text-slate-500">{t("loading", "Loading...")}</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">{t("noApplications")}</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(row.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${
                      selectedId === row.id ? "bg-teal-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{row.property_title}</p>
                      <span className="text-[11px] uppercase tracking-wide text-teal-700">
                        {row.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      #{row.id}
                      {row.property_city ? ` · ${row.property_city}` : ""}
                      {row.submitted_at
                        ? ` · ${new Date(row.submitted_at).toLocaleDateString()}`
                        : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-5">
          {!detail ? (
            <p className="text-sm text-slate-500">
              {t("selectApplication", "Select an application to review details.")}
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{detail.property_title}</h3>
                <p className="text-sm uppercase tracking-wide text-teal-700">
                  {detail.status.replace(/_/g, " ")}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {detail.full_name} · {detail.email} · {detail.phone}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">{t("documents")}</h4>
                <ul className="mt-2 space-y-2">
                  {(detail.documents || []).map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{doc.document_type}</p>
                        <p className="text-xs uppercase text-slate-500">{doc.status}</p>
                      </div>
                      {doc.status !== "verified" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void verifyDocument(doc.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          <MdVerified />
                          {t("verify", "Verify")}
                        </button>
                      )}
                    </li>
                  ))}
                  {(detail.documents || []).length === 0 && (
                    <li className="text-sm text-slate-500">{t("noDocumentsRequired")}</li>
                  )}
                </ul>
              </div>

              {["documents_required", "conditionally_approved"].includes(detail.status) && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void forceDocumentsVerified()}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50"
                >
                  {t("forceDocumentsVerified", "Mark documents verified")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
