import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { buildPageMetadata } from '@/configs/seo';
import type { SupportedLocale } from '@/configs/translations';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('app_lang')?.value || 'en') as SupportedLocale;
  return buildPageMetadata('healthDoctors', '/Doctors', locale);
}

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
