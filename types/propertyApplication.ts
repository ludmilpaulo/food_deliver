/** Customer rental-application shapes matching Django application serializers. */

export type PropertyApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "documents_required"
  | "viewing_required"
  | "conditionally_approved"
  | "approved"
  | "lease_generated"
  | "tenant_signature_required"
  | "owner_signature_required"
  | "active"
  | "rejected"
  | "withdrawn"
  | "cancelled"
  | "expired"
  | string;

export type ApplicationDocumentStatus =
  | "pending"
  | "verified"
  | "rejected"
  | string;

export type PropertyViewingStatus =
  | "proposed"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "reschedule_requested"
  | string;

export type LeaseStatus =
  | "draft"
  | "pending_signatures"
  | "executed"
  | "cancelled"
  | string;

export type TimelineStepState = "done" | "current" | "pending" | string;

export type PropertyDocumentRequirement = {
  id: number;
  document_type: string;
  is_required: boolean;
  label_en?: string;
  label_pt?: string;
  label_fr?: string;
  label_es?: string;
  sort_order?: number;
};

export type ApplicationDocument = {
  id: number;
  application: number;
  document_type: string;
  status: ApplicationDocumentStatus;
  original_filename?: string;
  rejection_reason?: string;
  reviewed_at?: string | null;
  uploaded_at?: string;
  updated_at?: string;
  download_path?: string;
};

export type ApplicationTimelineStep = {
  key: string;
  label: string;
  state: TimelineStepState;
  at: string | null;
  note?: string;
};

export type ApplicationStatusHistory = {
  id: number;
  from_status: string;
  to_status: string;
  changed_by_name: string;
  note: string;
  created_at: string;
};

export type PropertyViewing = {
  id: number;
  scheduled_at: string;
  location: string;
  notes: string;
  status: PropertyViewingStatus;
  customer_note: string;
  created_at?: string;
  updated_at?: string;
};

export type LeaseSignature = {
  id: number;
  role: string;
  signer_name: string;
  signed_at: string | null;
  signature_name: string;
  is_signed: boolean;
};

export type ApplicationLease = {
  id: number;
  application: number;
  property_listing: number;
  property_title: string;
  version: number;
  language: string;
  status: LeaseStatus;
  signing_order: string;
  start_date: string | null;
  end_date: string | null;
  monthly_rent: string;
  deposit: string;
  currency: string;
  special_conditions: string;
  rendered_body: string;
  document_id?: string;
  executed_at: string | null;
  created_at?: string;
  signatures?: LeaseSignature[];
  pdf_download_path?: string | null;
  has_pdf?: boolean;
};

export type PropertyApplicationListItem = {
  id: number;
  property_listing: number;
  property_title: string;
  property_city: string;
  status: PropertyApplicationStatus;
  proposed_rent: string;
  currency: string;
  move_in_date: string | null;
  submitted_at: string | null;
  created_at: string;
};

export type PropertyApplicationDraftPayload = {
  property_id?: number;
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string | null;
  nationality?: string;
  current_address?: string;
  employment_status?: string;
  occupation?: string;
  move_in_date?: string | null;
  rental_period_months?: number;
  occupants?: number;
  adults?: number;
  children?: number;
  has_pets?: boolean;
  pet_details?: string;
  additional_notes?: string;
  preferred_lease_language?: string;
};

export type PropertyApplicationDetail = PropertyApplicationDraftPayload & {
  id: number;
  property_listing: number;
  property_title: string;
  property_owner_name?: string;
  status: PropertyApplicationStatus;
  proposed_rent?: string;
  proposed_deposit?: string;
  currency?: string;
  special_conditions?: string;
  rejection_reason?: string;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  documents?: ApplicationDocument[];
  viewings?: PropertyViewing[];
  status_history?: ApplicationStatusHistory[];
  leases?: ApplicationLease[];
  timeline?: ApplicationTimelineStep[];
  requirements?: PropertyDocumentRequirement[];
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  nationality: string;
  current_address: string;
  employment_status: string;
  occupation: string;
  move_in_date: string | null;
  rental_period_months: number;
  adults: number;
  children: number;
  has_pets: boolean;
  pet_details: string;
  additional_notes: string;
  preferred_lease_language: string;
};

export type PropertyServicesSummary = {
  property_applications: number;
  active_leases: number;
  upcoming_stays?: number;
  documents: number;
  active_rentals?: ActiveRentalSummary[];
  modules?: {
    properties?: boolean;
    documents?: boolean;
    stays?: boolean;
  };
};

export type ActiveRentalSummary = {
  application_id: number;
  lease_id: number;
  property_title: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  monthly_rent: string | null;
  currency: string;
  next_payment_placeholder: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  pdf_download_path: string | null;
};

export type MyDocumentsResponse = {
  application_documents: ApplicationDocument[];
  leases: ApplicationLease[];
};
