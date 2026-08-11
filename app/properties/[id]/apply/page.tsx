"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { baseAPI } from "@/services/types";
import { readAuthToken } from "@/lib/authToken";
import { useTranslation } from "@/hooks/useTranslation";
import type { PropertyApplicationDetail } from "@/types/propertyApplication";
import {
  createPropertyApplicationDraft,
  getPropertyApplication,
  patchPropertyApplication,
  PropertyApplicationApiError,
  requirementLabel,
  submitPropertyApplication,
  uploadApplicationDocument,
} from "@/services/propertyApplicationApi";

export default function PropertyApplyPage() {
  const params = useParams();
  const propertyId = Number(params?.id);
  const router = useRouter();
  const { t, languageCode } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [app, setApp] = useState<PropertyApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fileByType, setFileByType] = useState<Record<string, File | null>>({});
  const [allowedLeaseMonths, setAllowedLeaseMonths] = useState<number[]>([6, 12]);

  const loginHref = `/LoginScreenUser?next=${encodeURIComponent(`/properties/${propertyId}/apply`)}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;
    const loadLeaseMonths = async () => {
      try {
        const res = await fetch(`${baseAPI}/properties/${propertyId}/`, {
          headers: { Accept: "application/json" },
        });
        const data: unknown = await res.json().catch(() => ({}));
        if (!res.ok || cancelled || !data || typeof data !== "object") return;
        const row = data as { allowed_lease_months?: unknown; purpose?: string };
        if (row.purpose && row.purpose !== "rent") {
          router.replace(`/properties/${propertyId}`);
          return;
        }
        const months = Array.isArray(row.allowed_lease_months)
          ? row.allowed_lease_months
              .map((item) => Number(item))
              .filter((item) => Number.isFinite(item) && item > 0)
          : [];
        if (months.length > 0 && !cancelled) {
          setAllowedLeaseMonths(months);
        }
      } catch {
        /* keep defaults */
      }
    };
    void loadLeaseMonths();
    return () => {
      cancelled = true;
    };
  }, [propertyId, router]);

  const createDraft = useCallback(async () => {
    if (!readAuthToken()) {
      router.replace(loginHref);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createPropertyApplicationDraft(propertyId);
      const detail = await getPropertyApplication(created.id);
      setApp(detail);
    } catch (err) {
      setError(
        err instanceof PropertyApplicationApiError
          ? err.message
          : t("applicationSubmitFailed"),
      );
    } finally {
      setBusy(false);
    }
  }, [loginHref, propertyId, router, t]);

  useEffect(() => {
    if (!mounted) return;
    void createDraft();
  }, [createDraft, mounted]);

  useEffect(() => {
    setApp((current) => {
      if (!current || allowedLeaseMonths.length === 0) return current;
      if (allowedLeaseMonths.includes(Number(current.rental_period_months))) return current;
      return { ...current, rental_period_months: allowedLeaseMonths[0] ?? 12 };
    });
  }, [allowedLeaseMonths]);

  const steps = useMemo(
    () => [
      t("applicationPersonalTitle"),
      t("applicationPreferencesTitle"),
      t("requiredDocuments"),
      t("applicationDetails"),
    ],
    [t],
  );

  const onContinue = async () => {
    if (!app) return;
    setBusy(true);
    setError(null);
    try {
      if (step === 0) {
        if (!app.full_name || !app.email || !app.phone) {
          throw new Error(t("requiredApplicationFields"));
        }
        const updated = await patchPropertyApplication(app.id, {
          full_name: app.full_name,
          email: app.email,
          phone: app.phone,
          date_of_birth: app.date_of_birth,
          nationality: app.nationality,
          current_address: app.current_address,
          employment_status: app.employment_status,
          occupation: app.occupation,
        });
        setApp({ ...app, ...updated });
      } else if (step === 1) {
        if (!app.move_in_date) throw new Error(t("requiredApplicationFields"));
        const updated = await patchPropertyApplication(app.id, {
          move_in_date: app.move_in_date,
          rental_period_months: app.rental_period_months || 12,
          adults: app.adults || 1,
          children: app.children || 0,
          has_pets: app.has_pets,
          pet_details: app.pet_details,
          additional_notes: app.additional_notes,
          preferred_lease_language: app.preferred_lease_language || languageCode,
        });
        setApp({ ...app, ...updated });
      } else if (step === 2) {
        for (const [docType, file] of Object.entries(fileByType)) {
          if (!file) continue;
          await uploadApplicationDocument(app.id, docType, file);
        }
        const detail = await getPropertyApplication(app.id);
        setApp(detail);
      } else if (step === 3) {
        await submitPropertyApplication(app.id);
        router.push(`/UserDashboard?menu=properties`);
        return;
      }
      setStep((s) => Math.min(s + 1, 3));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("applicationSubmitFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center text-slate-600">
        {t("loading")}
      </div>
    );
  }

  if (!readAuthToken()) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <p className="mb-4">{t("applicationLoginRequired")}</p>
        <Link className="rounded-xl bg-teal-700 px-4 py-2 text-white" href={loginHref}>
          {t("login")}
        </Link>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center text-slate-600">
        {busy ? t("loading") : error || t("loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/properties/${propertyId}`} className="text-sm text-teal-700">
        ← {t("back")}
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">{t("propertyApplication")}</h1>
      <p className="text-sm text-slate-500">
        {t("applicationStep", undefined, { current: step + 1, total: 4 })} — {steps[step]}
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 0 && (
          <>
            {(
              [
                ["full_name", t("fullName")],
                ["email", "Email"],
                ["phone", t("Phone", "Phone")],
                ["date_of_birth", t("dateOfBirth")],
                ["nationality", t("nationality")],
                ["current_address", t("currentAddress")],
                ["employment_status", t("employmentStatus")],
                ["occupation", t("occupation")],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  value={String(app[key] ?? "")}
                  onChange={(e) => setApp({ ...app, [key]: e.target.value })}
                />
              </label>
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <label className="block text-sm">
              <span className="font-medium">{t("moveInDate")}</span>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={app.move_in_date || ""}
                onChange={(e) => setApp({ ...app, move_in_date: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t("rentalPeriod")}</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {allowedLeaseMonths.map((months) => {
                  const active = Number(app.rental_period_months) === months;
                  return (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setApp({ ...app, rental_period_months: months })}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 ${
                        active
                          ? "bg-teal-700 text-white ring-teal-700"
                          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t("monthsLabel", "{n} months", { n: months })}
                    </button>
                  );
                })}
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-medium">{t("adults")}</span>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={app.adults}
                  onChange={(e) => setApp({ ...app, adults: Number(e.target.value) || 1 })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">{t("children")}</span>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={app.children}
                  onChange={(e) => setApp({ ...app, children: Number(e.target.value) || 0 })}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={app.has_pets}
                onChange={(e) => setApp({ ...app, has_pets: e.target.checked })}
              />
              {t("pets")}
            </label>
            {app.has_pets && (
              <input
                className="w-full rounded-xl border px-3 py-2"
                placeholder={t("petDetails")}
                value={app.pet_details}
                onChange={(e) => setApp({ ...app, pet_details: e.target.value })}
              />
            )}
            <textarea
              className="w-full rounded-xl border px-3 py-2"
              rows={3}
              placeholder={t("additionalNotes")}
              value={app.additional_notes}
              onChange={(e) => setApp({ ...app, additional_notes: e.target.value })}
            />
            <label className="block text-sm">
              <span className="font-medium">{t("leaseLanguage")}</span>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={app.preferred_lease_language || languageCode}
                onChange={(e) => setApp({ ...app, preferred_lease_language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </label>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {(app.requirements || []).length === 0 ? (
              <p className="text-sm text-slate-500">{t("noDocumentsRequired")}</p>
            ) : (
              (app.requirements || []).map((req) => (
                <label key={req.document_type} className="block rounded-xl border p-3 text-sm">
                  <span className="font-semibold">
                    {requirementLabel(req, languageCode)}
                    {req.is_required ? " *" : ""}
                  </span>
                  <input
                    type="file"
                    className="mt-2 block w-full"
                    onChange={(e) =>
                      setFileByType((prev) => ({
                        ...prev,
                        [req.document_type]: e.target.files?.[0] || null,
                      }))
                    }
                  />
                </label>
              ))
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <strong>{t("fullName")}:</strong> {app.full_name}
            </p>
            <p>
              <strong>Email:</strong> {app.email}
            </p>
            <p>
              <strong>{t("moveInDate")}:</strong> {app.move_in_date}
            </p>
            <p>
              <strong>{t("rentalPeriod")}:</strong> {app.rental_period_months}
            </p>
            <p>
              <strong>{t("leaseLanguage")}:</strong> {app.preferred_lease_language}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-rose-700">{error}</p>}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            disabled={step === 0 || busy}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40"
          >
            {t("back")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onContinue()}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy
              ? t("loading")
              : step === 3
                ? t("submitApplication")
                : t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
