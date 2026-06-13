"use client";

import { useState } from "react";
import {
  useCreateDoctorServiceMutation,
  useDeleteDoctorServiceMutation,
  useGetDoctorServicesQuery,
} from "@/redux/slices/doctorApi";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";

export default function DoctorServicesPanel() {
  const { dt } = useDoctorTranslation();
  const { data: services = [], isLoading } = useGetDoctorServicesQuery();
  const [createService, { isLoading: creating }] = useCreateDoctorServiceMutation();
  const [deleteService] = useDeleteDoctorServiceMutation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("5000");
  const [durationMinutes, setDurationMinutes] = useState(60);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createService({ name, price, durationMinutes, consultationType: "both", isActive: true });
    setName("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{dt("addConsultationService")}</h2>
        <div className="mt-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={dt("serviceName")} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={dt("servicePrice")} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} placeholder={dt("durationMinutesLabel")} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          <button type="button" disabled={creating} onClick={() => void handleCreate()} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {creating ? dt("loading") : dt("addService")}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{dt("yourServices")}</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">{dt("loading")}</p>
        ) : services.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            {dt("noServicesYet")}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {services.map((service) => (
              <article key={service.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{service.name}</p>
                  <p className="text-sm text-slate-500">
                    {service.price} {service.currency} · {service.durationMinutes} min · {service.consultationType}
                  </p>
                </div>
                <button type="button" onClick={() => void deleteService(service.id)} className="text-xs font-semibold text-rose-600 hover:underline">
                  {dt("deleteLabel")}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
