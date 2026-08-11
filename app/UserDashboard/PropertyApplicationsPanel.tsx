"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import type { PropertyApplicationListItem } from "@/types/propertyApplication";
import { listPropertyApplications } from "@/services/propertyApplicationApi";

export default function PropertyApplicationsPanel() {
  const { t } = useTranslation();
  const [items, setItems] = useState<PropertyApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listPropertyApplications()
      .then((data) => {
        if (!cancelled) setItems(data);
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
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-900">{t("propertyApplications")}</h2>
        <Link href="/properties" className="text-sm font-semibold text-teal-700">
          {t("Properties")}
        </Link>
      </div>
      {loading ? (
        <p className="text-slate-500">{t("loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">{t("noApplications")}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/properties/applications/${item.id}`}
                className="block rounded-2xl border border-blue-100 bg-white p-4 hover:border-teal-300"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-slate-900">{item.property_title}</span>
                  <span className="text-xs uppercase text-teal-700">
                    {item.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.property_city}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
