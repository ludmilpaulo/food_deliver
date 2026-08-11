"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MdReceiptLong,
  MdLocalTaxi,
  MdLocalShipping,
  MdPeople,
  MdDirectionsCar,
  MdInventory2,
  MdTrendingUp,
  MdOpenInNew,
  MdStorefront,
  MdVerifiedUser,
  MdHome,
  MdTune,
  MdSupportAgent,
  MdPayments,
  MdArrowForward,
  MdRefresh,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchAdminDashboardStats } from "@/services/platformAdminApi";
import { adminPanelUrl } from "@/configs/adminNav";
import type { AdminPanelId } from "@/app/AdminDashboard/adminPanels";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { adminUi } from "@/lib/adminUi";

interface DashboardStats {
  orders_today: number;
  orders_week: number;
  rides_today: number;
  rides_active: number;
  deliveries_today: number;
  active_drivers: number;
  total_users: number;
}

type KpiTone = "amber" | "blue" | "violet" | "emerald" | "slate" | "sky";

const TONE_STYLES: Record<
  KpiTone,
  { icon: string; accent: string; bar: string }
> = {
  amber: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    accent: "text-amber-700",
    bar: "from-amber-400 to-orange-400",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    accent: "text-blue-700",
    bar: "from-blue-500 to-sky-400",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    accent: "text-violet-700",
    bar: "from-violet-500 to-fuchsia-400",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    accent: "text-emerald-700",
    bar: "from-emerald-500 to-teal-400",
  },
  slate: {
    icon: "bg-slate-100 text-slate-700 ring-slate-200",
    accent: "text-slate-700",
    bar: "from-slate-500 to-slate-400",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600 ring-sky-100",
    accent: "text-sky-700",
    bar: "from-sky-500 to-cyan-400",
  },
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

