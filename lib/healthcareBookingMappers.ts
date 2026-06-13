import type {
  BookingPaymentOption,
  DoctorAvailableSlot,
  DoctorBookingSettings,
  HealthcareAppointment,
  HealthcareBookingResult,
  SlotPeriod,
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

function normalizePeriod(value: unknown): SlotPeriod {
  if (value === 'morning' || value === 'afternoon' || value === 'evening') {
    return value;
  }
  return 'morning';
}

export function mapHealthcareSlot(raw: RawRecord): DoctorAvailableSlot {
  const startTime = asString(raw.start_time).slice(0, 5);
  const hour = Number.parseInt(startTime.split(':')[0] ?? '0', 10);
  let period: SlotPeriod = 'morning';
  if (hour >= 17) period = 'evening';
  else if (hour >= 12) period = 'afternoon';

  return {
    id: asNumber(raw.id),
    date: asString(raw.date),
    startTime,
    endTime: asString(raw.end_time).slice(0, 5),
    period: normalizePeriod(raw.period ?? period),
    isAvailable: raw.is_available === undefined
      ? !asBool(raw.is_booked) && !asBool(raw.is_blocked)
      : asBool(raw.is_available),
    isBooked: asBool(raw.is_booked),
    isBlocked: asBool(raw.is_blocked),
  };
}

const PAYMENT_OPTIONS: BookingPaymentOption[] = [
  'pay_now',
  'pay_at_clinic',
  'wallet',
  'mobile_money',
  'card',
];

function isPaymentOption(value: string): value is BookingPaymentOption {
  return PAYMENT_OPTIONS.includes(value as BookingPaymentOption);
}

export function mapBookingSettings(raw: RawRecord): DoctorBookingSettings {
  const methods = Array.isArray(raw.payment_methods)
    ? raw.payment_methods.filter(
        (item): item is BookingPaymentOption =>
          typeof item === 'string' && isPaymentOption(item),
      )
    : (['pay_at_clinic'] as BookingPaymentOption[]);

  return {
    doctorId: asNumber(raw.doctor_id),
    consultationFee: Number.parseFloat(asString(raw.consultation_fee, '0')) || 0,
    currency: asString(raw.currency, 'AOA'),
    platformFee: asNumber(raw.platform_fee),
    platformFeeType:
      raw.platform_fee_type === 'percentage' || raw.platform_fee_type === 'fixed'
        ? raw.platform_fee_type
        : null,
    platformFeeValue: raw.platform_fee_value === null || raw.platform_fee_value === undefined
      ? null
      : asString(raw.platform_fee_value),
    paymentMethods: methods,
    offersOnline: asBool(raw.offers_online),
    offersInPerson: asBool(raw.offers_in_person),
    cancellationPolicy: asString(raw.cancellation_policy),
  };
}

export function mapHealthcareAppointment(raw: RawRecord): HealthcareAppointment {
  const appointmentType = asString(raw.appointment_type);
  const patientAgeRaw = raw.patient_age;
  return {
    id: asNumber(raw.id),
    doctorId: asNumber(raw.doctor),
    doctorName: asString(raw.doctor_name),
    specialtyName: asString(raw.specialty_name),
    patientName: asString(raw.patient_name),
    patientDateOfBirth: raw.patient_date_of_birth === null || raw.patient_date_of_birth === undefined
      ? null
      : asString(raw.patient_date_of_birth),
    patientAge: patientAgeRaw === null || patientAgeRaw === undefined ? null : asNumber(patientAgeRaw),
    patientGender: raw.patient_gender === null || raw.patient_gender === undefined
      ? null
      : asString(raw.patient_gender),
    patientPhone: raw.patient_phone === null || raw.patient_phone === undefined
      ? null
      : asString(raw.patient_phone),
    appointmentType: appointmentType === 'online' ? 'online' : 'physical',
    date: asString(raw.date),
    startTime: asString(raw.start_time).slice(0, 5),
    endTime: asString(raw.end_time).slice(0, 5),
    status: asString(raw.status),
    consultationFee: asString(raw.consultation_fee),
    currency: asString(raw.currency),
    paymentMethod: asString(raw.payment_method),
    notes: asString(raw.notes),
    meetingLink: asString(raw.meeting_link),
  };
}

export function mapHealthcareBookingResponse(raw: RawRecord): HealthcareBookingResult {
  const accessToken = asString(raw.access_token);
  const refreshToken = asString(raw.refresh_token);
  return {
    ...mapHealthcareAppointment(raw),
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
  };
}
