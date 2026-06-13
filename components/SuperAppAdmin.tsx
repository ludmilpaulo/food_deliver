"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchAdminDashboardStats } from "@/services/platformAdminApi";

interface DashboardStats {
  orders_today: number;
  orders_week: number;
  rides_today: number;
  rides_active: number;
  deliveries_today: number;
  active_drivers: number;
  total_users: number;
}

export default function SuperAppAdmin() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAdminDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = stats
    ? [
        { label: t("ordersToday", "Orders today"), value: stats.orders_today, color: "bg-amber-500" },
        { label: t("orders7d", "Orders (7d)"), value: stats.orders_week, color: "bg-amber-400" },
        { label: t("ridesToday", "Rides today"), value: stats.rides_today, color: "bg-blue-600" },
        { label: t("activeRides", "Active rides"), value: stats.rides_active, color: "bg-blue-500" },
        { label: t("packagesToday", "Packages today"), value: stats.deliveries_today, color: "bg-violet-600" },
        { label: t("driversOnline", "Drivers online"), value: stats.active_drivers, color: "bg-emerald-600" },
        { label: t("totalUsers", "Total users"), value: stats.total_users, color: "bg-slate-700" },
      ]
    : [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-1">{t("kudyaSuperApp", "Kudya Super App")}</h2>
      <p className="text-slate-500 text-sm mb-6">
        {t("platformOverview", "Platform overview — food, rides, deliveries, rentals")}
      </p>
      {loadFailed && (
        <p className="text-amber-700 bg-amber-50 rounded-lg p-3 mb-4 text-sm">
          {t("connectAdminCredentials", "Connect with admin credentials to load super-app stats.")}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`${c.color} text-white rounded-2xl p-5 shadow`}>
            <p className="text-sm opacity-90">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
        {!stats && !loadFailed && (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-6">
        {t("adminApiDocs", "Platform admin APIs")}:{" "}
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_API || "https://kudya-api.onrender.com"}/api/docs/`}
          className="text-blue-600 underline"
          target="_blank"
          rel="noreferrer"
        >
          /api/docs/
        </a>
      </p>
    </div>
  );
}
