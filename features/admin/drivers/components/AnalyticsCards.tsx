'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import type { DriverAnalytics } from '@/features/admin/drivers/types';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type AnalyticsCardsProps = {
  data?: DriverAnalytics;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
};

function MiniChart({ series, type }: { series: { label: string; value: number }[]; type: 'line' | 'bar' | 'donut' }) {
  if (series.length === 0) {
    return <div className="h-24 flex items-center justify-center text-xs text-slate-400">No chart data</div>;
  }
  const options = {
    chart: { sparkline: { enabled: true }, toolbar: { show: false } },
    stroke: { curve: 'smooth' as const, width: 2 },
    colors: ['#2563eb'],
    xaxis: { categories: series.map((s) => s.label) },
    labels: series.map((s) => s.label),
    legend: { show: false },
    dataLabels: { enabled: false },
  };
  const chartSeries =
    type === 'donut'
      ? series.map((s) => s.value)
      : [{ name: 'Value', data: series.map((s) => s.value) }];

  return (
    <Chart
      options={options}
      series={chartSeries}
      type={type}
      height={96}
      width="100%"
    />
  );
}

function CardShell({
  title,
  metric,
  change,
  suffix,
  children,
  loading,
}: {
  title: string;
  metric: string;
  change?: number;
  suffix?: string;
  children: React.ReactNode;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
        <div className="h-6 w-20 bg-slate-200 rounded" />
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 sm:rounded-2xl sm:p-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-xl font-bold text-slate-900">{metric}</span>
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
        {change !== undefined && (
          <span className={`text-xs font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}
            {change}%
          </span>
        )}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function AnalyticsCards({ data, loading, error, onRetry }: AnalyticsCardsProps) {
  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-red-100">
        <p>Failed to load analytics. Please sign in again as a platform admin, then retry.</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const regionSeries =
    data?.demand_by_region.map((r) => ({ label: r.region, value: r.percentage })) ?? [];

  const funnel = data?.verification_funnel;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
      <CardShell
        title="Trip Volume"
        metric={data ? data.trip_volume.total.toLocaleString() : '—'}
        change={data?.trip_volume.change}
        loading={loading}
      >
        <MiniChart series={data?.trip_volume.series ?? []} type="line" />
      </CardShell>
      <CardShell
        title="Delivery Performance"
        metric={data ? `${data.delivery_performance.success_rate}%` : '—'}
        change={data?.delivery_performance.change}
        suffix="success"
        loading={loading}
      >
        <MiniChart series={data?.delivery_performance.series ?? []} type="bar" />
      </CardShell>
      <CardShell title="Demand by Region" metric={regionSeries[0]?.label ?? '—'} loading={loading}>
        <MiniChart series={regionSeries} type="donut" />
      </CardShell>
      <CardShell
        title="Driver Availability"
        metric={data ? `${data.driver_availability.online_rate}%` : '—'}
        change={data?.driver_availability.change}
        suffix="online"
        loading={loading}
      >
        <MiniChart series={data?.driver_availability.series ?? []} type="line" />
      </CardShell>
      <CardShell
        title="Verification Funnel"
        metric={funnel ? String(funnel.approved) : '—'}
        suffix="approved"
        loading={loading}
      >
        {funnel ? (
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between"><span>Submitted</span><span>{funnel.submitted}</span></div>
            <div className="flex justify-between"><span>Under review</span><span>{funnel.under_review}</span></div>
            <div className="flex justify-between"><span>Rejected</span><span>{funnel.rejected}</span></div>
          </div>
        ) : null}
      </CardShell>
    </div>
  );
}
