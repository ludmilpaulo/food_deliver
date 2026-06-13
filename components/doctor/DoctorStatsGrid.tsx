"use client";

import type { DoctorDashboardStats } from "@/types/doctor";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";
import {
  CalendarCheck,
  CalendarClock,
  Star,
  Users,
  Wallet,
  Activity,
} from "lucide-react";

type Props = {
  stats: DoctorDashboardStats;
  currencyFormatter: (value: string) => string;
};

export default function DoctorStatsGrid({ stats, currencyFormatter }: Props) {
  const { dt } = useDoctorTranslation();

  const cards = [
    { label: dt("todaysAppointments"), value: String(stats.todayAppointments), icon: CalendarCheck, tone: "from-teal-500 to-emerald-600" },
    { label: dt("pendingRequests"), value: String(stats.pendingAppointments), icon: CalendarClock, tone: "from-amber-500 to-orange-600" },
    { label: dt("availableSlotsWeek"), value: String(stats.availableSlotsThisWeek), icon: Activity, tone: "from-sky-500 to-blue-600" },
    { label: dt("patients"), value: String(stats.totalPatients), icon: Users, tone: "from-violet-500 to-purple-600" },
    { label: dt("ratingLabel"), value: stats.averageRating.toFixed(1), icon: Star, tone: "from-rose-500 to-pink-600" },
    { label: dt("monthlyEarnings"), value: currencyFormatter(stats.monthlyEarnings), icon: Wallet, tone: "from-cyan-600 to-teal-700" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-white/60 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.tone}`} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
              </div>
              <div className={`rounded-xl bg-gradient-to-br ${card.tone} p-3 text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
