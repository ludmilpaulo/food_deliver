export type DriverVerificationStatus =
  | "draft"
  | "pending_verification"
  | "approved"
  | "rejected"
  | "suspended"
  | "expired_documents";

export type AdminDriverDocument = {
  id: number;
  documentType: string;
  documentTypeLabel: string;
  fileUrl: string | null;
  originalFilename: string;
  expiryDate: string | null;
  verificationStatus: string;
  rejectionReason: string;
  uploadedAt: string;
  verifiedAt: string | null;
};

export type AdminDriverVehicle = {
  id: number;
  vehicleType: string;
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  year: number | null;
  verificationStatus: string;
  rejectionReason: string;
  documents: AdminDriverDocument[];
};

export type AdminDriverChecklistItem = {
  key: string;
  labelKey: string;
  done: boolean;
};

export type AdminDriverVerificationMeta = {
  verificationStatus: DriverVerificationStatus;
  vehicleVerificationStatus: string;
  isVerified: boolean;
  canOperate: boolean;
  profileCompletionPercentage: number;
  missingPersonalDocuments: string[];
  missingVehicleDocuments: string[];
  missingPersonalLabels: string[];
  missingVehicleLabels: string[];
  rejectionReason: string;
  suspensionReason: string;
  adminNotes: string;
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  checklist: AdminDriverChecklistItem[];
  canSubmitForReview: boolean;
};

export type AdminDriverVerificationDetail = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  countryId: number | null;
  verificationStatus: DriverVerificationStatus;
  isVerified: boolean;
  rejectionReason: string;
  suspensionReason: string;
  adminNotes: string;
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  personalDocuments: AdminDriverDocument[];
  vehicle: AdminDriverVehicle | null;
  verification: AdminDriverVerificationMeta;
};

export type AdminDriverListItem = {
  id: number;
  fullName: string;
  email: string;
  username?: string;
  verificationStatus: DriverVerificationStatus;
  vehicleVerificationStatus: string;
  submittedForReviewAt: string | null;
  profileCompletionPercentage: number;
  documentCount: number;
  personalDocumentCount?: number;
  vehicleDocumentCount?: number;
};

export const REQUIRED_PERSONAL_DOCUMENT_TYPES = [
  "profile_photo",
  "id_document",
  "drivers_licence",
  "police_clearance",
] as const;

export const REQUIRED_VEHICLE_DOCUMENT_TYPES = [
  "vehicle_registration",
  "licence_disc",
  "vehicle_insurance",
  "photo_front",
  "photo_back",
  "photo_left",
  "photo_right",
  "photo_interior",
  "photo_number_plate",
] as const;

export const PERSONAL_DOCUMENT_LABELS: Record<string, string> = {
  profile_photo: "Driver profile photo",
  id_document: "National ID or passport",
  drivers_licence: "Valid driver's licence",
  police_clearance: "Police clearance certificate",
  proof_of_address: "Proof of address",
  work_permit: "Work permit",
  residence_permit: "Residence permit",
  other: "Additional document",
};

export const VEHICLE_DOCUMENT_LABELS: Record<string, string> = {
  vehicle_registration: "Vehicle registration document",
  licence_disc: "Vehicle licence disc",
  roadworthy_certificate: "Roadworthy certificate",
  vehicle_insurance: "Vehicle insurance document",
  vehicle_inspection: "Vehicle inspection document",
  photo_front: "Vehicle photo — front",
  photo_back: "Vehicle photo — back",
  photo_left: "Vehicle photo — left side",
  photo_right: "Vehicle photo — right side",
  photo_interior: "Vehicle photo — interior",
  photo_number_plate: "Number plate photo",
  other_vehicle: "Additional vehicle document",
};
