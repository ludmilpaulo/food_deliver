"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { ProviderDashboardConfig } from "@/configs/providerDashboards";
import api from "@/services/api";
import {
  KudyaButton,
  KudyaCard,
  KudyaEmptyState,
  KudyaErrorState,
  KudyaSkeleton,
} from "@/components/ui/KudyaStates";

type ProviderDashboardShellProps = {
  config: ProviderDashboardConfig;
};

type SummaryResponse = {
  service: string;
  metrics: Record<string, number>;
};

const SERVICE_SLUG: Record<string, string> = {
  car_rental: "car-rental",
  package: "send-package",
};

const PORTALS: Record<string, string> = {
  food: "/RestaurantDashboad",
  groceries: "/GroceryDashboad",
  property: "/dashboard/property",
  stay: "/dashboard/property",
  services: "/PartnerDashboard",
  doctors: "/dashboard/doctor",
  "car-rental": "/car-rental",
  "send-package": "/provider/courier",
  wallet: "/wallet",
  business: "/business",
};

function formatMetric(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ProviderDashboardShell({ config }: ProviderDashboardShellProps) {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const service = SERVICE_SLUG[config.categoryKey] || config.categoryKey;
  const portal = config.legacyPortalHref || PORTALS[service] || "/business";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SummaryResponse>("/api/v1/partner/workspace-summary/", {
        params: { service },
      });
      setMetrics(response.data.metrics || {});
    } catch {
      setMetrics(null);
      setError(t("dashboardLoadError", "Could not load this dashboard."));
    } finally {
      setLoading(false);
    }
  }, [service, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-violet-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-700">
              {t("providerPortal", "Provider portal")}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{config.title}</h1>
            <p className="mt-1 max-w-2xl text-slate-600">{config.subtitle}</p>
          </div>
          <Link href={portal} className="rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white">
            {t("openWorkspace", "Open workspace")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {config.metrics.map((metric) => (
              <KudyaSkeleton key={metric.key} className="h-28" />
            ))}
          </div>
        ) : null}
        {error ? (
          <KudyaErrorState
            title={t("dashboardLoadError", "Could not load this dashboard.")}
            body={error}
            onRetry={() => void load()}
            retryLabel={t("retry", "Retry")}
          />
        ) : null}
        {!loading && !error && metrics ? (
          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">{t("overview", "Overview")}</h2>
            {Object.keys(metrics).length === 0 ? (
              <KudyaEmptyState
                title={t("noDashboardData", "No activity yet")}
                body={t("noDashboardDataBody", "Numbers appear here after the first real order or booking.")}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {config.metrics.map((metric) => (
                  <KudyaCard key={metric.key}>
                    <p className="text-2xl font-bold text-slate-900">{formatMetric(metrics[metric.key])}</p>
                    <p className="mt-1 text-sm font-semibold">{metric.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{metric.description}</p>
                  </KudyaCard>
                ))}
              </div>
            )}
          </section>
        ) : null}

        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">{t("quickActions", "Quick actions")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {config.actions.map((action) => (
              <KudyaCard key={action.title}>
                <h3 className="font-semibold text-slate-900">{action.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                <Link href={action.href || portal} className="mt-3 inline-block text-sm font-semibold text-violet-700">
                  {t("open", "Open")}
                </Link>
              </KudyaCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
