"use client";

import { useCallback, useEffect, useState } from "react";
import { MdHome, MdCheck, MdClose, MdBlock, MdRefresh } from "react-icons/md";
import { baseAPI } from "@/services/types";
import { readAuthToken } from "@/lib/authToken";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { useTranslation } from "@/hooks/useTranslation";

type AdminListing = {
  id: number;
  title: string;
  city: string;
  suburb?: string;
  listing_type: string;
  listing_type_display?: string;
  property_type: string;
  property_type_display?: string;
  price: string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  approval_status: string;
  is_approved: boolean;
  is_available: boolean;
  rejection_reason?: string;
  image_urls?: string[];
  images?: { image: string }[];
  created_at: string;
};

type Paginated = {
  count: number;
  results: AdminListing[];
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

export default function PropertyReviewAdmin() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ approval_status: status, page_size: "20" });
      if (search.trim()) params.set("search", search.trim());
      const res = await adminFetch(`/admin/listings/?${params}`);
      const data = (await res.json()) as Paginated | { detail?: string };
      if (!res.ok) {
        throw new Error(
          typeof data === "object" && data && "detail" in data
            ? String(data.detail)
            : "Failed to load listings",
        );
      }
      const page = data as Paginated;
      setListings(Array.isArray(page.results) ? page.results : []);
      setCount(typeof page.count === "number" ? page.count : 0);
    } catch (err) {
      setListings([]);
      setCount(0);
      setMessage(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const coverOf = (item: AdminListing) => {
    if (item.image_urls?.[0]) return resolveMediaUrl(item.image_urls[0]);
    if (item.images?.[0]?.image) return resolveMediaUrl(item.images[0].image);
    return null;
  };

  const approve = async (id: number) => {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await adminFetch(`/admin/listings/${id}/approve/`, { method: "POST", body: "{}" });
      if (!res.ok) throw new Error("Approve failed");
      setMessage(t("listingApproved", "Listing approved"));
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async () => {
    if (!rejectId) return;
    setBusyId(rejectId);
    setMessage(null);
    try {
      const res = await adminFetch(`/admin/listings/${rejectId}/reject/`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (!res.ok) throw new Error("Reject failed");
      setRejectId(null);
      setRejectReason("");
      setMessage(t("listingRejected", "Listing rejected"));
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setBusyId(null);
    }
  };

  const suspend = async (id: number) => {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await adminFetch(`/admin/listings/${id}/suspend/`, { method: "POST", body: "{}" });
      if (!res.ok) throw new Error("Suspend failed");
      setMessage(t("listingSuspended", "Listing suspended"));
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Suspend failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-950 text-white shadow-[0_12px_28px_-18px_rgba(15,23,42,0.35)]">
        <div className="relative bg-[radial-gradient(800px_240px_at_85%_-20%,rgba(245,158,11,0.35),transparent),linear-gradient(135deg,#0b1220_0%,#1e293b_60%,#0f172a_100%)] px-5 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
                Kudya Properties
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {t("propertyReview", "Property review")}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-300">
                {t(
                  "propertyReviewSubtitle",
                  "Approve partner listings before they appear in the marketplace.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/15"
            >
              <MdRefresh size={18} /> {t("refresh", "Refresh")}
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { value: "pending", label: t("pending", "Pending") },
              { value: "approved", label: t("approved", "Approved") },
              { value: "rejected", label: t("rejected", "Rejected") },
              { value: "suspended", label: t("suspended", "Suspended") },
              { value: "all", label: t("all", "All") },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={`rounded-xl px-3.5 py-1.5 text-sm font-semibold transition ${
                  status === tab.value
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchListings", "Search title, city, owner...")}
          className="min-w-[240px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
        />
        <p className="text-sm font-medium text-slate-500">
          {count} {t("listings", "listings")}
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
          {t("loading", "Loading...")}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <MdHome size={48} className="mx-auto text-slate-300" />
          <p className="mt-3 text-slate-600">{t("noListingsToReview", "No listings in this queue")}</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {listings.map((item) => {
            const cover = coverOf(item);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex gap-4 p-4">
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <MdHome className="text-slate-300" size={32} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-semibold text-slate-900">{item.title}</h3>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                        {item.approval_status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {[item.suburb, item.city].filter(Boolean).join(", ")} ·{" "}
                      {item.listing_type_display || item.listing_type}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {item.currency} {item.price} · {item.bedrooms} bed · {item.bathrooms} bath
                    </p>
                    {item.rejection_reason ? (
                      <p className="mt-2 text-xs text-rose-600">{item.rejection_reason}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
                  <button
                    type="button"
                    disabled={busyId === item.id || item.approval_status === "approved"}
                    onClick={() => void approve(item.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    <MdCheck size={14} /> {t("approve", "Approve")}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => {
                      setRejectId(item.id);
                      setRejectReason("");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    <MdClose size={14} /> {t("reject", "Reject")}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id || item.approval_status === "suspended"}
                    onClick={() => void suspend(item.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                  >
                    <MdBlock size={14} /> {t("suspend", "Suspend")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {rejectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("rejectListing", "Reject listing")}
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder={t("rejectionReason", "Reason for rejection")}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="rounded-lg px-3 py-2 text-sm text-slate-600"
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => void reject()}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
              >
                {t("confirmReject", "Confirm reject")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
