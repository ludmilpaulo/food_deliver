import type { DoctorAvailableSlot, HealthcareDoctor, SlotPeriod } from '@/types/healthcare';

export function toApiConsultationType(type: 'online' | 'physical'): string {
  return type === 'physical' ? 'in_person' : 'online';
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(isoDate: string, locale = 'en'): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  return parsed.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShortWeekday(isoDate: string, locale = 'en'): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  return parsed.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function buildQuickDateOptions(count = 5): { labelKey: 'today' | 'tomorrow' | 'date'; iso: string }[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const options: { labelKey: 'today' | 'tomorrow' | 'date'; iso: string }[] = [];
  for (let offset = 0; offset < count; offset += 1) {
    const next = new Date(today);
    next.setDate(today.getDate() + offset);
    const iso = formatIsoDate(next);
    if (offset === 0) options.push({ labelKey: 'today', iso });
    else if (offset === 1) options.push({ labelKey: 'tomorrow', iso });
    else options.push({ labelKey: 'date', iso });
  }
  return options;
}

export function currentMonthParam(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function groupSlotsByPeriod(slots: DoctorAvailableSlot[]): Record<SlotPeriod, DoctorAvailableSlot[]> {
  return {
    morning: slots.filter((slot) => slot.period === 'morning'),
    afternoon: slots.filter((slot) => slot.period === 'afternoon'),
    evening: slots.filter((slot) => slot.period === 'evening'),
  };
}

export function doctorToBookingSummary(doctor: HealthcareDoctor): {
  id: number;
  fullName: string;
  clinicName: string;
  phoneNumber: string;
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
} {
  const title = doctor.professionalTitle?.trim();
  const fullName = title ? `${title} ${doctor.name}` : doctor.name;
  return {
    id: doctor.id,
    fullName,
    clinicName: doctor.clinicName,
    phoneNumber: doctor.phoneNumber,
    specialty: doctor.specialtyName,
    profileImage: doctor.profilePhoto,
    rating: Number.parseFloat(doctor.rating) || 0,
    reviewsCount: doctor.reviewCount,
    yearsExperience: doctor.yearsExperience,
    city: doctor.cityName ?? '',
    country: doctor.countryName,
    isVerified: doctor.isVerified,
    consultationFee: Number.parseFloat(doctor.consultationFee) || 0,
    currency: doctor.currency,
    offersOnline: doctor.onlineConsultationEnabled,
    offersInPerson: doctor.physicalConsultationEnabled,
  };
}

export const MINOR_AGE_THRESHOLD = 18;

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(`${dateOfBirth}T12:00:00`);

  let age = today.getFullYear() - birthDate.getFullYear();

  const hasBirthdayPassedThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassedThisYear) {
    age -= 1;
  }

  return age;
};

export function isValidDateOfBirth(dateOfBirth: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return false;
  const parsed = new Date(`${dateOfBirth}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return parsed <= today;
}

export function formatAgeLabel(age: number, yearsOldLabel: string): string {
  return `${age} ${yearsOldLabel}`;
}

export const REASON_CHIPS = [
  'generalCheckup',
  'followUp',
  'prescription',
  'feverFlu',
  'painDiscomfort',
  'testResults',
  'reasonOther',
] as const;

export type ReasonChipKey = (typeof REASON_CHIPS)[number];
