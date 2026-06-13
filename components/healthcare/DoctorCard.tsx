'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star, Video, Home, CheckCircle, ChevronRight } from 'lucide-react';
import type { HealthcareDoctor } from '@/types/healthcare';
import { formatDoctorLocationLine } from '@/lib/doctorLocation';
import { useHealthcareTranslation } from '@/hooks/useHealthcareTranslation';

type Props = {
  doctor: HealthcareDoctor;
  isFavorite: boolean;
  onToggleFavorite: (doctorId: number) => void;
};

export default function DoctorCard({ doctor, isFavorite, onToggleFavorite }: Props) {
  const { ht } = useHealthcareTranslation();
  const locationLine = formatDoctorLocationLine(doctor);

  return (
    <article className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          {doctor.profilePhoto ? (
            <Image
              src={doctor.profilePhoto}
              alt={doctor.name}
              width={80}
              height={80}
              className="h-20 w-20 rounded-2xl object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <span className="text-2xl font-bold">{doctor.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full border-2 border-white bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
            <Star className="h-2.5 w-2.5 fill-white" />
            {doctor.rating}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
              {doctor.clinicName ? (
                <p className="text-sm text-slate-500">{doctor.clinicName}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onToggleFavorite(doctor.id)}
              className="rounded-full p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
              aria-label="Toggle favorite"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
              {doctor.specialtyName}
            </span>
            {doctor.isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700">
                <CheckCircle className="h-3.5 w-3.5" />
                {ht('verified')}
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            <Star className="mr-1 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {doctor.rating} ({doctor.reviewCount} {ht('reviews')})
          </p>

          <Link
            href={`/Doctors/${doctor.id}?section=location`}
            className="mt-2 inline-flex items-center gap-1 text-sm text-sky-700 underline-offset-4 hover:text-sky-900 hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            {locationLine}
          </Link>

          <div className="mt-3 flex flex-wrap gap-2">
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
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-3 sm:min-h-[80px]">
          <ChevronRight className="hidden h-5 w-5 text-slate-300 sm:block" />
          <div className="text-right">
            <p className="text-xl font-bold text-slate-900">{doctor.consultationFee}</p>
            <p className="text-xs font-medium text-slate-400">{doctor.currency}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href={`/Doctors/${doctor.id}`}
              className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              {ht('viewProfile')}
            </Link>
            <Link
              href={`/Doctors/${doctor.id}/book`}
              className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              {ht('bookAppointment')}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
