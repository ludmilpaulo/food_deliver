"use client";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";

type Booking = {
  id: number;
  booking_number: string;
  service_title: string;
  parceiro_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  price: number;
  currency?: string;
};

export default function Bookings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Booking[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<Booking[]>("/services/bookings/");
        if (!mounted) return;
        const json = res.data;
        // Map into UI-friendly shape
        const mapped: Booking[] = (json as Booking[]).map((b) => ({
          id: b.id,
          booking_number: b.booking_number,
          service_title: b.service_title || (b as Booking & { service?: { title?: string } }).service?.title || "",
          parceiro_name: b.parceiro_name || (b as Booking & { service?: { parceiro_name?: string } }).service?.parceiro_name || "",
          booking_date: b.booking_date,
          booking_time: b.booking_time,
          status: b.status,
          price: b.price,
          currency: b.currency || "AOA",
        }));
        setData(mapped);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : t("failedToLoadBookings", "Failed to load bookings"));
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>{t("loading")}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (data.length === 0) {
    return <div className="text-gray-600">{t("noBookingsYet", "No bookings yet")}</div>;
  }

  return (
    <div className="space-y-3">
      {data.map((b) => (
        <div key={b.id} className="border rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{b.service_title}</div>
            <div className="text-sm text-gray-500">#{b.booking_number}</div>
          </div>
          <div className="text-sm text-gray-600">{b.parceiro_name}</div>
          <div className="mt-1 text-sm">{b.booking_date} {b.booking_time}</div>
          <div className="mt-1 text-sm capitalize">{b.status.replaceAll("_", " ")}</div>
          <div className="mt-1 font-bold text-blue-700">{b.price?.toFixed(2)} {b.currency}</div>
        </div>
      ))}
    </div>
  );
}


