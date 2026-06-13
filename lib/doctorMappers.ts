import type {
  AppointmentSlot,
  DoctorAppointment,
  DoctorAvailability,
  DoctorDashboardStats,
  DoctorDocument,
  DoctorDocumentType,
  DoctorListItem,
  DoctorProfileMe,
  DoctorService,
  DoctorVerificationStatus,
  DoctorVerificationStatusResponse,
  GeneratedSlotPreview,
  AdminDoctorVerificationDetail,
  AdminDoctorVerificationListItem,
} from "@/types/doctor";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function mapDashboardStats(raw: Record<string, unknown>): DoctorDashboardStats {
  return {
    clinicName: asString(raw.clinic_name),
    specialtyName: asString(raw.specialty_name),
    approvalStatus: asString(raw.approval_status),
    verificationStatus: (asString(raw.verification_status, "draft") as DoctorVerificationStatus),
    isActiveOnPlatform: asBool(raw.is_active_on_platform),
    canOperate: asBool(raw.can_operate),
    isActive: asBool(raw.is_active),
    profileCompletionPercent: asNumber(raw.profile_completion_percent),
    todayAppointments: asNumber(raw.today_appointments),
    pendingAppointments: asNumber(raw.pending_appointments),
    totalPatients: asNumber(raw.total_patients),
    availableSlotsThisWeek: asNumber(raw.available_slots_this_week),
    averageRating: asNumber(raw.average_rating),
    reviewCount: asNumber(raw.review_count),
    monthlyEarnings: asString(raw.monthly_earnings, "0"),
    currency: asString(raw.currency, "AOA"),
  };
}

export function mapVerificationStatus(raw: Record<string, unknown>): DoctorVerificationStatusResponse {
  const missing = Array.isArray(raw.missing_documents)
    ? raw.missing_documents.filter((item): item is DoctorDocumentType => typeof item === "string")
    : [];
  const missingLabels = Array.isArray(raw.missing_document_labels)
    ? raw.missing_document_labels.filter((item): item is string => typeof item === "string")
    : [];
  return {
    verificationStatus: asString(raw.verification_status, "draft") as DoctorVerificationStatus,
    isActiveOnPlatform: asBool(raw.is_active_on_platform),
    profileCompletionPercentage: asNumber(raw.profile_completion_percentage),
    missingDocuments: missing,
    missingDocumentLabels: missingLabels,
    rejectionReason: asString(raw.rejection_reason),
    adminNotes: asString(raw.admin_notes),
    submittedForReviewAt: raw.submitted_for_review_at ? asString(raw.submitted_for_review_at) : null,
    reviewedAt: raw.reviewed_at ? asString(raw.reviewed_at) : null,
    canOperate: asBool(raw.can_operate),
    canSubmitForReview: asBool(raw.can_submit_for_review),
  };
}

export function mapDoctorDocument(raw: Record<string, unknown>): DoctorDocument {
  return {
    id: asNumber(raw.id),
    documentType: asString(raw.document_type, "other") as DoctorDocumentType,
    fileUrl: asString(raw.file_url),
    originalFilename: asString(raw.original_filename),
    isVerified: asBool(raw.is_verified),
    rejectionReason: asString(raw.rejection_reason),
    uploadedAt: asString(raw.uploaded_at),
  };
}

export function mapAdminDoctorVerificationListItem(raw: Record<string, unknown>): AdminDoctorVerificationListItem {
  return {
    id: asNumber(raw.id),
    clinicName: asString(raw.clinic_name),
    specialtyName: asString(raw.specialty_name),
    verificationStatus: asString(raw.verification_status, "draft") as DoctorVerificationStatus,
    submittedForReviewAt: raw.submitted_for_review_at ? asString(raw.submitted_for_review_at) : null,
    profileCompletionPercentage: asNumber(raw.profile_completion_percentage),
    documentCount: asNumber(raw.document_count),
    email: asString(raw.email),
  };
}

