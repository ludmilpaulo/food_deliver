"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { fetchServiceCategories, fetchMyServices, createService, updateService, fetchAvailability, createAvailability, fetchBlackouts, createBlackout, getAvailableBalance, requestPayout } from "@/services/partnerApi";
import { t } from "@/configs/i18n";

export default function PartnerDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [blackouts, setBlackouts] = useState<any[]>([]);
  const [balance, setBalance] = useState<{ available_balance: number; currency: string } | null>(null);
  const parceiroId = user?.user_id; // assuming store has same user id; adapt if needed

  useEffect(() => {
    (async () => {
      try {
        const [cats, bal] = await Promise.all([
          fetchServiceCategories(),
          getAvailableBalance().catch(() => null),
        ]);
        setCategories(cats);
        if (bal) setBalance(bal);
        if (parceiroId) {
          const my = await fetchMyServices(parceiroId);
          setServices(my);
        }
      } catch {}
    })();
  }, [parceiroId]);

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
    if (!parceiroId || categories.length === 0) return;
    const created = await createService({
      parceiro: parceiroId,
      category: categories[0].id,
      title: "New Service",
      price: 1000,
      currency: "AOA",
      duration_minutes: 90,
      delivery_type: "in_person",
      is_active: true,
    });
    setServices((s) => [created, ...s]);
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
        <h1 className="text-3xl font-bold text-white mb-6">Partner Dashboard</h1>

        <section className="bg-white/90 rounded-2xl p-5 shadow mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Services</h2>
            <button onClick={handleCreateService} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
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
              <h2 className="text-xl font-semibold">Availability</h2>
              <button onClick={handleAddAvailability} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
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
              <h2 className="text-xl font-semibold">Blackout Days</h2>
              <button onClick={handleAddBlackout} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
            </div>
            <ul className="mt-3 list-disc pl-5">
              {blackouts.map((b) => (
                <li key={b.id} className="text-sm">{b.start_date} → {b.end_date} · {b.reason}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-white/90 rounded-2xl p-5 shadow mb-6">
          <h2 className="text-xl font-semibold">Payouts</h2>
          <div className="mt-3">
            <div className="text-sm text-gray-700">Available: {balance?.available_balance ?? 0} {balance?.currency ?? 'AOA'}</div>
            <button className="mt-2 px-3 py-2 bg-green-600 text-white rounded" onClick={handleRequestPayout}>Request Payout</button>
          </div>
        </section>
      </div>
    </main>
  );
}


