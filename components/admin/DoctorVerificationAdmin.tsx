"use client";

import { useState } from "react";
import {
  useApproveDoctorVerificationMutation,
  useGetDoctorVerificationDetailQuery,
  useGetPendingDoctorVerificationsQuery,
  useRejectDoctorVerificationMutation,
  useRequestMoreDoctorInfoMutation,
  useSuspendDoctorVerificationMutation,
} from "@/redux/slices/doctorApi";

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-orange-100 text-orange-800",
};

export default function DoctorVerificationAdmin() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const { data: pending = [], isLoading, refetch } = useGetPendingDoctorVerificationsQuery({ status: "pending_review" });
  const { data: detail, isFetching: detailLoading } = useGetDoctorVerificationDetailQuery(selectedId ?? 0, {
    skip: !selectedId,
  });
  const [approveDoctor, { isLoading: approving }] = useApproveDoctorVerificationMutation();
  const [rejectDoctor, { isLoading: rejecting }] = useRejectDoctorVerificationMutation();
  const [suspendDoctor, { isLoading: suspending }] = useSuspendDoctorVerificationMutation();
  const [requestMoreInfo, { isLoading: requesting }] = useRequestMoreDoctorInfoMutation();

  const handleApprove = async () => {
    if (!selectedId) return;
    setMessage(null);
    try {
      await approveDoctor(selectedId).unwrap();
      setMessage("Doctor approved and activated on the platform.");
      refetch();
    } catch {
      setMessage("Could not approve doctor.");
    }
  };

  const handleReject = async () => {
    if (!selectedId || !rejectReason.trim()) return;
    setMessage(null);
    try {
      await rejectDoctor({ id: selectedId, reason: rejectReason.trim() }).unwrap();
      setMessage("Doctor application rejected.");
      setRejectReason("");
      refetch();
    } catch {
      setMessage("Could not reject doctor.");
    }
  };

  const handleSuspend = async () => {
    if (!selectedId) return;
    setMessage(null);
    try {
      await suspendDoctor({ id: selectedId, reason: adminNotes.trim() }).unwrap();
      setMessage("Doctor suspended.");
      refetch();
    } catch {
      setMessage("Could not suspend doctor.");
    }
  };

  const handleRequestMoreInfo = async () => {
    if (!selectedId || !adminNotes.trim()) return;
    setMessage(null);
    try {
      await requestMoreInfo({ id: selectedId, notes: adminNotes.trim() }).unwrap();
      setMessage("Request sent — doctor returned to draft status.");
      setAdminNotes("");
      refetch();
    } catch {
      setMessage("Could not send request.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Doctor verification</h1>
        <p className="text-sm text-slate-600 mt-1">Review pending doctor applications, documents, and activate approved profiles.</p>
      </header>

      {message && <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-800">
            Pending applications ({pending.length})
          </div>
          {isLoading ? (
            <p className="p-4 text-sm text-slate-500">Loading...</p>
          ) : pending.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No pending doctor applications.</p>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
              {pending.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${selectedId === item.id ? "bg-teal-50" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{item.clinicName}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[item.verificationStatus] ?? statusStyles.draft}`}>
                        {item.verificationStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{item.specialtyName} · {item.email}</p>
                    <p className="text-xs text-slate-500">
                      {item.documentCount} documents · {item.profileCompletionPercentage}% complete
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-4">
          {!selectedId ? (
            <p className="text-sm text-slate-500">Select an application to review details.</p>
          ) : detailLoading || !detail ? (
            <p className="text-sm text-slate-500">Loading application details...</p>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{detail.clinicName}</h2>
                <p className="text-sm text-slate-600">{detail.specialtyName} · {detail.email}</p>
                <p className="text-sm text-slate-600 mt-2">{detail.biography || "No biography provided."}</p>
                <p className="text-sm text-slate-600">Licence: {detail.licenseNumber}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">Documents</h3>
                {detail.documents.length === 0 ? (
                  <p className="text-sm text-slate-500 mt-1">No documents uploaded.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {detail.documents.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                        <span className="capitalize">{doc.documentType.replace(/_/g, " ")}</span>
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 hover:underline">
                            Download
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Rejection reason
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Required when rejecting"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Admin notes / request more info
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Internal notes or message to doctor"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approving}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={rejecting || !rejectReason.trim()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={handleRequestMoreInfo}
                  disabled={requesting || !adminNotes.trim()}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                >
                  Request more info
                </button>
                <button
                  type="button"
                  onClick={handleSuspend}
                  disabled={suspending}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                >
                  Suspend
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
