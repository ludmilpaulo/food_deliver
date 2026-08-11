"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import AnalyticsDaysFilter, { type AnalyticsDays } from "@/components/analytics/AnalyticsDaysFilter";
import AnalyticsComparisonStrip from "@/components/analytics/AnalyticsComparisonStrip";
import AnalyticsExportButtons from "@/components/analytics/AnalyticsExportButtons";
import {
  fetchPartnerReport,
  type PartnerReportData,
} from "@/features/partner/api/partnerReportsApi";
import { formatPercentChange, mapMetricComparison } from "@/utils/analyticsExport";

type Props = {
  compact?: boolean;
};

const emptyReport: PartnerReportData = {
  revenue: [],
  orders: [],
};

export default function RestaurantMiniAnalytics({ compact = false }: Props) {
  const { t } = useTranslation();
  const [days, setDays] = useState<AnalyticsDays>(7);
  const [data, setData] = useState<PartnerReportData>(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const report = await fetchPartnerReport({ days });
        if (!cancelled) setData(report);
      } catch {
        if (!cancelled) setError(t("dashboardLoadError", "Could not load analytics."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days, t]);

  const revenueComparison = mapMetricComparison(data.comparison?.revenue);
  const ordersComparison = mapMetricComparison(data.comparison?.orders);

  const daysLabel = (value: AnalyticsDays) => {
    if (value === 30) return t("days30", "Last 30 days");
    if (value === 90) return t("days90", "Last 90 days");
    return t("last7Days", "Last 7 days");
  };

  const exportPayload = useMemo(
    () => ({
      title: t("storeReport", "Store Report"),
      subtitle: daysLabel(days),
      sections: [
        {
          title: t("comparisonTitle", "Period comparison"),
          rows: [
            {
              label: t("revenue", "Revenue"),
              value: `${revenueComparison.current} (${formatPercentChange(revenueComparison.percentChange)})`,
            },
            {
              label: t("numberOfOrders", "Orders"),
              value: `${ordersComparison.current} (${formatPercentChange(ordersComparison.percentChange)})`,
            },
          ],
        },
        {
          title: t("revenue", "Revenue"),
          rows: (data.labels ?? []).map((label, index) => ({
            label,
            value: data.revenue[index] ?? 0,
          })),
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, days, t, revenueComparison, ordersComparison],
  );

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${compact ? "p-4" : "p-6"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("analyticsTitle", "Analytics")}</h2>
          <p className="text-sm text-slate-500">{t("vsPreviousPeriod", "Compared with previous period")}</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <AnalyticsDaysFilter value={days} onChange={setDays} labelFor={daysLabel} />
          <AnalyticsExportButtons
            payload={exportPayload}
            exportCsvLabel={t("exportCsv", "Export CSV")}
            exportPdfLabel={t("exportPdf", "Export PDF")}
          />
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">{t("loading")}</p>
      ) : error ? (
        <p className="mt-4 text-sm text-rose-600">{error}</p>
      ) : (
        <div className="mt-4 space-y-4">
          <AnalyticsComparisonStrip
            title={t("comparisonTitle", "Period comparison")}
            vsPreviousLabel={t("vsPreviousPeriod", "Compared with previous period")}
            cards={[
              {
                key: "revenue",
                label: t("revenue", "Revenue"),
                comparison: revenueComparison,
                formatValue: (value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 }),
              },
              {
                key: "orders",
                label: t("numberOfOrders", "Orders"),
                comparison: ordersComparison,
              },
            ]}
          />
          {!compact && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <article className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("revenue", "Revenue")}
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {(data.summary?.revenue_total ?? revenueComparison.current).toLocaleString()}
                </p>
              </article>
              <article className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("numberOfOrders", "Orders")}
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {data.summary?.orders_total ?? ordersComparison.current}
                </p>
              </article>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
