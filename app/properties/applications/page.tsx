"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readAuthToken } from "@/lib/authToken";
import { useTranslation } from "@/hooks/useTranslation";
import type { PropertyApplicationListItem } from "@/types/propertyApplication";
import {
  listPropertyApplications,
  PropertyApplicationApiError,
} from "@/services/propertyApplicationApi";

export default function PropertyApplicationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<PropertyApplicationListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loginHref = `/LoginScreenUser?next=${encodeURIComponent("/properties/applications")}`;

  useEffect(() => {
    if (!readAuthToken()) {
      router.replace(loginHref);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listPropertyApplications()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof PropertyApplicationApiError
            ? err.message
            : t("applicationSubmitFailed"),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loginHref, router, t]);

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t("propertyApplications")}</h1>
        <Link href="/UserDashboard?menu=properties" className="text-sm font-semibold text-teal-700">
          {t("myKudya")}
        </Link>
      </div>
      {loading && <p className="mt-6 text-slate-500">{t("loading")}</p>}
      {error && <p className="mt-4 text-rose-700">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="mt-6 text-slate-500">{t("noApplications")}</p>
      )}
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/properties/applications/${item.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{item.property_title}</h2>
                <p className="text-sm text-slate-500">{item.property_city}</p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase text-teal-800">
                {item.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-700">
              {item.currency} {item.proposed_rent}
            </p>
            {item.submitted_at ? (
              <p className="mt-1 text-xs text-slate-500">
                {t("submittedOn")}: {new Date(item.submitted_at).toLocaleString()}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
