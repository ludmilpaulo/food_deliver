"use client";



import { useEffect, useMemo, useState } from "react";

import { useDispatch } from "react-redux";

import VehicleConfigurationCard from "@/features/admin/drivers/components/VehicleConfigurationCard";

import {

  AlertCircle,

  Car,

  CheckCircle2,

  Clock,

  ExternalLink,

  FileText,

  ShieldCheck,

  User,

  XCircle,

} from "lucide-react";

import {

  adminDriverApi,

  useApproveDriverPersonalDocumentMutation,

  useApproveDriverVehicleDocumentMutation,

  useApproveDriverVehicleMutation,

  useApproveDriverVerificationMutation,

  useGetDriverVerificationDetailQuery,

  useGetExpiredDriverDocumentsQuery,

  useGetPendingDriverVerificationsQuery,

  useMarkDriverExpiredDocumentsMutation,

  useReactivateDriverVerificationMutation,

  useRejectDriverPersonalDocumentMutation,

  useRejectDriverVehicleDocumentMutation,

  useRejectDriverVehicleMutation,

  useRejectDriverVerificationMutation,

  useSuspendDriverVerificationMutation,

} from "@/redux/slices/driverAdminApi";

import { adminDriversOperationsApi } from "@/redux/slices/adminDriversOperationsApi";

import type { AdminDriverDocument, AdminDriverListItem, AdminDriverVerificationDetail } from "@/types/driver";

import {

  PERSONAL_DOCUMENT_LABELS,

  REQUIRED_PERSONAL_DOCUMENT_TYPES,

  REQUIRED_VEHICLE_DOCUMENT_TYPES,

  VEHICLE_DOCUMENT_LABELS,

} from "@/types/driver";



type ListFilter =
  | "queue"
  | "pending_verification"
  | "draft"
  | "expired_documents"
  | "expired"
  | "has_uploads"
  | "all";



type DocumentSlot = {

  type: string;

  label: string;

  doc: AdminDriverDocument | null;

  required: boolean;

};



type DocRejectTarget = {

  docId: number;

  isVehicle: boolean;

  label: string;

};



const statusStyles: Record<string, string> = {

  draft: "bg-slate-100 text-slate-700 ring-slate-200",

  pending_verification: "bg-amber-50 text-amber-800 ring-amber-200",

  pending_review: "bg-amber-50 text-amber-800 ring-amber-200",

  pending: "bg-amber-50 text-amber-800 ring-amber-200",

  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",

  rejected: "bg-red-50 text-red-800 ring-red-200",

  suspended: "bg-orange-50 text-orange-800 ring-orange-200",

  expired_documents: "bg-purple-50 text-purple-800 ring-purple-200",

};



function formatStatus(status: string) {

  return status.replace(/_/g, " ");

}



function isImageDoc(doc: AdminDriverDocument | null, type: string) {

  if (!doc?.fileUrl) return type.startsWith("photo_") || type === "profile_photo";

  const lower = doc.fileUrl.toLowerCase();

  return (

    type.startsWith("photo_") ||

    type === "profile_photo" ||

    /\.(jpe?g|png|gif|webp)(\?|$)/i.test(lower)

  );

}



function isPdfDoc(doc: AdminDriverDocument | null) {

  if (!doc?.fileUrl) return false;

  return doc.fileUrl.toLowerCase().includes(".pdf");

}



function buildDocumentSlots(

  requiredTypes: readonly string[],

  uploaded: AdminDriverDocument[],

  labelMap: Record<string, string>,

): DocumentSlot[] {

  const byType = new Map(uploaded.map((d) => [d.documentType, d]));

  const slots: DocumentSlot[] = requiredTypes.map((type) => ({

    type,

    label: labelMap[type] ?? type.replace(/_/g, " "),

    doc: byType.get(type) ?? null,

    required: true,

  }));



  for (const doc of uploaded) {

    if (!requiredTypes.includes(doc.documentType as (typeof requiredTypes)[number])) {

      slots.push({

        type: doc.documentType,

        label: doc.documentTypeLabel || labelMap[doc.documentType] || doc.documentType,

        doc,

        required: false,

      });

    }

  }

  return slots;

}



