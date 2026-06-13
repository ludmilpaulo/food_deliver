'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  Headphones,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Stethoscope,
  Video,
} from 'lucide-react';
import {
  useCreateHealthcareAppointmentMutation,
  useGetDoctorAvailableDaysQuery,
  useGetDoctorAvailableSlotsQuery,
  useGetDoctorBookingSettingsQuery,
  useGetDoctorNextAvailableSlotQuery,
  useGetHealthcareDoctorQuery,
} from '@/redux/slices/healthcareApi';
import { persistBookingSession } from '@/redux/slices/authSlice';
import type { RootState } from '@/redux/store';
import { useAppDispatch } from '@/redux/store';
import type { HealthcareTranslationKey } from '@/configs/healthcareTranslations';
import type {
  BookingPaymentOption,
  BookingStep,
  DoctorConsultationType,
  GuardianRelationship,
  PatientDetailsPayload,
  PatientGender,
} from '@/types/healthcare';
import { useHealthcareTranslation } from '@/hooks/useHealthcareTranslation';
import { extractBookingError } from '@/lib/bookingErrors';
import LiveSupportChatPanel from '@/components/healthcare/LiveSupportChatPanel';
import {
  buildQuickDateOptions,
  calculateAge,
  currentMonthParam,
  doctorToBookingSummary,
  formatAgeLabel,
  formatDisplayDate,
  formatIsoDate,
  formatShortWeekday,
  groupSlotsByPeriod,
  isValidDateOfBirth,
  MINOR_AGE_THRESHOLD,
  REASON_CHIPS,
  toApiConsultationType,
} from '@/lib/bookingUtils';

type Props = {
  doctorId: number;
};

const STEPS: BookingStep[] = ['consultation', 'datetime', 'patient', 'confirm'];

const GENDER_OPTIONS: PatientGender[] = ['male', 'female', 'other', 'prefer_not_to_say'];

const GUARDIAN_RELATIONSHIPS: GuardianRelationship[] = ['parent', 'guardian', 'relative', 'other'];

type PatientFormState = Omit<PatientDetailsPayload, 'age' | 'gender'> & {
  age: number;
  gender: PatientGender | '';
};

