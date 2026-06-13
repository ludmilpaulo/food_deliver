"use client";

import { useState } from "react";
import {
  useGetDoctorAppointmentsQuery,
  useUpdateDoctorAppointmentStatusMutation,
} from "@/redux/slices/doctorApi";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";

const filters = [
  { id: "all", key: "filterAll" as const },
  { id: "today", key: "filterToday" as const },
  { id: "upcoming", key: "filterUpcoming" as const },
  { id: "pending", key: "filterPending" as const },
  { id: "completed", key: "filterCompleted" as const },
  { id: "cancelled", key: "filterCancelled" as const },
];

export default function DoctorAppointmentsPanel() {
  const { dt } = useDoctorTranslation();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { data: appointments = [], isLoading, refetch } = useGetDoctorAppointmentsQuery({ filter, search });
  const [updateStatus] = useUpdateDoctorAppointmentStatusMutation();

  const handleStatus = async (id: number, status: "confirmed" | "completed" | "cancelled" | "no_show") => {
    await updateStatus({ id, body: { status } });
    void refetch();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{dt("appointments")}</h2>
          <p className="text-sm text-slate-500">{dt("reviewAppointmentsAction")}</p>
        </div>
        <input
          type="search"
          placeholder={dt("searchPatient")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm md:max-w-xs"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === item.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {dt(item.key)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500">{dt("loading")}</p>
      ) : appointments.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          {dt("noAppointmentsFilter")}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {appointments.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.patientName}</p>
                  <p className="text-sm text-slate-500">{item.patientEmail}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.date} · {item.startTime} – {item.endTime} · {item.appointmentType}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{dt("statusLabel")}: {item.status}</p>
                  {item.notes && <p className="mt-2 text-sm text-slate-600">{dt("patientNote")}: {item.notes}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.status === "pending" && (
                    <button type="button" onClick={() => void handleStatus(item.id, "confirmed")} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white">
                      {dt("confirmAppointment")}
                    </button>
                  )}
                  {(item.status === "pending" || item.status === "confirmed") && (
                    <>
                      <button type="button" onClick={() => void handleStatus(item.id, "completed")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">
                        {dt("completeAppointment")}
                      </button>
                      <button type="button" onClick={() => void handleStatus(item.id, "no_show")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">
                        {dt("noShow")}
                      </button>
                      <button type="button" onClick={() => void handleStatus(item.id, "cancelled")} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">
                        {dt("cancelAppointment")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
