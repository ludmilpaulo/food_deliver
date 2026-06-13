"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DoctorDashboardTab } from "@/types/doctor";
import DoctorDashboardHeader from "@/components/doctor/DoctorDashboardHeader";
import DoctorStatsGrid from "@/components/doctor/DoctorStatsGrid";
import DoctorProfilePanel from "@/components/doctor/DoctorProfilePanel";
import DoctorServicesPanel from "@/components/doctor/DoctorServicesPanel";
import DoctorAvailabilityPanel from "@/components/doctor/DoctorAvailabilityPanel";
import DoctorAppointmentsPanel from "@/components/doctor/DoctorAppointmentsPanel";
import DoctorVerificationRequired from "@/components/doctor/DoctorVerificationRequired";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";
import { verificationStatusLabel } from "@/configs/doctorTranslations";
import {
  useGetDoctorDashboardQuery,
  useGetDoctorAppointmentsQuery,
  useGetDoctorVerificationStatusQuery,
} from "@/redux/slices/doctorApi";
import { useGetNotificationsQuery } from "@/redux/slices/notificationApi";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { dt, languageCode } = useDoctorTranslation();
  const [activeTab, setActiveTab] = useState<DoctorDashboardTab>("overview");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { data: stats, isLoading, isError } = useGetDoctorDashboardQuery(undefined, {
    pollingInterval: 60000,
  });
  const { data: verification, isLoading: verificationLoading } = useGetDoctorVerificationStatusQuery();
  const { data: recentAppointments = [], refetch: refetchAppointments } = useGetDoctorAppointmentsQuery({ filter: "upcoming" });
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, { pollingInterval: 45000 });

  const latestBookingAlert = useMemo(
    () => notifications.find((item) => item.notificationType === "new_booking" && !item.isRead),
    [notifications],
  );

  const canOperate = useMemo(
    () =>
      Boolean(
        verification?.canOperate ||
        (verification?.verificationStatus === "approved" && verification?.isActiveOnPlatform) ||
        (stats?.canOperate),
      ),
    [verification, stats],
  );

  const currencyFormatter = useMemo(
    () => (value: string) => {
      const amount = Number(value);
      if (!Number.isFinite(amount)) return value;
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: stats?.currency || "AOA",
        maximumFractionDigits: 0,
      }).format(amount);
    },
    [stats?.currency],
  );

  if (isLoading || verificationLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">{dt("loadingDashboard")}</div>;
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-slate-700">{dt("dashboardLoadError")}</p>
          <button type="button" onClick={() => router.push("/LoginScreenUser?next=/dashboard/doctor")} className="mt-4 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
            {dt("signIn")}
          </button>
        </div>
      </div>
    );
  }

  if (!canOperate && verification) {
    return (
      <DoctorVerificationRequired
        verification={verification}
        clinicName={stats.clinicName}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <DoctorDashboardHeader
          stats={stats}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onQuickAction={setActiveTab}
          onNewBookingNotification={() => {
            setToastMessage(dt("newBookingAlert"));
            void refetchAppointments();
          }}
        />

        {toastMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {toastMessage}
          </div>
        )}

        {latestBookingAlert && activeTab === "overview" && (
          <article className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">{dt("newBookingAlert")}</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{latestBookingAlert.title}</p>
            <p className="mt-1 text-sm text-slate-600">{latestBookingAlert.message}</p>
            <button
              type="button"
              onClick={() => setActiveTab("appointments")}
              className="mt-4 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
            >
              {dt("viewAppointments")}
            </button>
          </article>
        )}

        {activeTab === "overview" && (
          <>
            <DoctorStatsGrid stats={stats} currencyFormatter={currencyFormatter} />
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">{dt("recentActivity")}</h2>
                <div className="mt-4 space-y-3">
                  {recentAppointments.slice(0, 5).map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                      <p className="font-medium text-slate-800">{item.patientName}</p>
                      <p className="text-slate-500">{item.date} · {item.startTime} · {item.status}</p>
                    </div>
                  ))}
                  {recentAppointments.length === 0 && (
                    <p className="text-sm text-slate-500">{dt("noUpcomingAppointments")}</p>
                  )}
                </div>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">{dt("quickActions")}</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    [dt("setWeeklyAvailability"), "availability"],
                    [dt("manageServicesAction"), "services"],
                    [dt("reviewAppointmentsAction"), "appointments"],
                    [dt("completeProfileAction"), "profile"],
                  ].map(([label, tab]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setActiveTab(tab as DoctorDashboardTab)}
                      className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-left text-sm font-semibold text-teal-800 hover:bg-teal-100"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}

        {activeTab === "profile" && <DoctorProfilePanel />}
        {activeTab === "services" && <DoctorServicesPanel />}
        {activeTab === "availability" && <DoctorAvailabilityPanel locked={!stats.canOperate} />}
        {activeTab === "appointments" && <DoctorAppointmentsPanel />}
        {activeTab === "patients" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{dt("patients")}</h2>
            <p className="mt-2 text-sm text-slate-500">{dt("emptyPatients")}</p>
            <p className="mt-4 text-2xl font-bold text-teal-700">{stats.totalPatients}</p>
          </section>
        )}
        {activeTab === "reviews" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{dt("reviews")}</h2>
            <p className="mt-2 text-sm text-slate-500">{dt("ratingLabel")}</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{stats.averageRating.toFixed(1)}</p>
            <p className="text-sm text-slate-500">{stats.reviewCount} {dt("reviews").toLowerCase()}</p>
          </section>
        )}
        {activeTab === "business" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{dt("businessProfile")}</h2>
            <p className="mt-2 text-sm text-slate-500">{dt("businessProfileDesc")}</p>
            <p className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {dt("verifiedLabel")} · {verificationStatusLabel(stats.verificationStatus, languageCode)}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
