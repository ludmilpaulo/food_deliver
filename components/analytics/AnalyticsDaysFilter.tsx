"use client";

export type AnalyticsDays = 7 | 30 | 90;

const OPTIONS: AnalyticsDays[] = [7, 30, 90];

type Props = {
  value: AnalyticsDays;
  onChange: (days: AnalyticsDays) => void;
  labelFor: (days: AnalyticsDays) => string;
};

export default function AnalyticsDaysFilter({ value, onChange, labelFor }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((days) => {
        const active = value === days;
        return (
          <button
            key={days}
            type="button"
            onClick={() => onChange(days)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              active ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {labelFor(days)}
          </button>
        );
      })}
    </div>
  );
}
