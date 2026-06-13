'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProviderOnboardingPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{t('providerOnboarding', 'Provider onboarding')}</h1>
      <p className="mt-2 text-slate-600">
        {t('providerOnboardingSubtitle', 'Register your business, submit documents, and start operating once approved.')}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/SignupScreen?account=partner" className="rounded-2xl bg-slate-900 p-6 text-white">
          {t('registerBusiness', 'Register business')}
        </Link>
        <Link href="/LoginScreenUser" className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900">
          {t('providerLogin', 'Provider login')}
        </Link>
      </div>
    </div>
  );
}
