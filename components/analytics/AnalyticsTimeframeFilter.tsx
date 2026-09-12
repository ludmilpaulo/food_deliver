"use client";

import { REPORT_TIMEFRAMES, type ReportTimeframe } from "@/utils/reportCharts";

type Props = {
  value: ReportTimeframe;
  onChange: (timeframe: ReportTimeframe) => void;
  labelFor: (timeframe: ReportTimeframe) => string;
};

export default function AnalyticsTimeframeFilter({ value, onChange, labelFor }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Report timeframe">
      {REPORT_TIMEFRAMES.map((timeframe) => {
        const active = value === timeframe;
        return (
          <button
            key={timeframe}
            type="button"
            onClick={() => onChange(timeframe)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              active ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {labelFor(timeframe)}
          </button>
        );
      })}
    </div>
  );
}
