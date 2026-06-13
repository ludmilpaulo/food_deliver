export type AppointmentSlot = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isBlocked: boolean;
  availability: number | null;
};

export type DoctorAvailability = {
  id: number;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  consultationDurationMinutes: number;
  breakDurationMinutes: number;
  isAvailable: boolean;
  isActive: boolean;
  consultationType: "physical" | "online" | "both";
};

export type DoctorAvailabilityInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  consultationDurationMinutes?: number;
  breakDurationMinutes?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  consultationType?: "physical" | "online" | "both";
};

export type DoctorService = {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  durationMinutes: number;
  consultationType: "physical" | "online" | "both";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DoctorServiceInput = {
  name: string;
  description?: string;
  price: string | number;
  durationMinutes?: number;
  consultationType?: "physical" | "online" | "both";
  isActive?: boolean;
};

export type DoctorDashboardStats = {
  clinicName: string;
  specialtyName: string;
  approvalStatus: string;
  verificationStatus: DoctorVerificationStatus;
  isActiveOnPlatform: boolean;
  canOperate: boolean;
  isActive: boolean;
  profileCompletionPercent: number;
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  availableSlotsThisWeek: number;
  averageRating: number;
  reviewCount: number;
  monthlyEarnings: string;
  currency: string;
};

export type DoctorVerificationStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended";

export type DoctorDocumentType =
  | "id_document"
  | "medical_licence"
  | "qualification_certificate"
  | "registration_certificate"
  | "background_check_consent"
  | "other";

export interface DoctorDocument {
  id: number;
  documentType: DoctorDocumentType;
  fileUrl: string;
  originalFilename: string;
  isVerified: boolean;
  rejectionReason: string;
  uploadedAt: string;
}

export interface DoctorVerificationStatusResponse {
  verificationStatus: DoctorVerificationStatus;
  isActiveOnPlatform: boolean;
  profileCompletionPercentage: number;
  missingDocuments: DoctorDocumentType[];
  missingDocumentLabels: string[];
  rejectionReason: string;
  adminNotes: string;
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  canOperate: boolean;
  canSubmitForReview: boolean;
}

export interface AdminDoctorVerificationListItem {
  id: number;
  clinicName: string;
  specialtyName: string;
  verificationStatus: DoctorVerificationStatus;
  submittedForReviewAt: string | null;
  profileCompletionPercentage: number;
  documentCount: number;
  email: string;
}

export interface AdminDoctorVerificationDetail {
  id: number;
  email: string;
  clinicName: string;
  specialtyName: string;
  biography: string;
  licenseNumber: string;
  verificationStatus: DoctorVerificationStatus;
  isActiveOnPlatform: boolean;
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string;
  adminNotes: string;
  documents: DoctorDocument[];
  verification: DoctorVerificationStatusResponse;
}

export type DoctorProfileMe = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  professionalTitle: string;
  specialty: number;
  specialtyName: string;
  yearsExperience: number;
  languages: string;
  country: number;
  city: number | null;
  clinicName: string;
  biography: string;
  consultationFee: string;
  currency: string;
  onlineConsultationEnabled: boolean;
  physicalConsultationEnabled: boolean;
  licenseNumber: string;
  conditionsTreated: string;
  servicesOffered: string;
  insuranceAccepted: string;
  approvalStatus: string;
  rating: string;
  reviewCount: number;
  profilePhoto: string | null;
  isActive: boolean;
};

export type DoctorAppointment = {
  id: number;
  doctor: number;
  doctorName: string;
  specialtyName: string;
  patientName: string;
  patientEmail: string;
  service: number | null;
  serviceName: string | null;
  slotId: number | null;
  appointmentType: "physical" | "online";
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  consultationFee: string;
  currency: string;
  paymentStatus: string;
  notes: string;
  doctorNotes: string;
  meetingLink: string;
  createdAt: string;
};

export type DoctorListItem = {
  id: number;
  name: string;
  professionalTitle: string;
  specialty: number;
  specialtyName: string;
  yearsExperience: number;
  languages: string;
  country: number;
  countryName: string;
  city: number | null;
  cityName: string | null;
  clinicName: string;
  consultationFee: string;
  currency: string;
  onlineConsultationEnabled: boolean;
  physicalConsultationEnabled: boolean;
  rating: string;
  reviewCount: number;
  profilePhoto: string | null;
  biography?: string;
};

export type BookAppointmentPayload = {
  slotId: number;
  appointmentType: "physical" | "online";
  serviceId?: number;
  notes?: string;
};

export type AppointmentStatusUpdate = {
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show" | "in_progress";
  doctorNotes?: string;
  cancellationReason?: string;
};

export type GeneratedSlotPreview = {
  startTime: string;
  endTime: string;
};

export type DoctorDashboardTab =
  | "overview"
  | "profile"
  | "services"
  | "availability"
  | "appointments"
  | "patients"
  | "reviews"
  | "business"
  | "verification";

export const REQUIRED_DOCTOR_DOCUMENTS: { type: DoctorDocumentType; labelKey: string }[] = [
  { type: "id_document", labelKey: "docIdPassport" },
  { type: "medical_licence", labelKey: "docMedicalLicence" },
  { type: "qualification_certificate", labelKey: "docQualification" },
  { type: "registration_certificate", labelKey: "docRegistration" },
  { type: "background_check_consent", labelKey: "docBackgroundConsent" },
];
