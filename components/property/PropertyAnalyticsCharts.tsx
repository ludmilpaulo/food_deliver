"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { AnalyticsDays } from "@/components/analytics/AnalyticsDaysFilter";
import AnalyticsDaysFilter from "@/components/analytics/AnalyticsDaysFilter";
import AnalyticsComparisonStrip from "@/components/analytics/AnalyticsComparisonStrip";
import AnalyticsExportButtons from "@/components/analytics/AnalyticsExportButtons";
import type { PropertyDashboardAnalytics } from "@/types/property";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";
import { formatPercentChange } from "@/utils/analyticsExport";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  analytics: PropertyDashboardAnalytics;
  days: AnalyticsDays;
  onDaysChange: (days: AnalyticsDays) => void;
};

function hasAnyValue(data: number[]): boolean {
  return data.some((value) => value > 0);
}

function nonZeroPieSeries(labels: string[], data: number[]) {
  return labels
    .map((label, index) => ({ label, value: data[index] ?? 0 }))
    .filter((item) => item.value > 0);
}

export default function PropertyAnalyticsCharts({ analytics, days, onDaysChange }: Props) {
  const { pt, listingTypeLabel, enquiryStatusLabel, approvalStatusLabel } = usePropertyTranslation();

  const daysLabel = (value: AnalyticsDays) => {
    if (value === 30) return pt("days30");
    if (value === 90) return pt("days90");
    return pt("last7Days");
  };

  const exportPayload = useMemo(
    () => ({
      title: pt("analyticsTitle"),
      subtitle: `${daysLabel(days)} · ${analytics.periodStart ?? ""} – ${analytics.periodEnd ?? ""}`,
      sections: [
        {
          title: pt("comparisonTitle"),
          rows: [
            {
              label: pt("enquiriesMetric"),
              value: `${analytics.comparison.enquiries.current} (${formatPercentChange(analytics.comparison.enquiries.percentChange)})`,
            },
            {
              label: pt("listingsCreated"),
              value: `${analytics.comparison.listingsCreated.current} (${formatPercentChange(analytics.comparison.listingsCreated.percentChange)})`,
            },
          ],
        },
        {
          title: pt("enquiriesTrend"),
          rows: analytics.enquiriesByDay.labels.map((label, index) => ({
            label,
            value: analytics.enquiriesByDay.data[index] ?? 0,
          })),
        },
        {
          title: pt("topListingsByEnquiries"),
          rows: analytics.topListingsByEnquiries.labels.map((label, index) => ({
            label,
            value: analytics.topListingsByEnquiries.data[index] ?? 0,
          })),
        },
      ],
    }),
    // daysLabel closes over pt; analytics + days are enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analytics, days, pt],
  );

  const hasData = useMemo(
    () =>
      [
        analytics.enquiriesByDay.data,
        analytics.listingsByType.data,
        analytics.enquiriesByStatus.data,
        analytics.listingsByApproval.data,
        analytics.topListingsByEnquiries.data,
      ].some(hasAnyValue),
    [analytics],
  );

  const dayLabels = analytics.enquiriesByDay.labels.map((label) => label.slice(5));
  const listingTypeLabels = analytics.listingsByType.labels.map((label) => listingTypeLabel(label));
  const enquiryStatusLabels = analytics.enquiriesByStatus.labels.map((label) =>
    enquiryStatusLabel(label),
  );
  const approvalLabels = analytics.listingsByApproval.labels.map((label) =>
    approvalStatusLabel(label),
  );

  const listingsByTypePie = nonZeroPieSeries(listingTypeLabels, analytics.listingsByType.data);
  const listingsByApprovalPie = nonZeroPieSeries(
    approvalLabels,
    analytics.listingsByApproval.data,
  );

  const baseChartOptions = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#0f766e", "#14b8a6", "#5eead4", "#99f6e4", "#115e59"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    grid: { borderColor: "#e2e8f0" },
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">{pt("analyticsTitle")}</h2>
        <div className="flex flex-col gap-2 sm:items-end">
          <AnalyticsDaysFilter value={days} onChange={onDaysChange} labelFor={daysLabel} />
          <AnalyticsExportButtons
            payload={exportPayload}
            exportCsvLabel={pt("exportCsv")}
            exportPdfLabel={pt("exportPdf")}
          />
        </div>
      </div>

      <AnalyticsComparisonStrip
        title={pt("comparisonTitle")}
        vsPreviousLabel={pt("vsPreviousPeriod")}
        cards={[
          {
            key: "enquiries",
            label: pt("enquiriesMetric"),
            comparison: analytics.comparison.enquiries,
          },
          {
            key: "listings",
            label: pt("listingsCreated"),
            comparison: analytics.comparison.listingsCreated,
          },
        ]}
      />

      {!hasData ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          {pt("noAnalyticsData")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-teal-800">{pt("enquiriesTrend")}</h3>
            <Chart
              type="area"
              height={280}
              series={[{ name: pt("enquiries"), data: analytics.enquiriesByDay.data }]}
              options={{
                ...baseChartOptions,
                xaxis: { categories: dayLabels },
                fill: {
                  type: "gradient",
                  gradient: { shadeIntensity: 0.4, opacityFrom: 0.45, opacityTo: 0.05 },
                },
              }}
            />
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-teal-800">{pt("listingsByType")}</h3>
            {listingsByTypePie.length > 0 ? (
              <Chart
                type="donut"
                height={280}
                series={listingsByTypePie.map((item) => item.value)}
                options={{
                  ...baseChartOptions,
                  labels: listingsByTypePie.map((item) => item.label),
                  legend: { position: "bottom" },
                }}
              />
            ) : (
              <p className="py-16 text-center text-sm text-slate-400">{pt("noAnalyticsData")}</p>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-teal-800">{pt("enquiriesByStatus")}</h3>
            <Chart
              type="bar"
              height={280}
              series={[{ name: pt("enquiries"), data: analytics.enquiriesByStatus.data }]}
              options={{
                ...baseChartOptions,
                plotOptions: { bar: { borderRadius: 6, columnWidth: "55%" } },
                xaxis: { categories: enquiryStatusLabels },
              }}
            />
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-teal-800">{pt("listingsByApproval")}</h3>
            {listingsByApprovalPie.length > 0 ? (
              <Chart
                type="pie"
                height={280}
                series={listingsByApprovalPie.map((item) => item.value)}
                options={{
                  ...baseChartOptions,
                  labels: listingsByApprovalPie.map((item) => item.label),
                  legend: { position: "bottom" },
                }}
              />
            ) : (
              <p className="py-16 text-center text-sm text-slate-400">{pt("noAnalyticsData")}</p>
            )}
          </article>

          {hasAnyValue(analytics.topListingsByEnquiries.data) && (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
              <h3 className="mb-2 text-sm font-semibold text-teal-800">{pt("topListingsByEnquiries")}</h3>
              <Chart
                type="bar"
                height={280}
                series={[{ name: pt("enquiries"), data: analytics.topListingsByEnquiries.data }]}
                options={{
                  ...baseChartOptions,
                  plotOptions: { bar: { borderRadius: 6, horizontal: true } },
                  xaxis: { categories: analytics.topListingsByEnquiries.labels },
                }}
              />
            </article>
          )}
        </div>
      )}
    </section>
  );
}
