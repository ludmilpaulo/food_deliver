export type DoctorConsultationType = 'online' | 'physical';

export type Country = {
  id: number;
  name: string;
  code: string;
  currency: string;
  currency_symbol?: string | null;
  is_active?: boolean;
};

export type City = {
  id: number;
  name: string;
  country: number;
  country_name: string;
  country_code: string;
  is_active?: boolean;
};

export type DoctorSpecialty = {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  order?: number;
};

export type DoctorAvailability = {
  id: number;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  consultationType: string;
};

export type HealthcareDoctor = {
  id: number;
  name: string;
  professionalTitle: string;
  specialty: number;
  specialtyName: string;
  specialtySlug: string;
  yearsExperience: number;
  languages: string;
  country: number;
  countryName: string;
  countryCode: string;
  city: number | null;
  cityName: string | null;
  clinicName: string;
  phoneNumber: string;
  consultationFee: string;
  currency: string;
  onlineConsultationEnabled: boolean;
  physicalConsultationEnabled: boolean;
  rating: string;
  reviewCount: number;
  profilePhoto: string | null;
  isVerified: boolean;
  biography?: string;
  conditionsTreated?: string;
  servicesOffered?: string;
  insuranceAccepted?: string;
  availability?: DoctorAvailability[];
};

export type DoctorListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: HealthcareDoctor[];
};

export type SlotPeriod = 'morning' | 'afternoon' | 'evening';

export type DoctorAvailableSlot = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  period: SlotPeriod;
  isAvailable: boolean;
  isBooked: boolean;
  isBlocked: boolean;
};

export type DoctorBookingSummary = {
  id: number;
  fullName: string;
  clinicName: string;
  specialty: string;
  profileImage: string | null;
  rating: number;
  reviewsCount: number;
  yearsExperience: number;
  city: string;
  country: string;
  isVerified: boolean;
  consultationFee: number;
  currency: string;
  offersOnline: boolean;
  offersInPerson: boolean;
};

export type PatientGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type PreferredLanguage = 'en' | 'pt' | 'fr' | 'es';

export type GuardianRelationship = 'parent' | 'guardian' | 'relative' | 'other';

export type GuardianDetailsPayload = {
  guardian_full_name: string;
  guardian_phone_number: string;
  relationship_to_patient: GuardianRelationship;
};

export type PatientDetailsPayload = {
  full_name: string;
  date_of_birth: string;
  age: number;
  phone_number: string;
  email: string;
  gender: PatientGender;
  preferred_language?: PreferredLanguage;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  guardian_full_name?: string;
  guardian_phone_number?: string;
  relationship_to_patient?: GuardianRelationship;
};

export type BookingPaymentOption =
  | 'pay_now'
  | 'pay_at_clinic'
  | 'wallet'
  | 'mobile_money'
  | 'card';

export type DoctorBookingSettings = {
  doctorId: number;
  consultationFee: number;
  currency: string;
  platformFee: number;
  platformFeeType?: 'percentage' | 'fixed' | null;
  platformFeeValue?: string | null;
  paymentMethods: BookingPaymentOption[];
  offersOnline: boolean;
  offersInPerson: boolean;
  cancellationPolicy: string;
};

export type HealthcareAppointment = {
  id: number;
  doctorId: number;
  doctorName: string;
  specialtyName: string;
  patientName: string;
  patientDateOfBirth: string | null;
  patientAge: number | null;
  patientGender: string | null;
  patientPhone: string | null;
  appointmentType: DoctorConsultationType;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  consultationFee: string;
  currency: string;
  paymentMethod: string;
  notes: string;
  meetingLink: string;
  clinicName?: string;
  cityName?: string;
};

export type HealthcareBookingResult = HealthcareAppointment & {
  accessToken?: string;
  refreshToken?: string;
};

export type CreateDoctorAppointmentPayload = {
  slotId: number;
  consultationType: DoctorConsultationType;
  reason: string;
  patient: PatientDetailsPayload;
  paymentMethod: BookingPaymentOption;
};

export type DoctorFilters = {
  search?: string;
  country?: string;
  city?: string;
  specialty?: string;
  specialty_slug?: string;
  consultation_type?: DoctorConsultationType;
  min_rating?: number;
  rating_min?: number;
  price_min?: number;
  price_max?: number;
  verified?: boolean;
  available_today?: boolean;
  language?: string;
  years_experience_min?: number;
};

export type BookHealthcareAppointmentPayload = CreateDoctorAppointmentPayload;

export type BookingStep = 'consultation' | 'datetime' | 'patient' | 'confirm';
