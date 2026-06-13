"use client";

import type { DoctorDashboardStats, DoctorDashboardTab } from "@/types/doctor";
import DoctorNotificationBell from "@/components/doctor/DoctorNotificationBell";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";
import { verificationStatusLabel } from "@/configs/doctorTranslations";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Stethoscope,
  Star,
  UserCircle2,
} from "lucide-react";

type Props = {
  stats: DoctorDashboardStats;
  activeTab: DoctorDashboardTab;
  onTabChange: (tab: DoctorDashboardTab) => void;
  onQuickAction: (tab: DoctorDashboardTab) => void;
  onNewBookingNotification?: () => void;
};

import type { DoctorTranslationKey } from "@/configs/doctorTranslations";

const tabs: { id: DoctorDashboardTab; labelKey: DoctorTranslationKey; icon: typeof LayoutDashboard }[] = [
  { id: "overview", labelKey: "doctorDashboardTitle", icon: LayoutDashboard },
  { id: "profile", labelKey: "profile", icon: UserCircle2 },
  { id: "services", labelKey: "services", icon: Stethoscope },
  { id: "availability", labelKey: "setAvailability", icon: CalendarDays },
  { id: "appointments", labelKey: "appointments", icon: ClipboardList },
  { id: "patients", labelKey: "patients", icon: Building2 },
  { id: "reviews", labelKey: "reviews", icon: Star },
  { id: "business", labelKey: "profile", icon: BadgeCheck },
];

export default function DoctorDashboardHeader({ stats, activeTab, onTabChange, onQuickAction, onNewBookingNotification }: Props) {
  const { dt, languageCode } = useDoctorTranslation();
  const verificationLabel = verificationStatusLabel(
    stats.verificationStatus ?? stats.approvalStatus,
    languageCode,
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-700 via-cyan-700 to-blue-800 text-white shadow-xl">
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Stethoscope className="h-4 w-4" />
              Healthcare · {dt("doctorDashboardTitle")}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{stats.clinicName}</h1>
            <p className="mt-2 text-teal-50/90">{stats.specialtyName} · Medical profile and consultation booking</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                {stats.isActive ? dt("activeLabel") : dt("inactiveLabel")}
              </span>
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100">
                {dt("verifiedLabel")}: {verificationLabel}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                {dt("profileCompletionLabel")}: {stats.profileCompletionPercent}%
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                {dt("ratingLabel")}: {stats.averageRating.toFixed(1)} ({stats.reviewCount})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              { label: dt("appointments"), value: stats.todayAppointments },
              { label: dt("newBooking"), value: stats.pendingAppointments },
              { label: dt("patients"), value: stats.totalPatients },
              { label: dt("setAvailability"), value: stats.availableSlotsThisWeek },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-xs text-teal-100">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end lg:justify-start">
            <DoctorNotificationBell onNewBooking={onNewBookingNotification ? () => onNewBookingNotification() : undefined} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { label: dt("addService"), tab: "services" as const },
            { label: dt("setAvailability"), tab: "availability" as const },
            { label: dt("viewAppointments"), tab: "appointments" as const },
            { label: dt("profile"), tab: "profile" as const },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onQuickAction(action.tab)}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/5 px-3 py-3 md:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? "bg-white text-teal-800 shadow-sm" : "text-teal-50 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {dt(tab.labelKey)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
