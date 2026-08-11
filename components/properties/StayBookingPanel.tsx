"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { baseAPI } from "@/services/types";
import { readAuthToken } from "@/lib/authToken";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { useUserRegion } from "@/hooks/useUserRegion";
import StayAvailabilityCalendar, {
  type AvailabilityDay,
  type DayStatus,
} from "@/components/properties/StayAvailabilityCalendar";

type StaySettingsSummary = {
  price_per_night?: string;
  weekend_price?: string | null;
  cleaning_fee?: string;
  min_nights?: number;
  max_nights?: number;
  max_guests?: number;
  hold_minutes?: number;
};

type PriceQuote = {
  available: boolean;
  nights: number;
  currency: string;
  nightly_subtotal: string;
  cleaning_fee: string;
  service_fee: string;
  tax_amount?: string;
  total: string;
  hold_minutes?: number;
};

type BookingResult = {
  id: number;
  booking_code: string;
  status: string;
};

type Props = {
  propertyId: number;
  propertyTitle: string;
  currency?: string;
  staySettings?: StaySettingsSummary | null;
};

function monthRange(year: number, month: number): { from: string; to: string } {
  const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const last = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00");
  const b = new Date(checkOut + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export default function StayBookingPanel({
  propertyId,
  propertyTitle,
  currency,
  staySettings,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { region: regionCode } = useUserRegion();
  const currencyCode = (currency || getCurrencyForCountry(regionCode) || "USD") as
    | "AOA"
    | "USD"
    | "EUR";

  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [loadingCal, setLoadingCal] = useState(true);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxGuests = staySettings?.max_guests ?? 16;
  const maxAdults = Math.min(maxGuests, 16);
  const loginNext = `/properties/${propertyId}`;

  const loadAvailability = useCallback(async () => {
    setLoadingCal(true);
    const { from, to } = monthRange(year, month);
    try {
      const res = await fetch(
        `${baseAPI}/properties/${propertyId}/availability/?from=${from}&to=${to}`,
        { headers: { Accept: "application/json" } },
      );
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !data || typeof data !== "object") {
        setDays([]);
        return;
      }
      const rawDays = (data as { days?: unknown }).days;
      if (!Array.isArray(rawDays)) {
        setDays([]);
        return;
      }
      const parsed: AvailabilityDay[] = [];
      for (const row of rawDays) {
        if (!row || typeof row !== "object") continue;
        const item = row as Record<string, unknown>;
        const date = typeof item.date === "string" ? item.date : "";
        const status = item.status;
        if (!date) continue;
        if (
          status !== "available" &&
          status !== "booked" &&
          status !== "blocked" &&
          status !== "pending"
        ) {
          continue;
        }
        parsed.push({
          date,
          status: status as DayStatus,
          price: typeof item.price === "string" ? item.price : null,
          currency: typeof item.currency === "string" ? item.currency : undefined,
        });
      }
      setDays(parsed);
    } catch {
      setDays([]);
    } finally {
      setLoadingCal(false);
    }
  }, [propertyId, year, month]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setQuoting(true);
      setQuoteError(null);
      try {
        const res = await fetch(`${baseAPI}/properties/${propertyId}/calculate-price/`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            check_in: checkIn,
            check_out: checkOut,
            adults,
            children,
            infants,
          }),
        });
        const data: unknown = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data || typeof data !== "object") {
          const detail =
            data && typeof data === "object" && "detail" in data
              ? String((data as { detail: unknown }).detail)
              : t("datesUnavailable", "Selected dates are unavailable.");
          setQuote(null);
          setQuoteError(detail);
          return;
        }
        const q = data as PriceQuote;
        if (!q.available) {
          setQuote(null);
          setQuoteError(t("datesUnavailable", "Selected dates are unavailable."));
          return;
        }
        setQuote(q);
      } catch {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(t("datesUnavailable", "Selected dates are unavailable."));
        }
      } finally {
        if (!cancelled) setQuoting(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [checkIn, checkOut, adults, children, infants, propertyId, t]);

  const handleSelectDate = (iso: string) => {
    setError(null);
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso);
      setCheckOut(null);
      setQuote(null);
      return;
    }
    if (iso <= checkIn) {
      setCheckIn(iso);
      setCheckOut(null);
      setQuote(null);
      return;
    }
    setCheckOut(iso);
  };

  const handleReserve = async () => {
    setError(null);
    if (!checkIn || !checkOut) {
      setError(t("selectDates", "Select your dates"));
      return;
    }
    const token = readAuthToken();
    if (!token) {
      window.location.href = `/LoginScreenUser?next=${encodeURIComponent(loginNext)}`;
      return;
    }
    setReserving(true);
    try {
      const res = await fetch(`${baseAPI}/properties/${propertyId}/bookings/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          check_in: checkIn,
          check_out: checkOut,
          adults,
          children,
          infants,
          confirm: true,
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !data || typeof data !== "object" || !("id" in data)) {
        const detail =
          data && typeof data === "object" && "detail" in data
            ? String((data as { detail: unknown }).detail)
            : t("bookingFailed", "Could not complete your booking.");
        throw new Error(detail);
      }
      const booking = data as BookingResult;
      router.push(`/properties/bookings/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("bookingFailed", "Could not complete your booking."));
    } finally {
      setReserving(false);
    }
  };

  const nightCount =
    checkIn && checkOut ? nightsBetween(checkIn, checkOut) : quote?.nights ?? 0;
  const totalLabel = quote
    ? formatCurrency(parseFloat(quote.total), currencyCode)
    : null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-teal-950">{t("reserveStay", "Reserve your stay")}</h2>
        <p className="mt-0.5 text-sm text-teal-700/80">{propertyTitle}</p>
        {staySettings?.price_per_night ? (
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatCurrency(parseFloat(staySettings.price_per_night), currencyCode)}
            <span className="ml-1 text-sm font-normal text-slate-500">
              {t("perNight", "per night")}
            </span>
          </p>
        ) : null}
      </div>

      <StayAvailabilityCalendar
        year={year}
        month={month}
        days={days}
        loading={loadingCal}
        checkIn={checkIn}
        checkOut={checkOut}
        onMonthChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
        onSelectDate={handleSelectDate}
      />

      <div className="space-y-3 rounded-xl border border-teal-100 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800/70">
          {t("guests", "Guests")}
        </p>
        {(
          [
            {
              key: "adults",
              label: t("adults", "Adults"),
              value: adults,
              set: setAdults,
              min: 1,
              max: maxAdults,
            },
            {
              key: "children",
              label: t("children", "Children"),
              value: children,
              set: setChildren,
              min: 0,
              max: Math.max(0, maxGuests - adults),
            },
            {
              key: "infants",
              label: t("infants", "Infants"),
              value: infants,
              set: setInfants,
              min: 0,
              max: 5,
            },
          ] as const
        ).map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-700">{row.label}</span>
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                disabled={row.value <= row.min}
                onClick={() => row.set(Math.max(row.min, row.value - 1))}
                className="h-8 w-8 rounded-lg border border-teal-200 text-[#0f766e] hover:bg-teal-50 disabled:opacity-40"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold text-slate-900">{row.value}</span>
              <button
                type="button"
                disabled={row.value >= row.max}
                onClick={() => row.set(Math.min(row.max, row.value + 1))}
                className="h-8 w-8 rounded-lg border border-teal-200 text-[#0f766e] hover:bg-teal-50 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {quoting && (
        <p className="text-sm text-teal-700">{t("calculatingPrice", "Calculating price…")}</p>
      )}
      {quoteError && <p className="text-sm text-rose-700">{quoteError}</p>}

      {quote && !quoteError && (
        <div className="space-y-2 rounded-xl border border-teal-100 bg-teal-50/50 p-3 text-sm">
          <div className="flex justify-between text-slate-700">
            <span>
              {nightCount} {t("nights", "nights")}
            </span>
            <span>{formatCurrency(parseFloat(quote.nightly_subtotal), currencyCode)}</span>
          </div>
          {parseFloat(quote.cleaning_fee) > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>{t("cleaningFee", "Cleaning fee")}</span>
              <span>{formatCurrency(parseFloat(quote.cleaning_fee), currencyCode)}</span>
            </div>
          )}
          {parseFloat(quote.service_fee) > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>{t("serviceFee", "Service fee")}</span>
              <span>{formatCurrency(parseFloat(quote.service_fee), currencyCode)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-teal-200 pt-2 font-semibold text-teal-950">
            <span>{t("total", "Total")}</span>
            <span>{totalLabel}</span>
          </div>
          {quote.hold_minutes ? (
            <p className="text-xs text-teal-700/80">
              {t("holdExpires", "Hold expires in {minutes} minutes.").replace(
                "{minutes}",
                String(quote.hold_minutes),
              )}
            </p>
          ) : null}
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-700">
          {error}{" "}
          {!readAuthToken() && (
            <Link
              href={`/LoginScreenUser?next=${encodeURIComponent(loginNext)}`}
              className="font-semibold underline"
            >
              {t("login", "Login")}
            </Link>
          )}
        </p>
      )}

      <button
        type="button"
        disabled={reserving || !checkIn || !checkOut || !quote || Boolean(quoteError)}
        onClick={() => void handleReserve()}
        className="w-full rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {reserving
          ? t("loading", "Loading...")
          : totalLabel
            ? t("reserveTotal", "Reserve · {total}").replace("{total}", totalLabel)
            : t("reserve", "Reserve")}
      </button>
    </section>
  );
}
