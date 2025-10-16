"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getServiceById, getServiceAvailability, createBooking, type ServiceDetail } from "@/services/serviceApi";
import Image from "next/image";
import { t } from "@/configs/i18n";
import { useAppSelector } from "@/redux/store";
import { getCurrentUser } from "@/services/authService";

export default function ServiceDetailPage() {
  const params = useParams();
  const { user } = useAppSelector((s) => s.auth);
  const id = Number(params?.id);

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch customer id if logged in
        if (user?.user_id) {
          try {
            const profile = await getCurrentUser(user.user_id);
            const cid = profile?.customer_details?.id;
            if (mounted && cid) setCustomerId(cid);
          } catch (e) {
            // ignore profile errors; user might not be a customer yet
          }
        }
        const data = await getServiceById(id);
        if (!mounted) return;
        setService(data);
        const avail = await getServiceAvailability(id, selectedDate, selectedDate);
        if (!mounted) return;
        const daySlots = avail.available_slots[selectedDate] || [];
        setSlots(daySlots);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load service");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, selectedDate]);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    try {
      const avail = await getServiceAvailability(id, date, date);
      const daySlots = avail.available_slots[date] || [];
      setSlots(daySlots);
    } catch (e: any) {
      setSlots([]);
    }
  };

  const handleBook = async () => {
    if (!user) {
      setBookingMessage("Please log in first");
      return;
    }
    if (!selectedTime || !service) return;
    if (!customerId) {
      setBookingMessage("Customer profile not found");
      return;
    }
    setBookingLoading(true);
    setBookingMessage(null);
    try {
      await createBooking({
        service: service.id,
        customer: customerId,
        booking_date: selectedDate,
        booking_time: selectedTime,
        duration_minutes: service.duration_minutes,
        customer_notes: note,
        payment_method: "card",
      });
      setBookingMessage("Booking created!");
    } catch (e: any) {
      setBookingMessage(e?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="p-6">{t("loading")}</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!service) return null;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-4">
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100">
          {service.image ? (
            <Image src={service.image} alt={service.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
        </div>
        <h1 className="text-2xl font-bold mt-4">{service.title}</h1>
        <div className="text-gray-600">{service.parceiro_name}</div>
        <div className="mt-2 text-blue-700 font-bold">
          {service.price.toFixed(2)} {service.currency}
        </div>
        <p className="mt-3 text-gray-700 whitespace-pre-line">{service.description}</p>

        <div className="mt-6 p-4 border rounded-xl">
          <h2 className="font-semibold mb-2">Availability</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {slots.length === 0 && (
              <div className="text-gray-500">No slots available</div>
            )}
            {slots.map((s) => (
              <button
                key={s.time}
                onClick={() => setSelectedTime(s.time)}
                disabled={!s.available}
                className={`px-3 py-2 rounded border text-sm ${
                  selectedTime === s.time ? "bg-black text-white border-black" : "bg-white"
                } ${!s.available ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {s.time}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <textarea
              className="w-full border rounded p-2"
              placeholder="Notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleBook}
            disabled={!selectedTime || bookingLoading}
          >
            {bookingLoading ? t("loading") : "Book Now"}
          </button>

          {bookingMessage && (
            <div className="mt-3 text-sm">
              {bookingMessage}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


