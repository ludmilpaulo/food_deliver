import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '@/configs/seo';

type Props = {
  params: Promise<{ doctorId: string }>;
};

async function fetchDoctorName(doctorId: string): Promise<{ name: string; specialty: string; city: string } | null> {
  const base = process.env.NEXT_PUBLIC_BASE_API || 'https://kudya-api.onrender.com';
  try {
    const res = await fetch(`${base}/api/doctors/${doctorId}/`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      name?: string;
      specialty_name?: string;
      city_name?: string | null;
    };
    return {
      name: data.name ?? 'Doctor',
      specialty: data.specialty_name ?? 'Healthcare',
      city: data.city_name ?? '',
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doctorId } = await params;
  const doctor = await fetchDoctorName(doctorId);
  const path = `/health/doctors/${doctorId}`;
  const url = `${SITE_URL}${path}`;

  if (!doctor) {
    const title = 'Doctor Profile | Kudya Healthcare';
    const description = 'View doctor profile and book an appointment on Kudya.';
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { title: `${title} | ${SITE_NAME}`, description, url, siteName: SITE_NAME, type: 'profile' },
    };
  }

  const location = doctor.city ? ` in ${doctor.city}` : '';
  const title = `Dr. ${doctor.name} | ${doctor.specialty}${location}`;
  const description = `Book an appointment with Dr. ${doctor.name}, ${doctor.specialty}${location}.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'profile',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default function DoctorDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
