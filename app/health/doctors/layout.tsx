import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { buildPageMetadata } from '@/configs/seo';
import type { SupportedLocale } from '@/configs/translations';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('app_lang')?.value || 'en') as SupportedLocale;
  return buildPageMetadata('healthDoctors', '/health/doctors', locale);
}

export default function HealthDoctorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
