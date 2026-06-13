import type {
  City,
  Country,
  DoctorAvailability,
  DoctorSpecialty,
  HealthcareDoctor,
} from '@/types/healthcare';

type RawRecord = Record<string, unknown>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function mapCountry(raw: RawRecord): Country {
  return {
    id: asNumber(raw.id),
    name: asString(raw.name),
    code: asString(raw.code),
    currency: asString(raw.currency),
    currency_symbol: raw.currency_symbol === null ? null : asString(raw.currency_symbol),
    is_active: raw.is_active === undefined ? true : asBool(raw.is_active),
  };
}

export function mapCity(raw: RawRecord): City {
  return {
    id: asNumber(raw.id),
    name: asString(raw.name),
    country: asNumber(raw.country),
    country_name: asString(raw.country_name),
    country_code: asString(raw.country_code),
    is_active: raw.is_active === undefined ? true : asBool(raw.is_active),
  };
}

export function mapSpecialty(raw: RawRecord): DoctorSpecialty {
  return {
    id: asNumber(raw.id),
    name: asString(raw.name),
    slug: asString(raw.slug),
    icon: raw.icon === null || raw.icon === undefined ? null : asString(raw.icon),
    order: raw.order === undefined ? undefined : asNumber(raw.order),
  };
}

export function mapAvailability(raw: RawRecord): DoctorAvailability {
  return {
    id: asNumber(raw.id),
    dayOfWeek: asNumber(raw.day_of_week),
    dayName: asString(raw.day_name),
    startTime: asString(raw.start_time).slice(0, 5),
    endTime: asString(raw.end_time).slice(0, 5),
    consultationType: asString(raw.consultation_type),
  };
}

export function mapHealthcareDoctor(raw: RawRecord): HealthcareDoctor {
  const availability = Array.isArray(raw.availability)
    ? raw.availability.map((row) => mapAvailability(row as RawRecord))
    : undefined;

  return {
    id: asNumber(raw.id),
    name: asString(raw.name),
    professionalTitle: asString(raw.professional_title),
    specialty: asNumber(raw.specialty),
    specialtyName: asString(raw.specialty_name),
    specialtySlug: asString(raw.specialty_slug),
    yearsExperience: asNumber(raw.years_experience),
    languages: asString(raw.languages),
    country: asNumber(raw.country),
    countryName: asString(raw.country_name),
    countryCode: asString(raw.country_code),
    city: raw.city === null ? null : asNumber(raw.city),
    cityName: raw.city_name === null ? null : asString(raw.city_name),
    clinicName: asString(raw.clinic_name),
    phoneNumber: asString(raw.phone_number),
    consultationFee: asString(raw.consultation_fee),
    currency: asString(raw.currency),
    onlineConsultationEnabled: asBool(raw.online_consultation_enabled),
    physicalConsultationEnabled: asBool(raw.physical_consultation_enabled),
    rating: asString(raw.rating, '0'),
    reviewCount: asNumber(raw.review_count),
    profilePhoto: raw.profile_photo === null ? null : asString(raw.profile_photo),
    isVerified: asBool(raw.is_verified),
    biography: asString(raw.biography),
    conditionsTreated: asString(raw.conditions_treated),
    servicesOffered: asString(raw.services_offered),
    insuranceAccepted: asString(raw.insurance_accepted),
    availability,
  };
}

export function unwrapList<T>(data: T[] | { results?: T[] }): T[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}
