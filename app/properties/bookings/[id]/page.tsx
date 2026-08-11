"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MdCheckCircle, MdArrowBack } from "react-icons/md";
import { baseAPI } from "@/services/types";
import { readAuthToken } from "@/lib/authToken";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { useUserRegion } from "@/hooks/useUserRegion";
import PlatformServiceGate from "@/components/platform/PlatformServiceGate";
import withAuth from "@/components/ProtectedPage";

type Booking = {
  id: number;
  booking_code: string;
  property_id: number;
  property_title: string;
  property_city: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  status: string;
  currency: string;
  nightly_subtotal: string;
  cleaning_fee: string;
  service_fee: string;
  total_amount: string;
  hold_expires_at?: string | null;
};

function StayBookingConfirmationContent() {
  const params = useParams();
  const id = params?.id;
  const { t } = useTranslation();
  const { region: regionCode } = useUserRegion();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const token = readAuthToken();
    if (!token) {
      window.location.href = `/LoginScreenUser?next=${encodeURIComponent(`/properties/bookings/${id}`)}`;
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseAPI}/properties/bookings/${id}/`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok || !data || typeof data !== "object") {
          throw new Error(
            data && typeof data === "object" && "detail" in data
              ? String((data as { detail: unknown }).detail)
              : t("bookingNotFound", "Booking not found"),
          );
        }
        if (!cancelled) setBooking(data as Booking);
      } catch (err) {
        if (!cancelled) {
          setBooking(null);
          setError(err instanceof Error ? err.message : t("bookingNotFound", "Booking not found"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] text-slate-600">
        {t("loading", "Loading...")}
      </div>
    );
  }

  if (!booking || error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f6f8]">
        <p className="text-slate-700">{error || t("bookingNotFound", "Booking not found")}</p>
        <Link href="/properties" className="text-[#0f766e] hover:underline">
          {t("backToSearch", "Back to search")}
        </Link>
      </div>
    );
  }

  const currencyCode = (booking.currency || getCurrencyForCountry(regionCode) || "USD") as
    | "AOA"
    | "USD"
    | "EUR";
  const confirmed = booking.status === "confirmed" || booking.status === "completed";

  return (
    <main className="min-h-screen bg-[#f4f6f8]">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center px-4 py-4 sm:px-6">
          <Link
            href={`/properties/${booking.property_id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <MdArrowBack size={18} /> {t("backToProperty", "Back to property")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#0f766e] to-teal-600 px-6 py-8 text-white">
            <div className="flex items-start gap-3">
              <MdCheckCircle size={36} className="shrink-0 text-teal-100" />
              <div>
                <h1 className="text-2xl font-bold">
                  {confirmed
                    ? t("bookingConfirmed", "Booking confirmed")
                    : t("bookingReceived", "Booking received")}
                </h1>
                <p className="mt-1 text-sm text-teal-50/90">{booking.property_title}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("bookingCode", "Booking code")}
              </p>
              <p className="mt-1 font-mono text-xl font-bold tracking-wide text-[#0f766e]">
                {booking.booking_code}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("checkIn", "Check-in")}
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">{booking.check_in}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("checkOut", "Check-out")}
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">{booking.check_out}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("nights", "Nights")}
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">{booking.nights}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("guests", "Guests")}
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {booking.adults} {t("adults", "adults")}
                  {booking.children > 0 ? `, ${booking.children} ${t("children", "children")}` : ""}
                  {booking.infants > 0 ? `, ${booking.infants} ${t("infants", "infants")}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("applicationStatus", "Status")}
                </dt>
                <dd className="mt-1 font-semibold uppercase text-teal-700">
                  {booking.status.replace(/_/g, " ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("total", "Total")}
                </dt>
                <dd className="mt-1 text-xl font-bold text-slate-900">
                  {formatCurrency(parseFloat(booking.total_amount), currencyCode)}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <Link
                href="/UserDashboard?menu=upcomingStays"
                className="rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                {t("upcomingStays", "Upcoming stays")}
              </Link>
              <Link
                href="/properties"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t("backToSearch", "Back to search")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StayBookingConfirmationPage() {
  return (
    <PlatformServiceGate slug="property">
      <StayBookingConfirmationContent />
    </PlatformServiceGate>
  );
}

export default withAuth(StayBookingConfirmationPage);
