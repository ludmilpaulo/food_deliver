'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { HealthcareDoctor } from '@/types/healthcare';
import {
  formatDoctorAddress,
  getDirectionsLink,
  getGoogleMapsLink,
  getMapEmbedUrl,
} from '@/lib/doctorLocation';
import { useHealthcareTranslation } from '@/hooks/useHealthcareTranslation';

type Props = {
  doctor: HealthcareDoctor;
  scrollOnMount?: boolean;
};

export default function DoctorLocationSection({ doctor, scrollOnMount = false }: Props) {
  const { ht } = useHealthcareTranslation();
  const searchParams = useSearchParams();
  const locationRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = searchParams.get('section');
    if ((scrollOnMount || section === 'location') && locationRef.current) {
      locationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams, scrollOnMount]);

  const address = formatDoctorAddress(doctor);

  return (
    <section
      id="location"
      ref={locationRef}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-slate-900">{ht('location')}</h2>
      {doctor.clinicName ? (
        <p className="mt-2 font-semibold text-slate-800">{doctor.clinicName}</p>
      ) : null}
      <p className="mt-1 text-slate-600">{address || '—'}</p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <iframe
          title={`${doctor.clinicName || doctor.name} location`}
          src={getMapEmbedUrl(doctor)}
          className="h-[320px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={getGoogleMapsLink(doctor)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          {ht('openInMaps')}
        </a>
        <a
          href={getDirectionsLink(doctor)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-xl border border-sky-200 px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
        >
          {ht('getDirections')}
        </a>
      </div>
    </section>
  );
}
