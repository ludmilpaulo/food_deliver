"use client";

import { useMemo, useRef, useState } from "react";
import type { DoctorDocumentType, DoctorVerificationStatusResponse } from "@/types/doctor";
import { REQUIRED_DOCTOR_DOCUMENTS } from "@/types/doctor";
import DoctorProfilePanel from "@/components/doctor/DoctorProfilePanel";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";
import { verificationStatusLabel, type DoctorTranslationKey } from "@/configs/doctorTranslations";
import {
  useDeleteDoctorDocumentMutation,
  useGetDoctorDocumentsQuery,
  useGetDoctorProfileQuery,
  useSubmitDoctorForReviewMutation,
  useUpdateDoctorProfileMutation,
  useUploadDoctorDocumentMutation,
} from "@/redux/slices/doctorApi";

const statusBadgeStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-orange-100 text-orange-800",
};

type Props = {
  verification: DoctorVerificationStatusResponse;
  clinicName?: string;
};

export default function DoctorVerificationRequired({ verification, clinicName }: Props) {
  const { dt, languageCode } = useDoctorTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DoctorDocumentType>("id_document");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: documents = [] } = useGetDoctorDocumentsQuery();
  const { data: profile } = useGetDoctorProfileQuery();
  const [uploadDocument, { isLoading: uploading }] = useUploadDoctorDocumentMutation();
  const [deleteDocument] = useDeleteDoctorDocumentMutation();
  const [submitForReview, { isLoading: submitting }] = useSubmitDoctorForReviewMutation();
  const [updateProfile] = useUpdateDoctorProfileMutation();

  const uploadedTypes = useMemo(
    () => new Set(documents.map((doc) => doc.documentType)),
    [documents],
  );

  const docTypeLabel = (type: DoctorDocumentType) => {
    const found = REQUIRED_DOCTOR_DOCUMENTS.find((d) => d.type === type);
    return found ? dt(found.labelKey as DoctorTranslationKey) : dt("docOther");
  };

  const steps = useMemo(
    () => [
      { key: "profile", label: dt("profile"), done: verification.profileCompletionPercentage >= 60 },
      ...REQUIRED_DOCTOR_DOCUMENTS.map((item) => ({
        key: item.type,
        label: `${dt("uploadDocuments")}: ${dt(item.labelKey as DoctorTranslationKey)}`,
        done: uploadedTypes.has(item.type),
      })),
      {
        key: "submit",
        label: dt("submitForReview"),
        done: verification.verificationStatus === "pending_review" || verification.verificationStatus === "approved",
      },
    ],
    [uploadedTypes, verification, dt],
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setMessage(null);
    try {
      await uploadDocument({ documentType: selectedDocType, file }).unwrap();
      setMessage(dt("success"));
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      setError(detail || dt("error"));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmitForReview = async () => {
    setError(null);
    setMessage(null);
    try {
      await submitForReview().unwrap();
      setMessage(dt("success"));
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      setError(detail || dt("error"));
    }
  };

  const handleQuickProfileSave = async () => {
    if (!profile) return;
    setError(null);
    try {
      await updateProfile({
        clinicName: profile.clinicName || clinicName,
        biography: profile.biography || "Experienced healthcare provider.",
        licenseNumber: profile.licenseNumber === "PENDING" ? "LIC-PENDING-UPDATE" : profile.licenseNumber,
        yearsExperience: profile.yearsExperience || 1,
      }).unwrap();
      setMessage(dt("profileUpdated"));
    } catch {
      setError(dt("error"));
    }
  };

  const badgeClass = statusBadgeStyles[verification.verificationStatus] ?? statusBadgeStyles.draft;

  if (showProfileEditor) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
          <button
            type="button"
            onClick={() => setShowProfileEditor(false)}
            className="text-sm font-semibold text-teal-700 hover:underline"
          >
            ← {dt("backToVerification")}
          </button>
          <DoctorProfilePanel />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-teal-50/30">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <header className="text-center space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{dt("healthcarePartner")}</p>
          <h1 className="text-3xl font-bold text-slate-900">{dt("verificationRequired")}</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            {dt("verificationGateMessage")}
          </p>
          <span className={`inline-flex rounded-full px-4 py-1 text-sm font-semibold ${badgeClass}`}>
            {verificationStatusLabel(verification.verificationStatus, languageCode)}
          </span>
        </header>

        {verification.verificationStatus === "pending_review" && (
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <p className="font-semibold">{dt("statusPendingReview")}</p>
            <p className="mt-1 text-sm">{dt("underReviewMessage")}</p>
          </article>
        )}

        {verification.verificationStatus === "rejected" && (
          <article className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
            <p className="font-semibold">{dt("profileRejected")}</p>
            <p className="mt-1 text-sm">
              {verification.rejectionReason || dt("adminFeedback")}
            </p>
          </article>
        )}

        {verification.verificationStatus === "suspended" && (
          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-900">
            <p className="font-semibold">{dt("statusSuspended")}</p>
            <p className="mt-1 text-sm">{dt("suspendedMessage")}</p>
          </article>
        )}

        {verification.adminNotes && (
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-900">{dt("adminFeedback")}</p>
            <p className="mt-1 text-sm text-slate-600">{verification.adminNotes}</p>
          </article>
        )}

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">{dt("verificationProgress")}</h2>
            <span className="text-sm font-semibold text-teal-700">
              {verification.profileCompletionPercentage}% · {dt("profileCompletionLabel")}
            </span>
          </div>
          <ol className="mt-5 space-y-3">
            {steps.map((step, index) => (
              <li key={step.key} className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.done ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {step.done ? "✓" : index + 1}
                </span>
                <span className={`text-sm ${step.done ? "text-slate-500 line-through" : "text-slate-800 font-medium"}`}>{step.label}</span>
              </li>
            ))}
          </ol>
          {verification.profileCompletionPercentage < 60 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowProfileEditor(true)} className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800">
                {dt("openProfileEditor")}
              </button>
              <button type="button" onClick={handleQuickProfileSave} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
                {dt("saveProfileBasics")}
              </button>
            </div>
          )}
        </article>

        {(verification.verificationStatus === "draft" || verification.verificationStatus === "rejected") && (
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{dt("uploadDocuments")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                {dt("selectDocumentType")}
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as DoctorDocumentType)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {REQUIRED_DOCTOR_DOCUMENTS.map((item) => (
                    <option key={item.type} value={item.type}>{dt(item.labelKey as DoctorTranslationKey)}</option>
                  ))}
                  <option value="other">{dt("docOther")}</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                {dt("fileLabel")}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            {documents.length > 0 && (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{doc.originalFilename || doc.documentType}</p>
                      <p className="text-slate-500">{docTypeLabel(doc.documentType)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-teal-700 font-semibold hover:underline">
                          {dt("viewDocument")}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteDocument(doc.id)}
                        className="text-red-600 font-semibold hover:underline"
                      >
                        {dt("removeLabel")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {verification.canSubmitForReview && (
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={submitting}
                className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {submitting ? dt("loading") : dt("submitForReview")}
              </button>
            )}
          </article>
        )}

        {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      </div>
    </main>
  );
}