export function mapAdminDoctorVerificationDetail(raw: Record<string, unknown>): AdminDoctorVerificationDetail {
  const documents = Array.isArray(raw.documents)
    ? raw.documents.map((row) => mapDoctorDocument(row as Record<string, unknown>))
    : [];
  const verificationRaw = (raw.verification as Record<string, unknown> | undefined) ?? {};
  return {
    id: asNumber(raw.id),
    email: asString(raw.email),
    clinicName: asString(raw.clinic_name),
    specialtyName: asString(raw.specialty_name),
    biography: asString(raw.biography),
    licenseNumber: asString(raw.license_number),
    verificationStatus: asString(raw.verification_status, "draft") as DoctorVerificationStatus,
    isActiveOnPlatform: asBool(raw.is_active_on_platform),
    submittedForReviewAt: raw.submitted_for_review_at ? asString(raw.submitted_for_review_at) : null,
    reviewedAt: raw.reviewed_at ? asString(raw.reviewed_at) : null,
    rejectionReason: asString(raw.rejection_reason),
    adminNotes: asString(raw.admin_notes),
    documents,
    verification: mapVerificationStatus(verificationRaw),
  };
}

export function mapAvailability(raw: Record<string, unknown>): DoctorAvailability {
  return {
    id: asNumber(raw.id),
    dayOfWeek: asNumber(raw.day_of_week),
    dayName: asString(raw.day_name),
    startTime: asString(raw.start_time).slice(0, 5),
    endTime: asString(raw.end_time).slice(0, 5),
    consultationDurationMinutes: asNumber(raw.consultation_duration_minutes, 60),
    breakDurationMinutes: asNumber(raw.break_duration_minutes, 10),
    isAvailable: asBool(raw.is_available, true),
    isActive: asBool(raw.is_active, true),
    consultationType: (raw.consultation_type as DoctorAvailability["consultationType"]) || "both",
  };
}

export function mapSlot(raw: Record<string, unknown>): AppointmentSlot {
  return {
    id: asNumber(raw.id),
    date: asString(raw.date),
    startTime: asString(raw.start_time).slice(0, 5),
    endTime: asString(raw.end_time).slice(0, 5),
    isBooked: asBool(raw.is_booked),
    isBlocked: asBool(raw.is_blocked),
    availability: raw.availability === null ? null : asNumber(raw.availability),
  };
}

export function mapService(raw: Record<string, unknown>): DoctorService {
  return {
    id: asNumber(raw.id),
    name: asString(raw.name),
    description: asString(raw.description),
    price: asString(raw.price),
    currency: asString(raw.currency),
    durationMinutes: asNumber(raw.duration_minutes, 60),
    consultationType: (raw.consultation_type as DoctorService["consultationType"]) || "both",
    isActive: asBool(raw.is_active, true),
    createdAt: asString(raw.created_at),
    updatedAt: asString(raw.updated_at),
  };
}

export function mapAppointment(raw: Record<string, unknown>): DoctorAppointment {
  return {
    id: asNumber(raw.id),
    doctor: asNumber(raw.doctor),
    doctorName: asString(raw.doctor_name),
    specialtyName: asString(raw.specialty_name),
    patientName: asString(raw.patient_name),
    patientEmail: asString(raw.patient_email),
    service: raw.service === null ? null : asNumber(raw.service),
    serviceName: raw.service_name === null ? null : asString(raw.service_name),
    slotId: raw.slot_id === null ? null : asNumber(raw.slot_id),
    appointmentType: (raw.appointment_type as DoctorAppointment["appointmentType"]) || "physical",
    date: asString(raw.date),
    startTime: asString(raw.start_time).slice(0, 5),
    endTime: asString(raw.end_time).slice(0, 5),
    status: asString(raw.status),
    consultationFee: asString(raw.consultation_fee),
    currency: asString(raw.currency),
    paymentStatus: asString(raw.payment_status),
    notes: asString(raw.notes),
    doctorNotes: asString(raw.doctor_notes),
    meetingLink: asString(raw.meeting_link),
    createdAt: asString(raw.created_at),
  };
}

