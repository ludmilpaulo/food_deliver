"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { fetchServiceCategories, fetchMyServices, createService, fetchAvailability, createAvailability, fetchBlackouts, createBlackout, getAvailableBalance, requestPayout, type Availability, type Blackout, type PartnerService, type ServiceCategory } from "@/services/partnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import withPartnerAuth from "@/components/PartnerRouteGuard";

function PartnerDashboard() {
  const { t } = useTranslation();
  const { user } = useAppSelector((s) => s.auth);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<PartnerService[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [balance, setBalance] = useState<{ available_balance: number; currency: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("100");
  const [duration, setDuration] = useState("60");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const parceiroId = user?.user_id;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const cats = await fetchServiceCategories();
        setCategories(cats);
        if (cats[0]) setCategoryId(cats[0].id);
        try {
          setBalance(await getAvailableBalance());
        } catch {
          setBalance(null);
        }
        if (parceiroId) {
          const my = await fetchMyServices();
          setServices(my);
        }
      } catch {
        setError(t("loadFailed", "Failed to load partner dashboard."));
      } finally {
        setLoading(false);
      }
    })();
  }, [parceiroId, t]);

  const loadServiceDetails = async (serviceId: number) => {
    setSelectedService(serviceId);
    const [av, bl] = await Promise.all([
      fetchAvailability(serviceId),
      fetchBlackouts(serviceId),
    ]);
    setAvailability(av);
    setBlackouts(bl);
  };

  const handleCreateService = async () => {
    if (!parceiroId || !categoryId || !title.trim()) return;
    const created = await createService({
      category: Number(categoryId),
      title: title.trim(),
      description: description.trim() || title.trim(),
      price: Number(price),
      currency: "ZAR",
      duration_minutes: Number(duration) || 60,
      delivery_type: "in_person",
      is_active: true,
    });
    setServices((s) => [created, ...s]);
    setTitle("");
    setDescription("");
  };

  const handleAddAvailability = async () => {
    if (!selectedService) return;
    const av = await createAvailability({
      service: selectedService,
      is_recurring: true,
      day_of_week: 1,
      start_time: "09:00:00",
      end_time: "18:00:00",
      is_active: true,
    });
    setAvailability((a) => [av, ...a]);
  };

  const handleAddBlackout = async () => {
    if (!selectedService) return;
    const bl = await createBlackout({
      service: selectedService,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      reason: "Holiday",
    });
    setBlackouts((b) => [bl, ...b]);
  };

  const handleRequestPayout = async () => {
    if (!balance) return;
    await requestPayout({ amount: balance.available_balance, currency: balance.currency });
    alert(t("requestSent") || "Request sent");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-400 to-blue-500 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-6">
          {t("partnerDashboard", "Partner Dashboard")}
        </h1>

        {loading && <p className="text-white">{t("loading")}</p>}
        {error && <p className="text-red-100 bg-red-600/80 rounded-lg p-3 mb-4">{error}</p>}

        <section className="bg-white/90 rounded-2xl p-5 shadow mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("myServices", "My Services")}</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              className="rounded-lg border px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("title", "Title")} className="rounded-lg border px-3 py-2" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t("price", "Price")} className="rounded-lg border px-3 py-2" />
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder={t("durationMinutes", "Duration (minutes)")} className="rounded-lg border px-3 py-2" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("description", "Description")} className="rounded-lg border px-3 py-2 md:col-span-2" />
            <button onClick={handleCreateService} className="px-3 py-2 bg-blue-600 text-white rounded md:col-span-2">
              {t("add", "Add")}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((s) => (
              <div key={s.id} className={`border rounded-xl p-3 cursor-pointer ${selectedService===s.id? 'border-blue-600' : ''}`} onClick={() => loadServiceDetails(s.id)}>
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-gray-600">{s.price} {s.currency} · {s.duration_minutes}m</div>
                <div className="text-xs text-gray-500">{s.delivery_type}</div>
              </div>
            ))}
          </div>
        </section>

        {selectedService && (
          <section className="bg-white/90 rounded-2xl p-5 shadow mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t("availability", "Availability")}</h2>
              <button onClick={handleAddAvailability} className="px-3 py-2 bg-blue-600 text-white rounded">
                {t("add", "Add")}
              </button>
            </div>
            <ul className="mt-3 list-disc pl-5">
              {availability.map((a) => (
                <li key={a.id} className="text-sm">{a.is_recurring ? `DOW ${a.day_of_week}` : a.specific_date} · {a.start_time}-{a.end_time}</li>
              ))}
            </ul>
          </section>
        )}

        {selectedService && (
          <section className="bg-white/90 rounded-2xl p-5 shadow mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t("blackoutDays", "Blackout Days")}</h2>
              <button onClick={handleAddBlackout} className="px-3 py-2 bg-blue-600 text-white rounded">
                {t("add", "Add")}
              </button>
            </div>
            <ul className="mt-3 list-disc pl-5">
              {blackouts.map((b) => (
                <li key={b.id} className="text-sm">{b.start_date} → {b.end_date} · {b.reason}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-white/90 rounded-2xl p-5 shadow mb-6">
          <h2 className="text-xl font-semibold">{t("payouts", "Payouts")}</h2>
          <div className="mt-3">
            <div className="text-sm text-gray-700">
              {balance
                ? `${t("available", "Available")}: ${balance.available_balance} ${balance.currency}`
                : t("earningsUnavailable", "Wallet earnings could not be loaded.")}
            </div>
            <button className="mt-2 px-3 py-2 bg-green-600 text-white rounded" onClick={handleRequestPayout} disabled={!balance}>
              {t("requestPayout", "Request Payout")}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default withPartnerAuth(PartnerDashboard);
