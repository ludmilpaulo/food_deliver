"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { baseAPI } from "@/services/types";
import { readAuthToken } from "@/lib/authToken";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { useUserRegion } from "@/hooks/useUserRegion";

type StayBooking = {
  id: number;
  booking_code: string;
  property_id: number;
  property_title: string;
  property_city: string;
  check_in: string;
  check_out: string;
  nights: number;
  status: string;
  currency: string;
  total_amount: string;
};

export default function StayBookingsPanel() {
  const { t } = useTranslation();
  const { region: regionCode } = useUserRegion();
  const [items, setItems] = useState<StayBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${baseAPI}/properties/me/bookings/`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setItems(data as StayBooking[]);
        else setItems([]);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-900">{t("upcomingStays", "Upcoming stays")}</h2>
        <Link href="/properties?purpose=stay" className="text-sm font-semibold text-teal-700">
          {t("browseStays", "Browse stays")}
        </Link>
      </div>
      {loading ? (
        <p className="text-slate-500">{t("loading", "Loading...")}</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">{t("noStayBookings", "You have no stay bookings yet.")}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const currencyCode = (item.currency || getCurrencyForCountry(regionCode) || "USD") as
              | "AOA"
              | "USD"
              | "EUR";
            return (
              <li key={item.id}>
                <Link
                  href={`/properties/bookings/${item.id}`}
                  className="block rounded-2xl border border-blue-100 bg-white p-4 hover:border-teal-300"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold text-slate-900">{item.property_title}</span>
                    <span className="text-xs uppercase text-teal-700">
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.property_city} · {item.booking_code}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.check_in} → {item.check_out} · {item.nights} {t("nights", "nights")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#0f766e]">
                    {formatCurrency(parseFloat(item.total_amount), currencyCode)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
