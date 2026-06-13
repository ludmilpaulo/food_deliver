"use client";

import { useMemo, useState } from "react";
import type { DoctorAvailabilityInput } from "@/types/doctor";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";
import {
  useCreateDoctorAvailabilityMutation,
  useDeleteDoctorAvailabilityMutation,
  useGetDoctorAvailabilityQuery,
  useGetDoctorSlotsQuery,
  usePreviewDoctorAvailabilityMutation,
  useBlockDoctorSlotMutation,
} from "@/redux/slices/doctorApi";

const dayOptions = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

function extractApiError(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: Record<string, unknown> }).data;
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.non_field_errors) && typeof data.non_field_errors[0] === "string") {
      return data.non_field_errors[0];
    }
    const firstFieldError = data
      ? Object.values(data).find((value) => Array.isArray(value) && typeof value[0] === "string")
      : undefined;
    if (Array.isArray(firstFieldError) && typeof firstFieldError[0] === "string") {
      return firstFieldError[0];
    }
  }
  return fallback;
}

const defaultForm: DoctorAvailabilityInput = {
  dayOfWeek: 0,
  startTime: "09:00",
  endTime: "17:00",
  consultationDurationMinutes: 60,
  breakDurationMinutes: 10,
  consultationType: "both",
  isAvailable: true,
  isActive: true,
};

export default function DoctorAvailabilityPanel({ locked = false }: { locked?: boolean }) {
  const { dt } = useDoctorTranslation();
  const [form, setForm] = useState<DoctorAvailabilityInput>(defaultForm);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState<string | null>(null);

  const { data: availability = [], isLoading } = useGetDoctorAvailabilityQuery();
  const { data: slots = [], isLoading: slotsLoading } = useGetDoctorSlotsQuery(selectedDate);
  const [previewSlots, { data: preview = [], isLoading: previewLoading }] = usePreviewDoctorAvailabilityMutation();
  const [createAvailability, { isLoading: saving }] = useCreateDoctorAvailabilityMutation();
  const [deleteAvailability] = useDeleteDoctorAvailabilityMutation();
  const [blockSlot] = useBlockDoctorSlotMutation();

  const dayLabel = useMemo(
    () => dayOptions.find((d) => d.value === form.dayOfWeek)?.label ?? "Day",
    [form.dayOfWeek],
  );

  const handlePreview = async () => {
    setMessage(null);
    try {
      await previewSlots(form).unwrap();
    } catch (error: unknown) {
      setMessage(extractApiError(error, dt("availabilityFailed")));
    }
  };

  const handleSave = async () => {
    setMessage(null);
    try {
      await createAvailability(form).unwrap();
      setMessage(dt("availabilitySaved"));
      try {
        await previewSlots(form).unwrap();
      } catch {
        /* preview is optional after a successful save */
      }
    } catch (error: unknown) {
      setMessage(extractApiError(error, dt("availabilityFailed")));
    }
  };

  if (locked) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-amber-900">{dt("verificationRequired")}</h2>
        <p className="mt-3 text-sm text-amber-800 max-w-lg mx-auto">
          {dt("underReviewMessage")}
        </p>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{dt("weeklyAvailability")}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {dt("slotRules")}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Day</span>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.dayOfWeek}
              onChange={(e) => setForm((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
            >
              {dayOptions.map((day) => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Consultation type</span>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.consultationType}
              onChange={(e) => setForm((prev) => ({ ...prev, consultationType: e.target.value as DoctorAvailabilityInput["consultationType"] }))}
            >
              <option value="both">Online & physical</option>
              <option value="physical">Physical</option>
              <option value="online">Online</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Start</span>
            <input type="time" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">End</span>
            <input type="time" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))} />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Consultation (minutes)</span>
            <input type="number" min={15} step={5} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.consultationDurationMinutes} onChange={(e) => setForm((prev) => ({ ...prev, consultationDurationMinutes: Number(e.target.value) }))} />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Break (minutes)</span>
            <input type="number" min={0} step={5} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.breakDurationMinutes} onChange={(e) => setForm((prev) => ({ ...prev, breakDurationMinutes: Number(e.target.value) }))} />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => void handlePreview()} className="rounded-xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50">
            {dt("previewSlots")}
          </button>
          <button type="button" disabled={saving} onClick={() => void handleSave()} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {saving ? dt("loading") : dt("saveAvailability")}
          </button>
        </div>
        {message && (
          <p className={`mt-3 text-sm ${message.toLowerCase().includes("saved") ? "text-teal-700" : "text-rose-700"}`}>
            {message}
          </p>
        )}

        <div className="mt-6">
          <h3 className="font-semibold text-slate-900">{dt("slotPreviewTitle")} · {dayLabel}</h3>
          {previewLoading ? (
            <p className="mt-3 text-sm text-slate-500">{dt("generatingPreview")}</p>
          ) : preview.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">{dt("previewBeforeSave")}</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {preview.map((slot) => (
                <div key={`${slot.startTime}-${slot.endTime}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                  {slot.startTime} – {slot.endTime}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{dt("calendarSlots")}</h2>
            <p className="text-sm text-slate-500">{dt("blockSlotsHint")}</p>
          </div>
          <input type="date" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        {slotsLoading ? (
          <p className="mt-6 text-sm text-slate-500">{dt("loading")}</p>
        ) : slots.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            {dt("noSlotsYet")}
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-800">{slot.startTime} – {slot.endTime}</p>
                  <p className="text-xs text-slate-500">
                    {slot.isBooked ? dt("slotBooked") : slot.isBlocked ? dt("slotBlocked") : dt("slotAvailable")}
                  </p>
                </div>
                {!slot.isBooked && (
                  <button
                    type="button"
                    onClick={() => void blockSlot({ id: slot.id, isBlocked: !slot.isBlocked })}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {slot.isBlocked ? dt("unblockSlot") : dt("blockSlot")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <h3 className="font-semibold text-slate-900">{dt("savedRules")}</h3>
          {isLoading ? (
            <p className="mt-3 text-sm text-slate-500">{dt("loading")}</p>
          ) : availability.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">{dt("noAvailabilityConfigured")}</p>
          ) : (
            <div className="mt-3 space-y-2">
              {availability.map((row) => (
                <div key={row.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{row.dayName}</p>
                    <p className="text-slate-500">{row.startTime} – {row.endTime} · {row.consultationDurationMinutes}m + {row.breakDurationMinutes}m break</p>
                  </div>
                  <button type="button" onClick={() => void deleteAvailability(row.id)} className="text-xs font-semibold text-rose-600 hover:underline">
                    {dt("removeLabel")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