function StatusBadge({ status }: { status: string }) {

  return (

    <span

      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${

        statusStyles[status] ?? statusStyles.draft

      }`}

    >

      {formatStatus(status)}

    </span>

  );

}



function ProgressRing({ value }: { value: number }) {

  const clamped = Math.min(100, Math.max(0, value));

  const radius = 28;

  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (clamped / 100) * circumference;



  return (

    <div className="relative h-16 w-16 shrink-0">

      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">

        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="6" />

        <circle

          cx="32"

          cy="32"

          r={radius}

          fill="none"

          stroke="#4f46e5"

          strokeWidth="6"

          strokeLinecap="round"

          strokeDasharray={circumference}

          strokeDashoffset={offset}

        />

      </svg>

      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">

        {clamped}%

      </span>

    </div>

  );

}



function DocumentPreview({ doc, type }: { doc: AdminDriverDocument | null; type: string }) {

  if (!doc?.fileUrl) {

    return (

      <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">

        <FileText className="h-8 w-8 opacity-40" />

        <span className="text-xs font-medium">Not uploaded</span>

      </div>

    );

  }



  if (isImageDoc(doc, type)) {

    return (

      // eslint-disable-next-line @next/next/no-img-element

      <img

        src={doc.fileUrl}

        alt={doc.documentTypeLabel}

        className="h-full min-h-[140px] w-full object-cover"

      />

    );

  }



  if (isPdfDoc(doc)) {

    return (

      <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 bg-red-50 text-red-700">

        <FileText className="h-10 w-10" />

        <span className="text-xs font-semibold">PDF document</span>

      </div>

    );

  }



  return (

    <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 bg-indigo-50 text-indigo-700">

      <FileText className="h-10 w-10" />

      <span className="max-w-[90%] truncate text-xs font-medium">{doc.originalFilename || "Document"}</span>

    </div>

  );

}



function DocumentCard({

  slot,

  driverId,

  onRejectRequest,

  onActionDone,

  onActionError,

}: {

  slot: DocumentSlot;

  driverId: number;

  onRejectRequest: (target: DocRejectTarget) => void;

  onActionDone: (message: string) => void;

  onActionError: (message: string) => void;

}) {

  const { doc, label, type, required } = slot;

  const isVehicle = type in VEHICLE_DOCUMENT_LABELS || type.startsWith("photo_");

  const [approvePersonal, { isLoading: approvingPersonal }] = useApproveDriverPersonalDocumentMutation();

  const [approveVehicle, { isLoading: approvingVehicle }] = useApproveDriverVehicleDocumentMutation();



  const isPending = doc?.verificationStatus === "pending" || doc?.verificationStatus === "pending_review";

  const isApproving = approvingPersonal || approvingVehicle;



  const handleApprove = async () => {

    if (!doc) return;

    try {

      if (isVehicle) {

        await approveVehicle({ driverId, docId: doc.id }).unwrap();

      } else {

        await approvePersonal({ driverId, docId: doc.id }).unwrap();

      }

      onActionDone(`${label} approved.`);

    } catch {

      onActionError(`Could not approve ${label.toLowerCase()}.`);

    }

  };



  return (

    <article

      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${

        doc ? "border-slate-200" : required ? "border-dashed border-slate-300" : "border-slate-200"

      }`}

    >

      <div className="overflow-hidden rounded-t-xl border-b border-slate-100">

        <DocumentPreview doc={doc} type={type} />

      </div>



      <div className="space-y-3 p-4">

        <div className="flex items-start justify-between gap-2">

          <div>

            <p className="text-sm font-semibold text-slate-900">{label}</p>

            <p className="mt-0.5 text-xs text-slate-500">

              {required ? "Required" : "Optional"}

              {doc?.uploadedAt ? ` · ${new Date(doc.uploadedAt).toLocaleDateString()}` : ""}

            </p>

          </div>

          {doc ? <StatusBadge status={doc.verificationStatus} /> : (

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Missing</span>

          )}

        </div>



        {doc?.expiryDate && (

          <p className="flex items-center gap-1 text-xs text-slate-600">

            <Clock className="h-3.5 w-3.5" />

            Expires {new Date(doc.expiryDate).toLocaleDateString()}

          </p>

        )}



        {doc?.rejectionReason && (

          <p className="rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">{doc.rejectionReason}</p>

        )}



        {doc?.fileUrl && (

          <a

            href={doc.fileUrl}

            target="_blank"

            rel="noreferrer"

            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"

          >

            <ExternalLink className="h-3.5 w-3.5" />

            Open full size

          </a>

        )}



        {doc && isPending && (

          <div className="flex gap-2 pt-1">

            <button

              type="button"

              disabled={isApproving}

              onClick={handleApprove}

              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"

            >

              <CheckCircle2 className="h-3.5 w-3.5" />

              Approve

            </button>

            <button

              type="button"

              onClick={() => onRejectRequest({ docId: doc.id, isVehicle, label })}

              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"

            >

              <XCircle className="h-3.5 w-3.5" />

              Reject

            </button>

          </div>

        )}

      </div>

    </article>

  );

}



