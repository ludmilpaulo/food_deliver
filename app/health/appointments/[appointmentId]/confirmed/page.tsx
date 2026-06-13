'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CalendarPlus, CheckCircle2, MapPin, MessageCircle, Stethoscope } from 'lucide-react';
import {
  useGetHealthcareAppointmentQuery,
  useGetHealthcareDoctorQuery,
} from '@/redux/slices/healthcareApi';
import { useHealthcareTranslation } from '@/hooks/useHealthcareTranslation';
import { formatAgeLabel, formatDisplayDate } from '@/lib/bookingUtils';

export default function AppointmentConfirmedPage() {
  const params = useParams<{ appointmentId: string }>();
  const appointmentId = Number(params.appointmentId);
  const { ht } = useHealthcareTranslation();

  const { data: appointment, isLoading } = useGetHealthcareAppointmentQuery(appointmentId, {
    skip: !Number.isFinite(appointmentId),
  });

  const { data: doctor } = useGetHealthcareDoctorQuery(appointment?.doctorId ?? 0, {
    skip: !appointment?.doctorId,
  });

  if (isLoading || !appointment) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-500">{ht('loading')}</div>;
  }

  const isOnline = appointment.appointmentType === 'online';
  const locationLine = [doctor?.clinicName, doctor?.cityName].filter(Boolean).join(', ');
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Consultation with ${appointment.doctorName}`,
  )}&dates=${appointment.date.replace(/-/g, '')}T${appointment.startTime.replace(':', '')}00/${appointment.date.replace(/-/g, '')}T${appointment.endTime.replace(':', '')}00`;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{ht('bookingConfirmed')}</h1>
          <p className="mt-2 text-slate-600">
            {ht('bookingConfirmedSubtitle')} {appointment.doctorName}.
          </p>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <dl className="space-y-3 text-sm">
            {appointment.patientName ? (
              <Row label={ht('patientLabel')} value={appointment.patientName} />
            ) : null}
            {appointment.patientDateOfBirth ? (
              <Row label={ht('dateOfBirth')} value={formatDisplayDate(appointment.patientDateOfBirth)} />
            ) : null}
            {appointment.patientAge !== null ? (
              <Row
                label={ht('age')}
                value={formatAgeLabel(appointment.patientAge, ht('yearsOld'))}
              />
            ) : null}
            <Row label={ht('dateLabel')} value={formatDisplayDate(appointment.date)} />
            <Row
              label={ht('timeLabel')}
              value={`${appointment.startTime} – ${appointment.endTime}`}
            />
            <Row
              label={ht('consultationType')}
              value={isOnline ? ht('online') : ht('inPerson')}
            />
            <Row
              label={ht('location')}
              value={isOnline ? ht('onlineConsultation') : locationLine || '—'}
            />
            <Row
              label={ht('consultationFee')}
              value={`${appointment.consultationFee} ${appointment.currency}`}
            />
          </dl>
          {isOnline ? (
            <p className="mt-4 rounded-xl bg-sky-50 p-3 text-sm text-sky-800">{ht('meetingLinkLater')}</p>
          ) : null}
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-sky-200"
          >
            <CalendarPlus className="h-4 w-4" />
            {ht('addToCalendar')}
          </a>
          <Link
            href="/UserDashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white"
          >
            <Stethoscope className="h-4 w-4" />
            {ht('viewAppointment')}
          </Link>
          {!isOnline && locationLine ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLine)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-sky-200"
            >
              <MapPin className="h-4 w-4" />
              {ht('getDirections')}
            </a>
          ) : null}
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-sky-200"
          >
            <MessageCircle className="h-4 w-4" />
            {ht('messageDoctor')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
