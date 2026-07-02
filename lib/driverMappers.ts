import type {
  AdminDriverDocument,
  AdminDriverListItem,
  AdminDriverVerificationDetail,
  AdminDriverVerificationMeta,
  AdminDriverVehicle,
  DriverVerificationStatus,
} from "@/types/driver";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function mapAdminDriverDocument(raw: Record<string, unknown>): AdminDriverDocument {
  return {
    id: asNumber(raw.id),
    documentType: asString(raw.document_type),
    documentTypeLabel: asString(raw.document_type_label, asString(raw.document_type)),
    fileUrl: typeof raw.file_url === "string" ? raw.file_url : null,
    originalFilename: asString(raw.original_filename),
    expiryDate: typeof raw.expiry_date === "string" ? raw.expiry_date : null,
    verificationStatus: asString(raw.verification_status, "pending"),
    rejectionReason: asString(raw.rejection_reason),
    uploadedAt: asString(raw.uploaded_at),
    verifiedAt: typeof raw.verified_at === "string" ? raw.verified_at : null,
  };
}

function mapAdminDriverVehicle(raw: Record<string, unknown> | null | undefined): AdminDriverVehicle | null {
  if (!raw) return null;
  const docs = Array.isArray(raw.documents) ? raw.documents.map((d) => mapAdminDriverDocument(d as Record<string, unknown>)) : [];
  return {
    id: asNumber(raw.id),
    vehicleType: asString(raw.vehicle_type),
    plateNumber: asString(raw.plate_number),
    make: asString(raw.make),
    model: asString(raw.model),
    color: asString(raw.color),
    year: typeof raw.year === "number" ? raw.year : null,
    verificationStatus: asString(raw.verification_status, "pending_review"),
    rejectionReason: asString(raw.rejection_reason),
    documents: docs,
  };
}

function mapVerificationMeta(raw: Record<string, unknown> | null | undefined): AdminDriverVerificationMeta {
  const checklist = Array.isArray(raw?.checklist)
    ? raw.checklist.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          key: asString(row.key),
          labelKey: asString(row.label_key),
          done: asBool(row.done),
        };
      })
    : [];

  return {
    verificationStatus: asString(raw?.verification_status, "draft") as DriverVerificationStatus,
    vehicleVerificationStatus: asString(raw?.vehicle_verification_status, "pending_review"),
    isVerified: asBool(raw?.is_verified),
    canOperate: asBool(raw?.can_operate),
    profileCompletionPercentage: asNumber(raw?.profile_completion_percentage),
    missingPersonalDocuments: Array.isArray(raw?.missing_personal_documents)
      ? raw.missing_personal_documents.map(String)
      : [],
    missingVehicleDocuments: Array.isArray(raw?.missing_vehicle_documents)
      ? raw.missing_vehicle_documents.map(String)
      : [],
    missingPersonalLabels: Array.isArray(raw?.missing_personal_labels)
      ? raw.missing_personal_labels.map(String)
      : [],
    missingVehicleLabels: Array.isArray(raw?.missing_vehicle_labels)
      ? raw.missing_vehicle_labels.map(String)
      : [],
    rejectionReason: asString(raw?.rejection_reason),
    suspensionReason: asString(raw?.suspension_reason),
    adminNotes: asString(raw?.admin_notes),
    submittedForReviewAt: typeof raw?.submitted_for_review_at === "string" ? raw.submitted_for_review_at : null,
    reviewedAt: typeof raw?.reviewed_at === "string" ? raw.reviewed_at : null,
    checklist,
    canSubmitForReview: asBool(raw?.can_submit_for_review),
  };
}

export function mapAdminDriverListItem(raw: Record<string, unknown>): AdminDriverListItem {
  return {
    id: asNumber(raw.id),
    fullName: asString(raw.full_name),
    email: asString(raw.email),
    username: asString(raw.username),
    verificationStatus: asString(raw.verification_status, "draft") as DriverVerificationStatus,
    vehicleVerificationStatus: asString(raw.vehicle_verification_status, "pending_review"),
    submittedForReviewAt: typeof raw.submitted_for_review_at === "string" ? raw.submitted_for_review_at : null,
    profileCompletionPercentage: asNumber(raw.profile_completion_percentage),
    documentCount: asNumber(raw.document_count),
    personalDocumentCount: asNumber(raw.personal_document_count),
    vehicleDocumentCount: asNumber(raw.vehicle_document_count),
  };
}

export function mapAdminDriverVerificationDetail(raw: Record<string, unknown>): AdminDriverVerificationDetail {
  const personalDocs = Array.isArray(raw.personal_documents)
    ? raw.personal_documents.map((d) => mapAdminDriverDocument(d as Record<string, unknown>))
    : [];

  return {
    id: asNumber(raw.id),
    email: asString(raw.email),
    fullName: asString(raw.full_name),
    phone: asString(raw.phone),
    address: asString(raw.address),
    countryId: typeof raw.country_id === "number" ? raw.country_id : null,
    verificationStatus: asString(raw.verification_status, "draft") as DriverVerificationStatus,
    isVerified: asBool(raw.is_verified),
    rejectionReason: asString(raw.rejection_reason),
    suspensionReason: asString(raw.suspension_reason),
    adminNotes: asString(raw.admin_notes),
    submittedForReviewAt: typeof raw.submitted_for_review_at === "string" ? raw.submitted_for_review_at : null,
    reviewedAt: typeof raw.reviewed_at === "string" ? raw.reviewed_at : null,
    personalDocuments: personalDocs,
    vehicle: mapAdminDriverVehicle(raw.vehicle as Record<string, unknown> | undefined),
    verification: mapVerificationMeta(raw.verification as Record<string, unknown> | undefined),
  };
}
