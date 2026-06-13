"use client";

import { useEffect, useState } from "react";
import {
  useGetDoctorProfileQuery,
  useUpdateDoctorProfileMutation,
} from "@/redux/slices/doctorApi";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";

export default function DoctorProfilePanel() {
  const { dt } = useDoctorTranslation();
  const { data: profile, isLoading } = useGetDoctorProfileQuery();
  const [updateProfile, { isLoading: saving, isSuccess }] = useUpdateDoctorProfileMutation();
  const [form, setForm] = useState({
    clinicName: "",
    professionalTitle: "",
    biography: "",
    languages: "",
    yearsExperience: 0,
    licenseNumber: "",
    consultationFee: "",
    onlineConsultationEnabled: true,
    physicalConsultationEnabled: true,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      clinicName: profile.clinicName,
      professionalTitle: profile.professionalTitle,
      biography: profile.biography,
      languages: profile.languages,
      yearsExperience: profile.yearsExperience,
      licenseNumber: profile.licenseNumber,
      consultationFee: profile.consultationFee,
      onlineConsultationEnabled: profile.onlineConsultationEnabled,
      physicalConsultationEnabled: profile.physicalConsultationEnabled,
    });
  }, [profile]);

  if (isLoading || !profile) {
    return <p className="text-sm text-slate-500">{dt("loading")}</p>;
  }

  const fields: { key: keyof typeof form; label: string }[] = [
    { key: "clinicName", label: dt("clinicNameLabel") },
    { key: "professionalTitle", label: dt("professionalTitleLabel") },
    { key: "languages", label: dt("languagesLabel") },
    { key: "licenseNumber", label: dt("licenseNumberLabel") },
    { key: "consultationFee", label: dt("consultationFeeLabel") },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{dt("profile")}</h2>
      <p className="mt-1 text-sm text-slate-500">{dt("profileDescription")}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map(({ key, label }) => (
          <label key={key} className="block text-sm">
            <span className="font-medium text-slate-700">{label}</span>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form[key] as string}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          </label>
        ))}
        <label className="block text-sm">
          <span className="font-medium text-slate-700">{dt("yearsExperienceLabel")}</span>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.yearsExperience}
            onChange={(e) => setForm((prev) => ({ ...prev, yearsExperience: Number(e.target.value) }))}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm">
        <span className="font-medium text-slate-700">{dt("biographyLabel")}</span>
        <textarea
          rows={4}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          value={form.biography}
          onChange={(e) => setForm((prev) => ({ ...prev, biography: e.target.value }))}
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={form.onlineConsultationEnabled} onChange={(e) => setForm((prev) => ({ ...prev, onlineConsultationEnabled: e.target.checked }))} />
          {dt("onlineConsultation")}
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={form.physicalConsultationEnabled} onChange={(e) => setForm((prev) => ({ ...prev, physicalConsultationEnabled: e.target.checked }))} />
          {dt("physicalConsultation")}
        </label>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void updateProfile({ ...profile, ...form })}
        className="mt-6 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {saving ? dt("loading") : dt("saveProfile")}
      </button>
      {isSuccess && <p className="mt-3 text-sm text-teal-700">{dt("profileUpdated")}</p>}
    </section>
  );
}
