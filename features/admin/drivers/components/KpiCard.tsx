'use client';

import React from 'react';
import type { IconType } from 'react-icons';

type KpiCardProps = {
  title: string;
  value: string | number;
  change: number;
  icon: IconType;
  loading?: boolean;
};

function trendColor(change: number): string {
  if (change > 0) return 'text-emerald-600';
  if (change < 0) return 'text-red-500';
  return 'text-slate-500';
}

export default function KpiCard({ title, value, change, icon: Icon, loading }: KpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
        <div className="h-8 w-16 bg-slate-200 rounded" />
      </div>
    );
  }

  const sign = change > 0 ? '+' : '';
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow sm:rounded-2xl sm:p-5">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
          <Icon className="text-xl" />
        </div>
        <span className={`text-xs font-semibold ${trendColor(change)}`}>
          {sign}
          {change}%
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">{title}</p>
      <p className="mt-0.5 text-lg font-bold text-slate-900 sm:mt-1 sm:text-2xl">{value}</p>
    </div>
  );
}
