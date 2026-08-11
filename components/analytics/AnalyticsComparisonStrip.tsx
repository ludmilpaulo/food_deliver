"use client";

import { formatPercentChange, type AnalyticsMetricComparison } from "@/utils/analyticsExport";

export type ComparisonCard = {
  key: string;
  label: string;
  comparison: AnalyticsMetricComparison;
  formatValue?: (value: number) => string;
};

type Props = {
  title: string;
  vsPreviousLabel: string;
  cards: ComparisonCard[];
};

export default function AnalyticsComparisonStrip({ title, vsPreviousLabel, cards }: Props) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{vsPreviousLabel}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const format = card.formatValue ?? ((value: number) => String(value));
          const pct = card.comparison.percentChange;
          const up = (pct ?? 0) > 0;
          const down = (pct ?? 0) < 0;
          return (
            <article
              key={card.key}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{format(card.comparison.current)}</p>
              <p className="mt-1 text-xs text-slate-500">
                Prev: {format(card.comparison.previous)}
              </p>
              <p
                className={`mt-2 text-sm font-semibold ${
                  up ? "text-emerald-700" : down ? "text-rose-700" : "text-slate-500"
                }`}
              >
                {formatPercentChange(pct)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