function StepIndicator({
  activeStep,
  ht,
}: {
  activeStep: BookingStep;
  ht: (key: HealthcareTranslationKey) => string;
}) {
  const labels: Record<BookingStep, string> = {
    consultation: ht('stepConsultation'),
    datetime: ht('stepDateTime'),
    patient: ht('stepPatient'),
    confirm: ht('stepConfirm'),
  };
  const activeIndex = STEPS.indexOf(activeStep);

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex min-w-[560px] items-center gap-2">
        {STEPS.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <div key={step} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done || active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {index + 1}
              </div>
              <span className={`text-sm font-semibold ${active ? 'text-sky-700' : 'text-slate-500'}`}>
                {labels[step]}
              </span>
              {index < STEPS.length - 1 ? (
                <div className={`mx-1 h-0.5 flex-1 ${done ? 'bg-sky-400' : 'bg-slate-200'}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BookAppointmentExperience({ doctorId }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { ht } = useHealthcareTranslation();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const { data: doctor, isLoading: doctorLoading } = useGetHealthcareDoctorQuery(doctorId, {
    skip: !Number.isFinite(doctorId),
  });
  const { data: bookingSettings } = useGetDoctorBookingSettingsQuery(doctorId, {
    skip: !Number.isFinite(doctorId),
  });

  const summary = useMemo(() => (doctor ? doctorToBookingSummary(doctor) : null), [doctor]);

  const [consultationType, setConsultationType] = useState<DoctorConsultationType>('physical');
  const [date, setDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentOption>('pay_at_clinic');
  const [error, setError] = useState<string | null>(null);
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  const [patient, setPatient] = useState<PatientFormState>({
    full_name: '',
    date_of_birth: '',
    age: 0,
    phone_number: '',
    email: '',
    gender: '',
    preferred_language: 'en',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    guardian_full_name: '',
    guardian_phone_number: '',
    relationship_to_patient: undefined,
  });

  const calculatedAge = useMemo(() => {
    if (!patient.date_of_birth || !isValidDateOfBirth(patient.date_of_birth)) return null;
    return calculateAge(patient.date_of_birth);
  }, [patient.date_of_birth]);

  const isMinor = calculatedAge !== null && calculatedAge < MINOR_AGE_THRESHOLD;

  const apiConsultationType = toApiConsultationType(consultationType);
  const month = currentMonthParam();

  const { data: availableDays = [], isFetching: daysLoading } = useGetDoctorAvailableDaysQuery(
    { doctorId, month, consultationType: apiConsultationType },
    { skip: !Number.isFinite(doctorId) },
  );

  const { data: slots = [], isFetching: slotsLoading } = useGetDoctorAvailableSlotsQuery(
    { doctorId, date, consultationType: apiConsultationType },
    { skip: !date || !Number.isFinite(doctorId) },
  );

  const { data: nextSlot, refetch: refetchNextSlot } = useGetDoctorNextAvailableSlotQuery(
    { doctorId, afterDate: date || undefined, consultationType: apiConsultationType },
    { skip: !Number.isFinite(doctorId) },
  );

  const [bookAppointment, { isLoading: booking }] = useCreateHealthcareAppointmentMutation();

  const availableSlots = useMemo(
    () => slots.filter((slot) => slot.isAvailable && !slot.isBooked && !slot.isBlocked),
    [slots],
  );
  const groupedSlots = useMemo(() => groupSlotsByPeriod(availableSlots), [availableSlots]);
  const selectedSlot = availableSlots.find((slot) => slot.id === selectedSlotId) ?? null;

  const quickDates = useMemo(() => buildQuickDateOptions(7), []);
  const availableDaySet = useMemo(() => new Set(availableDays), [availableDays]);

  const paymentMethods = bookingSettings?.paymentMethods ?? ['pay_at_clinic'];
  const platformFee = bookingSettings?.platformFee ?? 0;
  const consultationFee = bookingSettings?.consultationFee ?? summary?.consultationFee ?? 0;
  const currency = bookingSettings?.currency ?? summary?.currency ?? 'AOA';
  const totalFee = consultationFee + platformFee;

  useEffect(() => {
    if (!summary) return;
    const types: DoctorConsultationType[] = [];
    if (summary.offersInPerson) types.push('physical');
    if (summary.offersOnline) types.push('online');
    if (types.length && !types.includes(consultationType)) {
      setConsultationType(types[0]);
    }
  }, [consultationType, summary]);

  useEffect(() => {
    setSelectedSlotId(null);
  }, [date, consultationType]);

  useEffect(() => {
    if (!authUser) return;
    setPatient((prev) => ({
      ...prev,
      full_name: prev.full_name || authUser.name || authUser.username || '',
      email: prev.email || authUser.email || '',
      phone_number: prev.phone_number || authUser.phone || '',
    }));
  }, [authUser]);

  useEffect(() => {
    if (paymentMethods.length && !paymentMethods.includes(paymentMethod)) {
      setPaymentMethod(paymentMethods[0]);
    }
  }, [paymentMethod, paymentMethods]);

  const activeStep: BookingStep = useMemo(() => {
    if (!consultationType) return 'consultation';
    if (!date || !selectedSlotId) return 'datetime';
    if (
      !patient.full_name.trim() ||
      !patient.date_of_birth ||
      !patient.phone_number.trim() ||
      !patient.email.trim() ||
      !patient.gender
    ) {
      return 'patient';
    }
    return 'confirm';
  }, [
    consultationType,
    date,
    patient.date_of_birth,
    patient.email,
    patient.full_name,
    patient.gender,
    patient.phone_number,
    selectedSlotId,
  ]);

  const reasonValid = reason.trim().length >= 10;
  const guardianValid =
    !isMinor ||
    (Boolean(patient.guardian_full_name?.trim()) &&
      Boolean(patient.guardian_phone_number?.trim()) &&
      Boolean(patient.relationship_to_patient));
  const patientValid =
    patient.full_name.trim().length > 1 &&
    Boolean(patient.date_of_birth) &&
    isValidDateOfBirth(patient.date_of_birth) &&
    calculatedAge !== null &&
    patient.phone_number.trim().length >= 6 &&
    patient.email.includes('@') &&
    Boolean(patient.gender) &&
    guardianValid;
  const canConfirm = Boolean(consultationType && date && selectedSlotId && patientValid && reasonValid);

  const buildPatientPayload = (): PatientDetailsPayload => ({
    full_name: patient.full_name.trim(),
    date_of_birth: patient.date_of_birth,
    age: calculatedAge ?? 0,
    phone_number: patient.phone_number.trim(),
    email: patient.email.trim(),
    gender: patient.gender as PatientGender,
    preferred_language: patient.preferred_language,
    emergency_contact_name: patient.emergency_contact_name,
    emergency_contact_phone: patient.emergency_contact_phone,
    ...(isMinor
      ? {
          guardian_full_name: patient.guardian_full_name?.trim(),
          guardian_phone_number: patient.guardian_phone_number?.trim(),
          relationship_to_patient: patient.relationship_to_patient,
        }
      : {}),
  });

  const handleReasonChip = (chipKey: HealthcareTranslationKey) => {
    const label = ht(chipKey);
    setReason((prev) => (prev ? `${prev.trim()} ${label}` : label));
  };

  const handleFindNextSlot = async () => {
    const result = await refetchNextSlot();
    const slot = result.data;
    if (slot) {
      setDate(slot.date);
      setSelectedSlotId(slot.id);
      setError(null);
    } else {
      setError(ht('noUpcomingSlots'));
    }
  };

  const handleSubmit = async () => {
    if (!canConfirm || !selectedSlotId) {
      setError(ht('completeRequiredFields'));
      return;
    }
    setError(null);
    try {
      const appointment = await bookAppointment({
        slotId: selectedSlotId,
        consultationType,
        reason: reason.trim(),
        patient: buildPatientPayload(),
        paymentMethod,
      }).unwrap();
      if (appointment.accessToken) {
        dispatch(
          persistBookingSession({
            accessToken: appointment.accessToken,
            refreshToken: appointment.refreshToken,
            username: patient.email.trim() || undefined,
          }),
        );
      }
      router.push(`/health/appointments/${appointment.id}/confirmed`);
    } catch (err) {
      setError(extractBookingError(err) ?? ht('bookingFailed'));
    }
  };

  if (doctorLoading || !doctor || !summary) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-500">{ht('loading')}</div>;
  }

  const locationLine = [summary.clinicName, summary.city].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-10">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          href={`/Doctors/${doctor.id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {ht('back')}
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-slate-900">{ht('bookAppointment')}</h1>
          <p className="mt-1 text-slate-600">{ht('bookingSubtitle')}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <div className="lg:hidden">
              <DoctorSummaryCard summary={summary} ht={ht} locationLine={locationLine} />
            </div>

            <StepIndicator activeStep={activeStep} ht={ht} />

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{ht('consultationType')}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ConsultationCard
                  active={consultationType === 'physical'}
                  disabled={!summary.offersInPerson}
                  icon={<Building2 className="h-6 w-6" />}
                  title={ht('inPersonVisit')}
                  description={ht('inPersonDescription')}
                  meta={`${ht('location')}: ${locationLine}`}
                  duration={ht('estimatedDuration')}
                  unavailableText={ht('inPersonUnavailable')}
                  onSelect={() => setConsultationType('physical')}
                />
                <ConsultationCard
                  active={consultationType === 'online'}
                  disabled={!summary.offersOnline}
                  icon={<Video className="h-6 w-6" />}
                  title={ht('onlineConsultation')}
                  description={ht('onlineDescription')}
                  meta={ht('onlineMeetingHint')}
                  duration={ht('estimatedDuration')}
                  unavailableText={ht('onlineUnavailable')}
                  onSelect={() => setConsultationType('online')}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{ht('selectDate')}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickDates.map((item) => {
                  const enabled = availableDaySet.size === 0 || availableDaySet.has(item.iso);
                  const label =
                    item.labelKey === 'today'
                      ? ht('today')
                      : item.labelKey === 'tomorrow'
                        ? ht('tomorrow')
                        : formatShortWeekday(item.iso);
                  return (
                    <button
                      key={item.iso}
                      type="button"
                      disabled={!enabled && availableDaySet.size > 0}
                      onClick={() => setDate(item.iso)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                        date === item.iso
                          ? 'border-sky-600 bg-sky-600 text-white'
                          : enabled
                            ? 'border-slate-200 text-slate-700 hover:border-sky-200'
                            : 'cursor-not-allowed border-slate-100 text-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-sm font-semibold text-slate-600">{ht('calendarPicker')}</label>
                <input
                  type="date"
                  value={date}
                  min={quickDates[0]?.iso}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />
                {daysLoading ? <p className="mt-2 text-sm text-slate-500">{ht('loading')}</p> : null}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{ht('availableSlots')}</h2>
              {slotsLoading ? (
                <p className="mt-3 text-sm text-slate-500">{ht('loadingSlots')}</p>
              ) : !date ? (
                <p className="mt-3 text-sm text-slate-500">{ht('selectDate')}</p>
              ) : availableSlots.length === 0 ? (
                <EmptySlotsState
                  date={date}
                  doctorName={summary.fullName}
                  ht={ht}
                  onFindNext={() => void handleFindNextSlot()}
                  onChangeType={() =>
                    setConsultationType(consultationType === 'physical' ? 'online' : 'physical')
                  }
                  nextSlotDate={nextSlot?.date}
                />
              ) : (
                <div className="mt-4 space-y-5">
                  {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                    const periodSlots = groupedSlots[period];
                    if (!periodSlots.length) return null;
                    return (
                      <div key={period}>
                        <p className="mb-2 text-sm font-semibold text-slate-600">{ht(period)}</p>
                        <div className="flex flex-wrap gap-2">
                          {periodSlots.map((slot) => {
                            const active = selectedSlotId === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setSelectedSlotId(slot.id)}
                                className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                                  active
                                    ? 'border-sky-600 bg-sky-600 text-white'
                                    : 'border-slate-200 text-slate-700 hover:border-sky-200'
                                }`}
                              >
                                {slot.startTime}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {selectedSlot ? (
                    <p className="text-sm font-semibold text-sky-700">
                      {ht('selectedSlot')}: {selectedSlot.startTime} – {selectedSlot.endTime}
                    </p>
                  ) : null}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{ht('patientDetails')}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label={ht('patientFullName')} required>
                  <input
                    value={patient.full_name}
                    onChange={(e) => setPatient((p) => ({ ...p, full_name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </Field>
                <Field label={ht('dateOfBirth')} required>
                  <input
                    type="date"
                    value={patient.date_of_birth}
                    max={formatIsoDate(new Date())}
                    onChange={(e) => setPatient((p) => ({ ...p, date_of_birth: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </Field>
                <Field label={ht('age')}>
                  <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                    {calculatedAge !== null
                      ? formatAgeLabel(calculatedAge, ht('yearsOld'))
                      : ht('ageAutoCalculated')}
                  </div>
                </Field>
                <Field label={ht('gender')} required>
                  <select
                    value={patient.gender}
                    onChange={(e) =>
                      setPatient((p) => ({
                        ...p,
                        gender: e.target.value as PatientGender | '',
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    <option value="">{ht('selectOption')}</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {ht(option)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={ht('phoneNumber')} required>
                  <input
                    value={patient.phone_number}
                    onChange={(e) => setPatient((p) => ({ ...p, phone_number: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </Field>
                <Field label={ht('emailAddress')} required>
                  <input
                    type="email"
                    value={patient.email}
                    onChange={(e) => setPatient((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </Field>
                <Field label={ht('preferredLanguage')} required>
                  <select
                    value={patient.preferred_language ?? 'en'}
                    onChange={(e) =>
                      setPatient((p) => ({
                        ...p,
                        preferred_language: e.target.value as PatientDetailsPayload['preferred_language'],
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </Field>
              </div>

              {isMinor ? (
                <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <h3 className="font-semibold text-amber-900">{ht('guardianDetails')}</h3>
                  <p className="mt-1 text-sm text-amber-800">{ht('guardianRequired')}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label={ht('guardianFullName')} required>
                      <input
                        value={patient.guardian_full_name ?? ''}
                        onChange={(e) =>
                          setPatient((p) => ({ ...p, guardian_full_name: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      />
                    </Field>
                    <Field label={ht('guardianPhone')} required>
                      <input
                        value={patient.guardian_phone_number ?? ''}
                        onChange={(e) =>
                          setPatient((p) => ({ ...p, guardian_phone_number: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      />
                    </Field>
                    <Field label={ht('guardianRelationship')} required>
                      <select
                        value={patient.relationship_to_patient ?? ''}
                        onChange={(e) =>
                          setPatient((p) => ({
                            ...p,
                            relationship_to_patient: e.target.value as GuardianRelationship,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      >
                        <option value="">{ht('selectOption')}</option>
                        {GUARDIAN_RELATIONSHIPS.map((option) => (
                          <option key={option} value={option}>
                            {ht(option)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{ht('reasonForVisit')}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {REASON_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleReasonChip(chip)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-700"
                  >
                    {ht(chip)}
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={ht('reasonPlaceholder')}
                className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">{ht('reasonHelper')}</p>
              {!reasonValid && reason.length > 0 ? (
                <p className="mt-1 text-xs text-amber-600">{ht('reasonMinLength')}</p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{ht('paymentMethod')}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                      paymentMethod === method
                        ? 'border-sky-600 bg-sky-50 text-sky-700'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {ht(method)}
                  </button>
                ))}
              </div>
            </section>

            <div className="lg:hidden">
              <AppointmentSummaryCard
                summary={summary}
                consultationType={consultationType}
                date={date}
                selectedSlot={selectedSlot}
                locationLine={locationLine}
                consultationFee={consultationFee}
                platformFee={platformFee}
                totalFee={totalFee}
                currency={currency}
                patientName={patient.full_name}
                patientDateOfBirth={patient.date_of_birth}
                patientAge={calculatedAge}
                ht={ht}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="button"
              disabled={booking || !canConfirm}
              onClick={() => void handleSubmit()}
              className="hidden w-full rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 py-3.5 text-sm font-bold text-white disabled:opacity-60 lg:block"
            >
              {booking ? ht('loading') : ht('confirmBooking')}
            </button>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="hidden lg:block">
              <DoctorSummaryCard summary={summary} ht={ht} locationLine={locationLine} />
            </div>
            <div className="hidden lg:block">
              <AppointmentSummaryCard
                summary={summary}
                consultationType={consultationType}
                date={date}
                selectedSlot={selectedSlot}
                locationLine={locationLine}
                consultationFee={consultationFee}
                platformFee={platformFee}
                totalFee={totalFee}
                currency={currency}
                patientName={patient.full_name}
                patientDateOfBirth={patient.date_of_birth}
                patientAge={calculatedAge}
                ht={ht}
              />
            </div>
            <BookingPolicyCard ht={ht} />
            <SupportCard
              consultationType={consultationType}
              ht={ht}
              clinicPhone={summary?.phoneNumber ?? doctor?.phoneNumber ?? ''}
              onOpenChat={() => setSupportChatOpen(true)}
            />
          </aside>
        </div>
      </div>

      <LiveSupportChatPanel
        open={supportChatOpen}
        onClose={() => setSupportChatOpen(false)}
        doctorId={doctorId}
        doctorName={summary?.fullName ?? doctor?.name ?? ''}
        ht={ht}
      />

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg lg:hidden">
        <button
          type="button"
          disabled={booking || !canConfirm}
          onClick={() => void handleSubmit()}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 py-3.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {booking ? ht('loading') : ht('confirmBooking')}
        </button>
      </div>
    </div>
  );
}

function DoctorSummaryCard({
  summary,
  ht,
  locationLine,
}: {
  summary: ReturnType<typeof doctorToBookingSummary>;
  ht: (key: HealthcareTranslationKey) => string;
  locationLine: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
          {summary.profileImage ? (
            <Image src={summary.profileImage} alt={summary.fullName} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <Stethoscope className="h-8 w-8" />
            </div>
          )}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">{summary.fullName}</p>
          <p className="text-sky-700">{summary.specialty}</p>
          {summary.clinicName ? <p className="text-sm text-slate-500">{summary.clinicName}</p> : null}
          {summary.isVerified ? (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <BadgeCheck className="h-4 w-4" />
              {ht('verifiedDoctor')}
            </p>
          ) : null}
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {summary.rating.toFixed(1)} · {summary.reviewsCount} {ht('reviews')}
          </p>
          <p className="text-sm text-slate-600">
            {summary.yearsExperience} {ht('yearsExperience')}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-4 w-4" />
            {locationLine || `${summary.city}, ${summary.country}`}
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{ht('consultationFee')}</p>
        <p className="text-2xl font-bold text-slate-900">
          {summary.consultationFee} {summary.currency}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {summary.offersInPerson ? (
          <span className="rounded-full bg-sky-50 px-2 py-1 font-semibold text-sky-700">{ht('inPerson')}</span>
        ) : null}
        {summary.offersOnline ? (
          <span className="rounded-full bg-cyan-50 px-2 py-1 font-semibold text-cyan-700">{ht('online')}</span>
        ) : null}
      </div>
    </section>
  );
}

function ConsultationCard({
  active,
  disabled,
  icon,
  title,
  description,
  meta,
  duration,
  unavailableText,
  onSelect,
}: {
  active: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
  duration: string;
  unavailableText: string;
  onSelect: () => void;
}) {
  if (disabled) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 opacity-70">
        <div className="text-slate-400">{icon}</div>
        <p className="mt-2 font-bold text-slate-500">{title}</p>
        <p className="mt-1 text-sm text-slate-400">{unavailableText}</p>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-2xl border p-4 text-left transition ${
        active ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-100' : 'border-slate-200 hover:border-sky-200'
      }`}
    >
      <div className={active ? 'text-sky-700' : 'text-slate-500'}>{icon}</div>
      <p className="mt-2 font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <p className="mt-2 text-xs text-slate-500">{meta}</p>
      <p className="mt-1 text-xs font-semibold text-slate-600">{duration}</p>
    </button>
  );
}

function EmptySlotsState({
  date,
  doctorName,
  ht,
  onFindNext,
  onChangeType,
  nextSlotDate,
}: {
  date: string;
  doctorName: string;
  ht: (key: HealthcareTranslationKey) => string;
  onFindNext: () => void;
  onChangeType: () => void;
  nextSlotDate?: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">
      <p className="font-semibold text-amber-900">
        {ht('noSlotsTitle')} {formatDisplayDate(date)}
      </p>
      <p className="mt-2 text-sm text-amber-800">
        {doctorName} {ht('noSlotsBody')}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onFindNext}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm"
        >
          {ht('findNextSlot')}
          {nextSlotDate ? ` (${formatShortWeekday(nextSlotDate)})` : ''}
        </button>
        <button
          type="button"
          onClick={onChangeType}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          {ht('changeConsultationType')}
        </button>
        <Link
          href="/contact"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          {ht('contactSupport')}
        </Link>
        <Link
          href="/Doctors"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
        >
          {ht('chooseAnotherDoctor')}
        </Link>
      </div>
    </div>
  );
}

function AppointmentSummaryCard({
  summary,
  consultationType,
  date,
  selectedSlot,
  locationLine,
  consultationFee,
  platformFee,
  totalFee,
  currency,
  patientName,
  patientDateOfBirth,
  patientAge,
  ht,
}: {
  summary: ReturnType<typeof doctorToBookingSummary>;
  consultationType: DoctorConsultationType;
  date: string;
  selectedSlot: { startTime: string; endTime: string } | null;
  locationLine: string;
  consultationFee: number;
  platformFee: number;
  totalFee: number;
  currency: string;
  patientName: string;
  patientDateOfBirth: string;
  patientAge: number | null;
  ht: (key: HealthcareTranslationKey) => string;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{ht('appointmentSummary')}</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <SummaryRow label={ht('doctorLabel')} value={summary.fullName} />
        {patientName ? <SummaryRow label={ht('patientLabel')} value={patientName} /> : null}
        {patientDateOfBirth ? (
          <SummaryRow label={ht('dateOfBirth')} value={formatDisplayDate(patientDateOfBirth)} />
        ) : null}
        {patientAge !== null ? (
          <SummaryRow label={ht('age')} value={formatAgeLabel(patientAge, ht('yearsOld'))} />
        ) : null}
        <SummaryRow
          label={ht('consultationType')}
          value={consultationType === 'online' ? ht('online') : ht('inPerson')}
        />
        <SummaryRow label={ht('dateLabel')} value={date ? formatDisplayDate(date) : '—'} />
        <SummaryRow
          label={ht('timeLabel')}
          value={selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : '—'}
        />
        <SummaryRow
          label={ht('location')}
          value={consultationType === 'online' ? ht('onlineConsultation') : locationLine || '—'}
        />
        <SummaryRow label={ht('consultationFee')} value={`${consultationFee} ${currency}`} />
        <SummaryRow label={ht('platformFee')} value={`${platformFee} ${currency}`} />
      </dl>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{ht('total')}</p>
        <p className="text-2xl font-bold text-slate-900">
          {totalFee} {currency}
        </p>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function BookingPolicyCard({ ht }: { ht: (key: HealthcareTranslationKey) => string }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 font-bold text-slate-900">
        <Calendar className="h-5 w-5 text-sky-600" />
        {ht('bookingPolicy')}
      </h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
        <li>{ht('policyHour')}</li>
        <li>{ht('policyBreak')}</li>
        <li>{ht('policyArrive')}</li>
        <li>{ht('policyOnlineLink')}</li>
        <li>{ht('policyCancel')}</li>
      </ul>
    </section>
  );
}

function SupportCard({
  consultationType,
  ht,
  clinicPhone,
  onOpenChat,
}: {
  consultationType: DoctorConsultationType;
  ht: (key: HealthcareTranslationKey) => string;
  clinicPhone: string;
  onOpenChat: () => void;
}) {
  const dialNumber = clinicPhone.replace(/[^\d+]/g, '');

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-slate-900">{ht('needHelp')}</h3>
      <p className="mt-1 text-sm text-slate-600">{ht('contactKudyaSupport')}</p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onOpenChat}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-sky-200"
        >
          <MessageCircle className="h-4 w-4" />
          {ht('chatSupport')}
        </button>
        {dialNumber ? (
          <a
            href={`tel:${dialNumber}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-sky-200"
          >
            <Phone className="h-4 w-4" />
            {ht('callDoctor')}
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">
            <Headphones className="h-4 w-4" />
            {ht('callDoctor')}
          </span>
        )}
      </div>
      {consultationType === 'online' ? (
        <p className="mt-4 text-xs text-slate-500">{ht('onlineTechCheck')}</p>
      ) : null}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-slate-600">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}