export default function SuperAppAdmin() {
  const { t } = useTranslation();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setLoadFailed(false);
    fetchAdminDashboardStats()
      .then((data) => {
        setStats(data);
        setLoadFailed(false);
      })
      .catch(() => {
        setLoadFailed(true);
        setStats(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminDashboardStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setLoadFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
          setStats(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const go = (panel: AdminPanelId) => {
    router.push(adminPanelUrl(panel));
  };

  const kpis = useMemo(() => {
    if (!stats) return [];
    return [
      {
        key: "orders_today",
        label: t("ordersToday", "Orders today"),
        value: stats.orders_today,
        hint: t("orders7d", "Orders (7d)") + `: ${formatNumber(stats.orders_week)}`,
        icon: <MdReceiptLong className="text-xl" />,
        tone: "amber" as const,
        panel: "orders" as AdminPanelId,
      },
      {
        key: "rides_today",
        label: t("ridesToday", "Rides today"),
        value: stats.rides_today,
        hint: t("activeRides", "Active rides") + `: ${formatNumber(stats.rides_active)}`,
        icon: <MdLocalTaxi className="text-xl" />,
        tone: "blue" as const,
        panel: "drivers" as AdminPanelId,
      },
      {
        key: "deliveries_today",
        label: t("packagesToday", "Packages today"),
        value: stats.deliveries_today,
        hint: t("deliveriesLive", "Parcel & courier volume"),
        icon: <MdInventory2 className="text-xl" />,
        tone: "violet" as const,
        panel: "orders" as AdminPanelId,
      },
      {
        key: "active_drivers",
        label: t("driversOnline", "Drivers online"),
        value: stats.active_drivers,
        hint: t("fleetAvailability", "Fleet availability right now"),
        icon: <MdDirectionsCar className="text-xl" />,
        tone: "emerald" as const,
        panel: "drivers" as AdminPanelId,
      },
      {
        key: "total_users",
        label: t("totalUsers", "Total users"),
        value: stats.total_users,
        hint: t("registeredAccounts", "Registered platform accounts"),
        icon: <MdPeople className="text-xl" />,
        tone: "slate" as const,
        panel: "customers" as AdminPanelId,
      },
      {
        key: "orders_week",
        label: t("orders7d", "Orders (7d)"),
        value: stats.orders_week,
        hint: t("weeklyMomentum", "Weekly order momentum"),
        icon: <MdTrendingUp className="text-xl" />,
        tone: "sky" as const,
        panel: "reports" as AdminPanelId,
      },
    ];
  }, [stats, t]);

  const shortcuts: {
    key: AdminPanelId;
    title: string;
    desc: string;
    icon: React.ReactNode;
    tone: string;
  }[] = [
    {
      key: "orders",
      title: t("orders", "Orders"),
      desc: t("ordersAdminDesc", "Monitor and manage customer orders"),
      icon: <MdReceiptLong className="text-lg" />,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      key: "stores",
      title: t("stores", "Stores"),
      desc: t("storesAdminDesc", "Partner stores and restaurant accounts"),
      icon: <MdStorefront className="text-lg" />,
      tone: "bg-orange-50 text-orange-600",
    },
    {
      key: "drivers",
      title: t("drivers", "Drivers"),
      desc: t("driversAdminDesc", "Fleet operations and live status"),
      icon: <MdLocalShipping className="text-lg" />,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      key: "kyc",
      title: t("kyc", "KYC"),
      desc: t("kycAdminDesc", "Identity verification queue"),
      icon: <MdVerifiedUser className="text-lg" />,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      key: "propertyReview",
      title: t("propertyReview", "Property review"),
      desc: t("propertyReviewAdminDesc", "Approve or suspend property listings"),
      icon: <MdHome className="text-lg" />,
      tone: "bg-teal-50 text-teal-600",
    },
    {
      key: "platformControl",
      title: t("platformServices", "Services"),
      desc: t("platformServicesAdminDesc", "Enable and configure platform modules"),
      icon: <MdTune className="text-lg" />,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      key: "liveSupport",
      title: t("liveSupport", "Live support"),
      desc: t("liveSupportAdminDesc", "Active support conversations"),
      icon: <MdSupportAgent className="text-lg" />,
      tone: "bg-rose-50 text-rose-600",
    },
    {
      key: "payouts",
      title: t("payouts", "Payouts"),
      desc: t("payoutsAdminDesc", "Partner and driver settlements"),
      icon: <MdPayments className="text-lg" />,
      tone: "bg-indigo-50 text-indigo-600",
    },
  ];

  const focusItems: { key: AdminPanelId; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: "kyc",
      title: t("reviewKyc", "Review KYC"),
      desc: t("reviewKycHint", "Clear identity checks waiting in the queue"),
      icon: <MdVerifiedUser className="text-lg" />,
    },
    {
      key: "propertyReview",
      title: t("approveListings", "Approve listings"),
      desc: t("approveListingsHint", "Moderate new property marketplace submissions"),
      icon: <MdHome className="text-lg" />,
    },
    {
      key: "doctorVerification",
      title: t("doctorVerification", "Doctor verification"),
      desc: t("doctorVerificationAdminDesc", "Review doctor credentials"),
      icon: <MdPeople className="text-lg" />,
    },
    {
      key: "driverVerification",
      title: t("driverVerification", "Driver verification"),
      desc: t("driverVerificationAdminDesc", "Review driver documents"),
      icon: <MdLocalShipping className="text-lg" />,
    },
  ];

  const apiDocs = `${process.env.NEXT_PUBLIC_BASE_API || "https://www.kudya.store"}/api/docs/`;

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title={t("kudyaSuperApp", "Kudya Super App")}
        subtitle={t(
          "platformOverview",
          "Live overview across food, rides, deliveries, and marketplace — start here every day.",
        )}
        badge={
          <span className={`${adminUi.chip} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t("liveOps", "Live operations")}
          </span>
        }
        actions={
          <button type="button" onClick={load} className={adminUi.btnGhost} disabled={loading}>
            <MdRefresh className={loading ? "animate-spin text-base" : "text-base"} />
            {t("refreshStats", "Refresh stats")}
          </button>
        }
      />

      {loadFailed ? (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3.5 text-sm text-amber-950 shadow-sm">
          <p className="font-semibold">{t("statsUnavailable", "Stats unavailable")}</p>
          <p className="mt-0.5 text-amber-900/80">
            {t(
              "connectAdminCredentials",
              "Connect with admin credentials to load super-app stats.",
            )}
          </p>
        </div>
      ) : null}

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className={adminUi.sectionTitle}>{t("keyMetrics", "Key metrics")}</h2>
            <p className={adminUi.sectionSub}>
              {t("keyMetricsHint", "Tap a card to jump into the related admin panel.")}
            </p>
          </div>
        </div>

        {loading && !stats ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${adminUi.card} h-[8.5rem] animate-pulse bg-slate-100/90`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {kpis.map((kpi) => {
              const tone = TONE_STYLES[kpi.tone];
              return (
                <button
                  key={kpi.key}
                  type="button"
                  onClick={() => go(kpi.panel)}
                  className={`${adminUi.cardHover} group relative overflow-hidden p-4 text-left`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.bar} opacity-80 transition group-hover:opacity-100`}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tone.icon}`}
                    >
                      {kpi.icon}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                      {t("open", "Open")}
                      <MdArrowForward className="text-xs opacity-0 transition group-hover:opacity-100" />
                    </span>
                  </div>
                  <p className={`mt-4 ${adminUi.kpiLabel}`}>{kpi.label}</p>
                  <p className={adminUi.kpiValue}>{formatNumber(kpi.value)}</p>
                  <p className="mt-1 text-xs text-slate-500">{kpi.hint}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="xl:col-span-3">
          <div className="mb-3">
            <h2 className={adminUi.sectionTitle}>{t("quickActions", "Quick actions")}</h2>
            <p className={adminUi.sectionSub}>
              {t("quickActionsHint", "Common workflows for day-to-day platform management.")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {shortcuts.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => go(item.key)}
                className={`${adminUi.cardHover} group flex items-start gap-3 p-4 text-left`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone}`}
                >
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {item.title}
                    </span>
                    <MdArrowForward className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                    {item.desc}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="xl:col-span-2">
          <div className="mb-3">
            <h2 className={adminUi.sectionTitle}>{t("needsAttention", "Needs attention")}</h2>
            <p className={adminUi.sectionSub}>
              {t("needsAttentionHint", "Trust & safety queues that usually need a daily check.")}
            </p>
          </div>
          <div className={`${adminUi.card} divide-y divide-slate-100 overflow-hidden`}>
            {focusItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => go(item.key)}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50/80"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                    {item.desc}
                  </span>
                </span>
                <MdArrowForward className="mt-2 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className={`${adminUi.card} overflow-hidden`}>
        <div className="flex flex-col gap-4 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight sm:text-lg">
              {t("adminResources", "Admin resources")}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {t(
                "adminResourcesHint",
                "API docs and tooling for integrations and troubleshooting.",
              )}
            </p>
          </div>
          <a
            href={apiDocs}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            {t("adminApiDocs", "Platform admin APIs")}
            <MdOpenInNew />
          </a>
        </div>
      </section>
    </div>
  );
}