export function mapProfile(raw: Record<string, unknown>): DoctorProfileMe {
  return {
    id: asNumber(raw.id),
    email: asString(raw.email),
    firstName: asString(raw.first_name),
    lastName: asString(raw.last_name),
    professionalTitle: asString(raw.professional_title),
    specialty: asNumber(raw.specialty),
    specialtyName: asString(raw.specialty_name),
    yearsExperience: asNumber(raw.years_experience),
    languages: asString(raw.languages),
    country: asNumber(raw.country),
    city: raw.city === null ? null : asNumber(raw.city),
    clinicName: asString(raw.clinic_name),
    biography: asString(raw.biography),
    consultationFee: asString(raw.consultation_fee),
    currency: asString(raw.currency),
    onlineConsultationEnabled: asBool(raw.online_consultation_enabled),
    physicalConsultationEnabled: asBool(raw.physical_consultation_enabled),
    licenseNumber: asString(raw.license_number),
    conditionsTreated: asString(raw.conditions_treated),
    servicesOffered: asString(raw.services_offered),
    insuranceAccepted: asString(raw.insurance_accepted),
    approvalStatus: asString(raw.approval_status),
    rating: asString(raw.rating, "0"),
    reviewCount: asNumber(raw.review_count),
    profilePhoto: raw.profile_photo === null ? null : asString(raw.profile_photo),
    isActive: asBool(raw.is_active, true),
  };
}

export function mapDoctorListItem(raw: Record<string, unknown>): DoctorListItem {
  return {
    id: asNumber(raw.id),
    name: asString(raw.name),
    professionalTitle: asString(raw.professional_title),
    specialty: asNumber(raw.specialty),
    specialtyName: asString(raw.specialty_name),
    yearsExperience: asNumber(raw.years_experience),
    languages: asString(raw.languages),
    country: asNumber(raw.country),
    countryName: asString(raw.country_name),
    city: raw.city === null ? null : asNumber(raw.city),
    cityName: raw.city_name === null ? null : asString(raw.city_name),
    clinicName: asString(raw.clinic_name),
    consultationFee: asString(raw.consultation_fee),
    currency: asString(raw.currency),
    onlineConsultationEnabled: asBool(raw.online_consultation_enabled),
    physicalConsultationEnabled: asBool(raw.physical_consultation_enabled),
    rating: asString(raw.rating, "0"),
    reviewCount: asNumber(raw.review_count),
    profilePhoto: raw.profile_photo === null ? null : asString(raw.profile_photo),
    biography: asString(raw.biography),
  };
}

export function mapGeneratedSlots(raw: Record<string, unknown>): GeneratedSlotPreview[] {
  const slots = raw.generated_slots;
  if (!Array.isArray(slots)) return [];
  return slots.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      startTime: asString(row.start_time).slice(0, 5),
      endTime: asString(row.end_time).slice(0, 5),
    };
  });
}

export function toSnakeAvailability(input: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  consultationDurationMinutes?: number;
  breakDurationMinutes?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  consultationType?: string;
}): Record<string, unknown> {
  return {
    day_of_week: input.dayOfWeek,
    start_time: input.startTime,
    end_time: input.endTime,
    consultation_duration_minutes: input.consultationDurationMinutes ?? 60,
    break_duration_minutes: input.breakDurationMinutes ?? 10,
    is_available: input.isAvailable ?? true,
    is_active: input.isActive ?? true,
    consultation_type: input.consultationType ?? "both",
  };
}

export function toSnakeService(input: {
  name: string;
  description?: string;
  price: string | number;
  durationMinutes?: number;
  consultationType?: string;
  isActive?: boolean;
}): Record<string, unknown> {
  return {
    name: input.name,
    description: input.description ?? "",
    price: input.price,
    duration_minutes: input.durationMinutes ?? 60,
    consultation_type: input.consultationType ?? "both",
    is_active: input.isActive ?? true,
  };
}