function DriverListItem({

  item,

  selected,

  onSelect,

}: {

  item: AdminDriverListItem;

  selected: boolean;

  onSelect: () => void;

}) {

  return (

    <button

      type="button"

      onClick={onSelect}

      className={`w-full px-4 py-3.5 text-left transition ${

        selected ? "bg-indigo-50 ring-1 ring-inset ring-indigo-200" : "hover:bg-slate-50"

      }`}

    >

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="truncate font-semibold text-slate-900">{item.fullName}</p>

          <p className="truncate text-xs text-slate-500">{item.email}</p>
        {item.username && item.username !== item.email ? (
          <p className="truncate text-xs text-slate-400">Login: {item.username}</p>
        ) : null}

        </div>

        <StatusBadge status={item.verificationStatus} />

      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">

        <span className="inline-flex items-center gap-1">

          <Car className="h-3.5 w-3.5" />

          {formatStatus(item.vehicleVerificationStatus)}

        </span>

        <span>·</span>

        <span>{item.documentCount} docs</span>
        {item.documentCount > 0 ? (
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
            HAS UPLOADS
          </span>
        ) : null}

        <span>·</span>

        <span>{item.profileCompletionPercentage}% complete</span>

      </div>

      {item.submittedForReviewAt && (

        <p className="mt-1 text-xs text-slate-400">

          Submitted {new Date(item.submittedForReviewAt).toLocaleString()}

        </p>

      )}

    </button>

  );

}



