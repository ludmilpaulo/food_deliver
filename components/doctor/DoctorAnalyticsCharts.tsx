"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { AnalyticsDays } from "@/components/analytics/AnalyticsDaysFilter";
import AnalyticsDaysFilter from "@/components/analytics/AnalyticsDaysFilter";
import AnalyticsComparisonStrip from "@/components/analytics/AnalyticsComparisonStrip";
import AnalyticsExportButtons from "@/components/analytics/AnalyticsExportButtons";
import type { DoctorDashboardAnalytics } from "@/types/doctor";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";
import { formatPercentChange } from "@/utils/analyticsExport";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  analytics: DoctorDashboardAnalytics;
  days: AnalyticsDays;
  onDaysChange: (days: AnalyticsDays) => void;
};

function hasAnyValue(data: number[]): boolean {
  return data.some((value) => value > 0);
}

export default function DoctorAnalyticsCharts({ analytics, days, onDaysChange }: Props) {
  const { dt, appointmentStatusLabel, appointmentTypeLabel } = useDoctorTranslation();

  const daysLabel = (value: AnalyticsDays) => {
    if (value === 30) return dt("days30");
    if (value === 90) return dt("days90");
    return dt("last7Days");
  };

  const exportPayload = useMemo(
    () => ({
      title: dt("analyticsTitle"),
      subtitle: `${daysLabel(days)} · ${analytics.periodStart ?? ""} – ${analytics.periodEnd ?? ""}`,
      sections: [
        {
          title: dt("comparisonTitle"),
          rows: [
            {
              label: dt("appointmentsMetric"),
              value: `${analytics.comparison.appointments.current} (${formatPercentChange(analytics.comparison.appointments.percentChange)})`,
            },
            {
              label: dt("earningsMetric"),
              value: `${analytics.comparison.earnings.current} (${formatPercentChange(analytics.comparison.earnings.percentChange)})`,
            },
          ],
        },
        {
          title: dt("appointmentsTrend"),
          rows: analytics.appointmentsByDay.labels.map((label, index) => ({
            label,
            value: analytics.appointmentsByDay.data[index] ?? 0,
          })),
        },
        {
          title: dt("topServices"),
          rows: analytics.topServices.labels.map((label, index) => ({
            label,
            value: analytics.topServices.data[index] ?? 0,
          })),
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analytics, days, dt],
  );

  const hasData = useMemo(
    () =>
      [
        analytics.appointmentsByDay.data,
        analytics.appointmentsByStatus.data,
        analytics.appointmentTypeBreakdown.data,
        analytics.earningsByDay.data,
        analytics.topServices.data,
      ].some(hasAnyValue),
    [analytics],
  );

  const baseChartOptions = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#059669", "#10b981", "#34d399", "#6ee7b7"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    grid: { borderColor: "#e2e8f0" },
  };

  const dayLabels = analytics.appointmentsByDay.labels.map((label) => label.slice(5));
  const statusLabels = analytics.appointmentsByStatus.labels.map((label) => appointmentStatusLabel(label));
  const typeLabels = analytics.appointmentTypeBreakdown.labels.map((label) => appointmentTypeLabel(label));

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">{dt("analyticsTitle")}</h2>
        <div className="flex flex-col gap-2 sm:items-end">
          <AnalyticsDaysFilter value={days} onChange={onDaysChange} labelFor={daysLabel} />
          <AnalyticsExportButtons
            payload={exportPayload}
            exportCsvLabel={dt("exportCsv")}
            exportPdfLabel={dt("exportPdf")}
          />
        </div>
      </div>

      <AnalyticsComparisonStrip
        title={dt("comparisonTitle")}
        vsPreviousLabel={dt("vsPreviousPeriod")}
        cards={[
          {
            key: "appointments",
            label: dt("appointmentsMetric"),
            comparison: analytics.comparison.appointments,
          },
          {
            key: "earnings",
            label: dt("earningsMetric"),
            comparison: analytics.comparison.earnings,
          },
        ]}
      />

      {!hasData ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          {dt("noAnalyticsData")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-emerald-800">{dt("appointmentsTrend")}</h3>
            <Chart
              type="area"
              height={280}
              series={[{ name: dt("appointments"), data: analytics.appointmentsByDay.data }]}
              options={{ ...baseChartOptions, xaxis: { categories: dayLabels } }}
            />
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-emerald-800">{dt("earningsTrend")}</h3>
            <Chart
              type="line"
              height={280}
              series={[{ name: dt("monthlyEarnings"), data: analytics.earningsByDay.data }]}
              options={{
                ...baseChartOptions,
                xaxis: { categories: analytics.earningsByDay.labels.map((label) => label.slice(5)) },
              }}
            />
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-emerald-800">{dt("appointmentsByStatus")}</h3>
            <Chart
              type="bar"
              height={280}
              series={[{ name: dt("appointments"), data: analytics.appointmentsByStatus.data }]}
              options={{
                ...baseChartOptions,
                plotOptions: { bar: { borderRadius: 6, columnWidth: "55%" } },
                xaxis: { categories: statusLabels },
              }}
            />
          </article>
          {hasAnyValue(analytics.appointmentTypeBreakdown.data) && (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-emerald-800">{dt("appointmentTypeBreakdown")}</h3>
              <Chart
                type="donut"
                height={280}
                series={analytics.appointmentTypeBreakdown.data}
                options={{ ...baseChartOptions, labels: typeLabels, legend: { position: "bottom" } }}
              />
            </article>
          )}
          {hasAnyValue(analytics.topServices.data) && (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
              <h3 className="mb-2 text-sm font-semibold text-emerald-800">{dt("topServices")}</h3>
              <Chart
                type="bar"
                height={280}
                series={[{ name: dt("services"), data: analytics.topServices.data }]}
                options={{
                  ...baseChartOptions,
                  plotOptions: { bar: { borderRadius: 6, horizontal: true } },
                  xaxis: { categories: analytics.topServices.labels },
                }}
              />
            </article>
          )}
        </div>
      )}
    </section>
  );
}
