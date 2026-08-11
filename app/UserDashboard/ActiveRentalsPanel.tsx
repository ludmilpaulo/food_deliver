"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import type { ActiveRentalSummary } from "@/types/propertyApplication";
import {
  downloadAuthenticatedBlob,
  fetchPropertyServices,
} from "@/services/propertyApplicationApi";

type Props = {
  rentals?: ActiveRentalSummary[];
  loading?: boolean;
};

export default function ActiveRentalsPanel({ rentals, loading: loadingProp }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ActiveRentalSummary[]>(rentals || []);
  const [loading, setLoading] = useState(loadingProp ?? rentals === undefined);

  useEffect(() => {
    if (rentals) {
      setItems(
        rentals.filter(
          (item) =>
            item.status === "active" ||
            item.status === "executed" ||
            Boolean(item.lease_id),
        ),
      );
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchPropertyServices()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data.active_rentals) ? data.active_rentals : [];
        setItems(
          list.filter(
            (item) =>
              item.status === "active" ||
              item.status === "executed" ||
              Boolean(item.lease_id),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rentals]);

  const downloadLease = async (path: string) => {
    const blob = await downloadAuthenticatedBlob(path);
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "lease.pdf";
    a.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-blue-900">
        {t("activeRental", "Active rentals")}
      </h2>
      {loading ? (
        <p className="text-slate-500">{t("loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">{t("noApplications")}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.lease_id} className="rounded-2xl border p-4">
              <h3 className="font-semibold">{item.property_title}</h3>
              <p className="text-sm uppercase text-emerald-700">{item.status}</p>
              <dl className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-slate-400">{t("rentalPeriod")}</dt>
                  <dd>
                    {item.start_date || "—"} → {item.end_date || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-400">{t("monthlyRent")}</dt>
                  <dd>
                    {item.currency} {item.monthly_rent || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-400">{t("nextPayment")}</dt>
                  <dd>
                    {t("nextPaymentDay")} {item.next_payment_placeholder} ({t("comingSoon")})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-400">{t("contactOwner")}</dt>
                  <dd>
                    {item.owner_name || "—"}
                    {item.owner_phone ? ` · ${item.owner_phone}` : ""}
                    {item.owner_email ? ` · ${item.owner_email}` : ""}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={`/properties/applications/${item.application_id}`}
                  className="text-sm font-semibold text-teal-700"
                >
                  {t("viewApplication")}
                </Link>
                {item.pdf_download_path ? (
                  <button
                    type="button"
                    className="text-sm font-semibold text-slate-700"
                    onClick={() => void downloadLease(item.pdf_download_path!)}
                  >
                    {t("downloadLeasePdf")}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