function DriverDetailPanel({

  detail,

  selectedId,

  onMessage,

}: {

  detail: AdminDriverVerificationDetail;

  selectedId: number;

  onMessage: (message: string | null, isError?: boolean) => void;

}) {

  const [activeTab, setActiveTab] = useState<"personal" | "vehicle">("personal");

  const [rejectReason, setRejectReason] = useState("");

  const [suspendReason, setSuspendReason] = useState("");

  const [vehicleRejectReason, setVehicleRejectReason] = useState("");

  const [docRejectTarget, setDocRejectTarget] = useState<DocRejectTarget | null>(null);

  const [docRejectReason, setDocRejectReason] = useState("");

  const dispatch = useDispatch();



  const [approveDriver, { isLoading: approving }] = useApproveDriverVerificationMutation();

  const [approveVehicle, { isLoading: approvingVehicle }] = useApproveDriverVehicleMutation();

  const [rejectDriver, { isLoading: rejecting }] = useRejectDriverVerificationMutation();

  const [suspendDriver, { isLoading: suspending }] = useSuspendDriverVerificationMutation();

  const [reactivateDriver, { isLoading: reactivating }] = useReactivateDriverVerificationMutation();

  const [rejectVehicle, { isLoading: rejectingVehicle }] = useRejectDriverVehicleMutation();

  const [markExpired, { isLoading: markingExpired }] = useMarkDriverExpiredDocumentsMutation();

  const [rejectPersonalDoc, { isLoading: rejectingPersonalDoc }] = useRejectDriverPersonalDocumentMutation();

  const [rejectVehicleDoc, { isLoading: rejectingVehicleDoc }] = useRejectDriverVehicleDocumentMutation();



  const personalSlots = useMemo(

    () => buildDocumentSlots(REQUIRED_PERSONAL_DOCUMENT_TYPES, detail.personalDocuments, PERSONAL_DOCUMENT_LABELS),

    [detail.personalDocuments],

  );



  const vehicleSlots = useMemo(

    () =>

      buildDocumentSlots(

        REQUIRED_VEHICLE_DOCUMENT_TYPES,

        detail.vehicle?.documents ?? [],

        VEHICLE_DOCUMENT_LABELS,

      ),

    [detail.vehicle?.documents],

  );

  function handleVehicleSaved(message = "Vehicle configuration saved.") {
    dispatch(adminDriverApi.util.invalidateTags(["AdminDriverVerification"]));
    dispatch(adminDriversOperationsApi.util.invalidateTags(["DriverOps", "DriverVehicle"]));
    onMessage(message, false);
  }



  const profilePhoto = detail.personalDocuments.find((d) => d.documentType === "profile_photo");



  const runAction = async (action: () => Promise<unknown>, success: string, failure: string) => {

    onMessage(null);

    try {

      await action();

      onMessage(success);

    } catch {

      onMessage(failure, true);

    }

  };



  const handleDocReject = async () => {

    if (!docRejectTarget || !docRejectReason.trim()) return;

    onMessage(null);

    try {

      if (docRejectTarget.isVehicle) {

        await rejectVehicleDoc({

          driverId: selectedId,

          docId: docRejectTarget.docId,

          reason: docRejectReason.trim(),

        }).unwrap();

      } else {

        await rejectPersonalDoc({

          driverId: selectedId,

          docId: docRejectTarget.docId,

          reason: docRejectReason.trim(),

        }).unwrap();

      }

      onMessage(`${docRejectTarget.label} rejected.`);

      setDocRejectTarget(null);

      setDocRejectReason("");

    } catch {

      onMessage("Could not reject document.", true);

    }

  };



  return (

    <div className="flex flex-col gap-6">

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-lg">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10">

            {profilePhoto?.fileUrl ? (

              // eslint-disable-next-line @next/next/no-img-element

              <img src={profilePhoto.fileUrl} alt="" className="h-full w-full object-cover" />

            ) : (

              <div className="flex h-full w-full items-center justify-center">

                <User className="h-10 w-10 text-white/60" />

              </div>

            )}

          </div>

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <h2 className="text-2xl font-bold">{detail.fullName}</h2>

              <StatusBadge status={detail.verificationStatus} />

              {detail.vehicle && <StatusBadge status={detail.vehicle.verificationStatus} />}

            </div>

            <p className="mt-1 text-sm text-slate-300">{detail.email}</p>

            <p className="mt-1 text-sm text-slate-400">

              {detail.phone || "No phone"} · {detail.address || "No address"}

            </p>

          </div>

          <ProgressRing value={detail.verification.profileCompletionPercentage} />

        </div>



        {detail.verification.canOperate && (

          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-100">

            <ShieldCheck className="h-4 w-4" />

            Driver can operate on the platform

          </p>

        )}

      </div>

      {detail.personalDocuments.length === 0 &&
        (detail.vehicle?.documents.length ?? 0) === 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">No documents on this driver account</p>
            <p className="mt-1">
              Uploads are tied to the login email used in KudyaParceiro. If documents were uploaded on a phone,
              check the <strong>Has uploads</strong> filter — they may be under a different email (e.g. a newly
              registered partner account).
            </p>
          </div>
        )}

      {(detail.rejectionReason || detail.suspensionReason || detail.adminNotes) && (

        <div className="grid gap-3 sm:grid-cols-2">

          {detail.rejectionReason && (

            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">

              <p className="font-semibold">Rejection reason</p>

              <p className="mt-1">{detail.rejectionReason}</p>

            </div>

          )}

          {detail.suspensionReason && (

            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">

              <p className="font-semibold">Suspension reason</p>

              <p className="mt-1">{detail.suspensionReason}</p>

            </div>

          )}

          {detail.adminNotes && (

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:col-span-2">

              <p className="font-semibold">Admin notes</p>

              <p className="mt-1">{detail.adminNotes}</p>

            </div>

          )}

        </div>

      )}



      <VehicleConfigurationCard
        driverId={selectedId}
        driverName={detail.fullName}
        countryId={detail.countryId ?? undefined}
        onSaved={() => handleVehicleSaved()}
      />



      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex border-b border-slate-100">

          <button

            type="button"

            onClick={() => setActiveTab("personal")}

            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${

              activeTab === "personal"

                ? "border-b-2 border-indigo-600 text-indigo-700"

                : "text-slate-500 hover:text-slate-800"

            }`}

          >

            Personal documents ({personalSlots.filter((s) => s.doc).length}/{personalSlots.length})

          </button>

          <button

            type="button"

            onClick={() => setActiveTab("vehicle")}

            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${

              activeTab === "vehicle"

                ? "border-b-2 border-indigo-600 text-indigo-700"

                : "text-slate-500 hover:text-slate-800"

            }`}

          >

            Vehicle documents ({vehicleSlots.filter((s) => s.doc).length}/{vehicleSlots.length})

          </button>

        </div>



        <div className="p-5">

          {activeTab === "personal" && detail.verification.missingPersonalLabels.length > 0 && (

            <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">

              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <p>

                Missing: {detail.verification.missingPersonalLabels.join(", ")}

              </p>

            </div>

          )}

          {activeTab === "vehicle" && detail.verification.missingVehicleLabels.length > 0 && (

            <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">

              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <p>

                Missing: {detail.verification.missingVehicleLabels.join(", ")}

              </p>

            </div>

          )}



          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {(activeTab === "personal" ? personalSlots : vehicleSlots).map((slot) => (

              <DocumentCard

                key={slot.type}

                slot={slot}

                driverId={selectedId}

                onRejectRequest={setDocRejectTarget}

                onActionDone={(msg) => onMessage(msg)}

                onActionError={(msg) => onMessage(msg, true)}

              />

            ))}

          </div>

        </div>

      </section>



      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <h3 className="text-lg font-bold text-slate-900">Review actions</h3>

        <p className="mt-1 text-sm text-slate-600">

          Approve the driver profile and vehicle separately. Reject or suspend with a clear reason.

        </p>



        <div className="mt-4 grid gap-4 lg:grid-cols-2">

          <label className="block text-sm font-medium text-slate-700">

            Rejection reason (driver)

            <textarea

              value={rejectReason}

              onChange={(e) => setRejectReason(e.target.value)}

              rows={2}

              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

              placeholder="Required when rejecting the driver application"

            />

          </label>

          <label className="block text-sm font-medium text-slate-700">

            Suspension reason

            <textarea

              value={suspendReason}

              onChange={(e) => setSuspendReason(e.target.value)}

              rows={2}

              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

              placeholder="Required when suspending"

            />

          </label>

          <label className="block text-sm font-medium text-slate-700 lg:col-span-2">

            Vehicle rejection reason

            <textarea

              value={vehicleRejectReason}

              onChange={(e) => setVehicleRejectReason(e.target.value)}

              rows={2}

              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

              placeholder="Required when rejecting the vehicle"

            />

          </label>

        </div>



        <div className="mt-5 flex flex-wrap gap-2">

          <button

            type="button"

            disabled={approving}

            onClick={() =>

              runAction(

                () => approveDriver(selectedId).unwrap(),

                "Driver profile approved.",

                "Could not approve driver.",

              )

            }

            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"

          >

            <CheckCircle2 className="h-4 w-4" />

            Approve driver

          </button>

          <button

            type="button"

            disabled={approvingVehicle}

            onClick={() =>

              runAction(

                () => approveVehicle(selectedId).unwrap(),

                "Vehicle approved.",

                "Could not approve vehicle.",

              )

            }

            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"

          >

            <Car className="h-4 w-4" />

            Approve vehicle

          </button>

          <button

            type="button"

            disabled={rejecting || !rejectReason.trim()}

            onClick={() =>

              runAction(

                () => rejectDriver({ id: selectedId, reason: rejectReason.trim() }).unwrap(),

                "Driver application rejected.",

                "Could not reject driver.",

              )

            }

            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"

          >

            <XCircle className="h-4 w-4" />

            Reject driver

          </button>

          <button

            type="button"

            disabled={rejectingVehicle || !vehicleRejectReason.trim()}

            onClick={() =>

              runAction(

                () => rejectVehicle({ id: selectedId, reason: vehicleRejectReason.trim() }).unwrap(),

                "Vehicle rejected.",

                "Could not reject vehicle.",

              )

            }

            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"

          >

            Reject vehicle

          </button>

          <button

            type="button"

            disabled={suspending || !suspendReason.trim()}

            onClick={() =>

              runAction(

                () => suspendDriver({ id: selectedId, reason: suspendReason.trim() }).unwrap(),

                "Driver suspended.",

                "Could not suspend driver.",

              )

            }

            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"

          >

            Suspend

          </button>

          <button

            type="button"

            disabled={reactivating}

            onClick={() =>

              runAction(

                () => reactivateDriver(selectedId).unwrap(),

                "Driver reactivated.",

                "Could not reactivate driver.",

              )

            }

            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"

          >

            Reactivate

          </button>

          <button

            type="button"

            disabled={markingExpired}

            onClick={() =>

              runAction(

                () => markExpired(selectedId).unwrap(),

                "Marked as expired documents.",

                "Could not update expired status.",

              )

            }

            className="inline-flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-800 hover:bg-purple-100 disabled:opacity-50"

          >

            Mark expired docs

          </button>

        </div>

      </section>



      {docRejectTarget && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <h4 className="text-lg font-bold text-slate-900">Reject document</h4>

            <p className="mt-1 text-sm text-slate-600">{docRejectTarget.label}</p>

            <textarea

              value={docRejectReason}

              onChange={(e) => setDocRejectReason(e.target.value)}

              rows={3}

              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"

              placeholder="Reason for rejection (required)"

            />

            <div className="mt-4 flex justify-end gap-2">

              <button

                type="button"

                onClick={() => {

                  setDocRejectTarget(null);

                  setDocRejectReason("");

                }}

                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"

              >

                Cancel

              </button>

              <button

                type="button"

                disabled={!docRejectReason.trim() || rejectingPersonalDoc || rejectingVehicleDoc}

                onClick={handleDocReject}

                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"

              >

                Reject document

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}



