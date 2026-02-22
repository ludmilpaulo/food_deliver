"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchServices } from "@/redux/slices/servicesSlice";
import type { ServiceListItem } from "@/services/serviceApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { t } from "@/configs/i18n";

export default function ServicesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data, loading, error } = useAppSelector((s) => s.services);

  const [search, setSearch] = useState("");
  const [requestedOnce, setRequestedOnce] = useState(false);

  useEffect(() => {
    setRequestedOnce(true);
    dispatch(fetchServices(undefined));
  }, [dispatch]);

  const formatPrice = (value: unknown): string => {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        (s.parceiro_name || "").toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-400 to-blue-500 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-4">Services</h1>

        <div className="flex items-center bg-white/90 rounded-full px-4 py-3 shadow mb-6">
          <input
            className="flex-1 text-base text-black bg-transparent outline-none"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && (
          <div className="text-white text-center py-16">{t("loading")}</div>
        )}
        {!loading && error && (
          <div className="bg-red-600/70 text-white text-center py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        {!loading && requestedOnce && !error && filtered.length === 0 && (
          <p className="text-center text-white/90 mt-16">{t("noStores")}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map((svc: ServiceListItem) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl p-4 shadow hover:bg-blue-50 cursor-pointer"
              onClick={() => router.push(`/services/${svc.id}`)}
            >
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-200 mb-3">
                {svc.image ? (
                  <Image src={svc.image} alt={svc.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="font-semibold text-gray-800 truncate">{svc.title}</div>
              <div className="text-sm text-gray-500 truncate">{svc.parceiro_name}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-blue-700 font-bold">
                  {formatPrice(svc.price)} {svc.currency}
                </span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  {svc.duration_minutes}m
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


