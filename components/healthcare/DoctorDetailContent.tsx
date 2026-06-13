'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Star, Video, Home } from 'lucide-react';
import { useGetHealthcareDoctorQuery } from '@/redux/slices/healthcareApi';
import { useHealthcareTranslation } from '@/hooks/useHealthcareTranslation';
import DoctorLocationSection from './DoctorLocationSection';

type Props = {
  doctorId: number;
};

function DoctorDetailInner({ doctorId }: Props) {
  const { ht } = useHealthcareTranslation();
  const { data: doctor, isLoading, isError } = useGetHealthcareDoctorQuery(doctorId, {
    skip: !Number.isFinite(doctorId),
  });

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-500">{ht('loading')}</div>;
  }

  if (isError || !doctor) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-500">{ht('doctorsLoadFailed')}</div>;
  }

  const services = doctor.servicesOffered
    ? doctor.servicesOffered.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <section className="rounded-b-[40px] bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-4 pb-10 pt-6 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/Doctors" className="inline-flex items-center gap-2 text-sm text-sky-100 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            {ht('back')}
          </Link>

          <div className="mt-6 flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left">
            {doctor.profilePhoto ? (
              <Image
                src={doctor.profilePhoto}
                alt={doctor.name}
                width={112}
                height={112}
                className="h-28 w-28 rounded-3xl border-4 border-white/30 object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white/30 bg-white/20 text-3xl font-bold">
                {doctor.name.charAt(0)}
              </div>
            )}
            <div className="mt-4 sm:ml-6 sm:mt-0 sm:flex-1">
              <h1 className="text-3xl font-bold">{doctor.name}</h1>
              {doctor.professionalTitle ? <p className="mt-1 text-sky-100">{doctor.professionalTitle}</p> : null}
              {doctor.clinicName ? <p className="mt-1">{doctor.clinicName}</p> : null}
              <div className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                {doctor.specialtyName}
              </div>
              {doctor.isVerified ? (
                <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  {ht('verified')}
                </p>
              ) : null}
              <p className="mt-2 text-sm">
                <Star className="mr-1 inline h-4 w-4 fill-amber-300 text-amber-300" />
                {doctor.rating} ({doctor.reviewCount} {ht('reviews')})
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-6 max-w-5xl space-y-6 px-4 sm:px-6">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label={ht('experience')} value={`${doctor.yearsExperience} ${ht('yearsExperience')}`} />
            <Info label={ht('languages')} value={doctor.languages || '—'} />
            <Info
              label={ht('consultationType')}
              value={[
                doctor.physicalConsultationEnabled ? ht('inPerson') : null,
                doctor.onlineConsultationEnabled ? ht('online') : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            />
            <Info label={ht('consultationFee')} value={`${doctor.consultationFee} ${doctor.currency}`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {doctor.onlineConsultationEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                <Video className="h-3 w-3" />
                {ht('online')}
              </span>
            ) : null}
            {doctor.physicalConsultationEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
                <Home className="h-3 w-3" />
                {ht('inPerson')}
              </span>
            ) : null}
          </div>
        </section>

        {doctor.biography ? (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{ht('about')}</h2>
            <p className="mt-3 leading-7 text-slate-600">{doctor.biography}</p>
          </section>
        ) : null}

        {services.length > 0 ? (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{ht('servicesOffered')}</h2>
            <ul className="mt-3 space-y-1 text-slate-700">
              {services.map((service) => (
                <li key={service}>• {service}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <DoctorLocationSection doctor={doctor} />

        {doctor.availability && doctor.availability.length > 0 ? (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{ht('availability')}</h2>
            <div className="mt-4 space-y-2">
              {doctor.availability.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between border-b border-slate-50 py-2 text-sm">
                  <span className="font-medium text-slate-700">{slot.dayName}</span>
                  <span className="text-slate-500">
                    {slot.startTime} – {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white p-4 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">{ht('consultationFee')}</p>
            <p className="text-xl font-bold text-slate-900">
              {doctor.consultationFee} {doctor.currency}
            </p>
          </div>
          <Link
            href={`/Doctors/${doctor.id}/book`}
            className="rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-sm"
          >
            {ht('bookAppointment')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default function DoctorDetailContent({ doctorId }: Props) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading...</div>}>
      <DoctorDetailInner doctorId={doctorId} />
    </Suspense>
  );
}
