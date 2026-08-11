"use client";

import { useMemo } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useTranslation } from "@/hooks/useTranslation";

export type DayStatus = "available" | "booked" | "blocked" | "pending";

export type AvailabilityDay = {
  date: string;
  status: DayStatus;
  price?: string | null;
  currency?: string;
};

type Props = {
  year: number;
  month: number; // 0-indexed
  days: AvailabilityDay[];
  loading?: boolean;
  checkIn: string | null;
  checkOut: string | null;
  onMonthChange: (year: number, month: number) => void;
  onSelectDate: (isoDate: string) => void;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function toIso(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function isBefore(a: string, b: string): boolean {
  return a < b;
}

function isInRange(iso: string, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  return iso >= start && iso < end;
}

function statusClass(status: DayStatus, selected: boolean, inRange: boolean, isToday: boolean): string {
  if (selected) {
    return "bg-[#0f766e] text-white font-semibold shadow-sm";
  }
  if (inRange) {
    return "bg-teal-100 text-teal-900";
  }
  if (status === "available") {
    return isToday
      ? "bg-white text-slate-800 ring-2 ring-[#0f766e]/40 hover:bg-teal-50"
      : "bg-white text-slate-800 hover:bg-teal-50";
  }
  if (status === "pending") {
    return "bg-amber-50 text-amber-800/80 line-through cursor-not-allowed";
  }
  if (status === "booked") {
    return "bg-slate-100 text-slate-400 line-through cursor-not-allowed";
  }
  return "bg-slate-50 text-slate-300 cursor-not-allowed";
}

export default function StayAvailabilityCalendar({
  year,
  month,
  days,
  loading,
  checkIn,
  checkOut,
  onMonthChange,
  onSelectDate,
}: Props) {
  const { t } = useTranslation();

  const dayMap = useMemo(() => {
    const map = new Map<string, AvailabilityDay>();
    for (const day of days) map.set(day.date, day);
    return map;
  }, [days]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = useMemo(() => {
    const now = new Date();
    return toIso(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const monthLabel = useMemo(() => {
    const label = new Date(year, month, 1).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [year, month]);

  const goPrev = () => {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  };

  const goNext = () => {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  };

  const cells: Array<{ day: number; iso: string } | null> = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, iso: toIso(year, month, day) });
  }

  return (
    <div className="rounded-xl border border-teal-100 bg-gradient-to-b from-teal-50/80 to-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-lg p-1.5 text-[#0f766e] hover:bg-teal-100"
          aria-label={t("previousMonth", "Previous month")}
        >
          <MdChevronLeft size={22} />
        </button>
        <h3 className="text-sm font-semibold text-teal-950">{monthLabel}</h3>
        <button
          type="button"
          onClick={goNext}
          className="rounded-lg p-1.5 text-[#0f766e] hover:bg-teal-100"
          aria-label={t("nextMonth", "Next month")}
        >
          <MdChevronRight size={22} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-teal-800/60">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-teal-700/70">
          {t("availabilityLoading", "Loading availability…")}
        </p>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell) {
              return <span key={`empty-${idx}`} className="aspect-square" />;
            }
            const info = dayMap.get(cell.iso);
            const status: DayStatus = info?.status ?? (isBefore(cell.iso, todayIso) ? "blocked" : "available");
            const selectable = status === "available" && !isBefore(cell.iso, todayIso);
            const selected = cell.iso === checkIn || cell.iso === checkOut;
            const inRange = isInRange(cell.iso, checkIn, checkOut);
            const isToday = cell.iso === todayIso;

            return (
              <button
                key={cell.iso}
                type="button"
                disabled={!selectable}
                onClick={() => onSelectDate(cell.iso)}
                title={info?.price ? `${info.currency || ""} ${info.price}` : cell.iso}
                className={`aspect-square rounded-lg text-xs transition ${statusClass(
                  status,
                  selected,
                  inRange,
                  isToday,
                )} ${selectable ? "cursor-pointer" : ""}`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-medium text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-white ring-1 ring-slate-300" />
          {t("dayAvailable", "Available")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-100 ring-1 ring-slate-200" />
          {t("dayBooked", "Booked")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-50 ring-1 ring-amber-200" />
          {t("dayPending", "Hold")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-50 ring-1 ring-slate-200" />
          {t("dayBlocked", "Blocked")}
        </span>
      </div>

      {(checkIn || checkOut) && (
        <p className="mt-2 text-xs text-teal-800">
          {checkIn ? (
            <>
              <span className="font-semibold">{t("checkIn", "Check-in")}:</span> {checkIn}
              {checkOut ? (
                <>
                  {" · "}
                  <span className="font-semibold">{t("checkOut", "Check-out")}:</span> {checkOut}
                </>
              ) : (
                <> · {t("selectCheckout", "Select check-out")}</>
              )}
            </>
          ) : (
            t("selectDates", "Select your dates")
          )}
        </p>
      )}
    </div>
  );
}
