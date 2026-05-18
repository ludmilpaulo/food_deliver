"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BASE_API || "https://www.kudya.store";

interface PlatformModule {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  route: string;
  gradient_start: string;
  gradient_end: string;
}

const ROUTE_LINKS: Record<string, string> = {
  Food: "/stores",
  Grocery: "/stores",
  Rides: "/rides",
  SendPackage: "/send-package",
  CarRental: "/car-rental",
  Wallet: "/wallet",
  MainTabs: "/stores",
  Doctors: "/services",
  Services: "/services",
  Properties: "/properties",
  Accommodation: "/properties",
  ComingSoon: "/stores",
};

export default function SuperAppModules({ lang = "en" }: { lang?: string }) {
  const [modules, setModules] = useState<PlatformModule[]>([]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/platform/home-modules/`, { params: { lang } })
      .then((res) => setModules(res.data))
      .catch(() => setModules([]));
  }, [lang]);

  if (!modules.length) return null;

  return (
    <section className="mb-10">
      <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-1">Kudya</p>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">What do you need today?</h2>
      <p className="text-slate-500 text-sm mb-6">Your life, one app</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <Link
            key={mod.id}
            href={ROUTE_LINKS[mod.route] || "/app/coming-soon"}
            className="rounded-2xl p-4 min-h-[120px] flex flex-col justify-between text-white shadow-lg hover:scale-[1.02] transition-transform"
            style={{
              background: `linear-gradient(135deg, ${mod.gradient_start}, ${mod.gradient_end})`,
            }}
          >
            <span className="text-lg font-bold">{mod.title}</span>
            <span className="text-sm opacity-90">{mod.subtitle}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