export default function DriverVerificationAdmin() {

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [listFilter, setListFilter] = useState<ListFilter>("queue");

  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);



  const pendingQueryArgs =
    listFilter === "has_uploads"
      ? { status: "all", hasDocuments: true }
      : listFilter === "all"
        ? { status: "all" }
        : listFilter === "queue"
          ? {}
          : listFilter === "expired"
            ? { status: "all" }
            : { status: listFilter };

  const { data: pending = [], isLoading, refetch } = useGetPendingDriverVerificationsQuery(pendingQueryArgs, {
    skip: listFilter === "expired",
  });

  const { data: expiredList = [], isLoading: expiredLoading } = useGetExpiredDriverDocumentsQuery(undefined, {

    skip: listFilter !== "expired",

  });



  const list = listFilter === "expired" ? expiredList : pending;

  useEffect(() => {
    if (list.length === 0) return;
    const best = [...list].sort((a, b) => b.documentCount - a.documentCount)[0];
    if (!selectedId || !list.some((item) => item.id === selectedId)) {
      setSelectedId(best.documentCount > 0 ? best.id : list[0].id);
    }
  }, [list, selectedId]);

  const { data: detail, isFetching: detailLoading } = useGetDriverVerificationDetailQuery(selectedId ?? 0, {

    skip: !selectedId,

  });



  const filters: { key: ListFilter; label: string }[] = [
    { key: "queue", label: "All in queue" },
    { key: "has_uploads", label: "Has uploads" },
    { key: "all", label: "All drivers" },
    { key: "pending_verification", label: "Pending review" },
    { key: "draft", label: "Draft" },
    { key: "expired_documents", label: "Expired status" },
    { key: "expired", label: "Expired docs" },
  ];



  return (

    <div className="min-h-full bg-slate-50/80 p-4 sm:p-6 lg:p-8">

      <header className="mb-6">

        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Platform admin</p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">Driver verification</h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">

          Review driver applications, personal identity documents, vehicle paperwork, and photos. Approve profiles and

          vehicles independently before drivers can go online.

        </p>

      </header>



      {message && (

        <p

          className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${

            message.isError ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"

          }`}

        >

          {message.text}

        </p>

      )}



      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">

        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">

            <p className="font-semibold text-slate-800">Applications</p>

            <div className="mt-2 flex flex-wrap gap-1.5">

              {filters.map((f) => (

                <button

                  key={f.key}

                  type="button"

                  onClick={() => setListFilter(f.key)}

                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${

                    listFilter === f.key

                      ? "bg-indigo-600 text-white"

                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"

                  }`}

                >

                  {f.label}

                </button>

              ))}

            </div>

          </div>



          {isLoading || (listFilter === "expired" && expiredLoading) ? (

            <div className="flex items-center justify-center p-12">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

            </div>

          ) : list.length === 0 ? (

            <p className="p-6 text-sm text-slate-500">No driver applications in this queue.</p>

          ) : (

            <ul className="max-h-[calc(100vh-280px)] divide-y divide-slate-100 overflow-y-auto">

              {list.map((item) => (

                <li key={item.id}>

                  <DriverListItem

                    item={item}

                    selected={selectedId === item.id}

                    onSelect={() => {

                      setSelectedId(item.id);

                      setMessage(null);

                    }}

                  />

                </li>

              ))}

            </ul>

          )}

        </aside>



        <main className="min-w-0">

          {!selectedId ? (

            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <ShieldCheck className="mb-4 h-12 w-12 text-slate-300" />

              <p className="text-lg font-semibold text-slate-700">Select a driver to review</p>

              <p className="mt-1 max-w-sm text-sm text-slate-500">

                Choose an application from the list to view all personal and vehicle documents, then approve or reject.

              </p>

            </div>

          ) : detailLoading || !detail ? (

            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

            </div>

          ) : (

            <DriverDetailPanel

              detail={detail}

              selectedId={selectedId}

              onMessage={(text, isError) => {

                if (!text) {

                  setMessage(null);

                  return;

                }

                setMessage({ text, isError: !!isError });

                if (!isError) void refetch();

              }}

            />

          )}

        </main>

      </div>

    </div>

  );

}


