'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function BusinessExperience() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{t('business', 'Business')}</h1>
      <p className="mt-2 text-slate-600">
        {t(
          'businessSubtitle',
          'Create a corporate account, invite employees, manage invoices, and pay with a company wallet.',
        )}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{t('corporateAccounts', 'Corporate accounts')}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t('corporateAccountsHint', 'Order food, groceries, and services for your team with spending controls.')}
          </p>
          <Link href="/SignupScreen?account=business" className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-white">
            {t('createBusinessAccount', 'Create business account')}
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{t('becomePartner', 'Become a partner')}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t('becomePartnerHint', 'Register your restaurant, store, or service business on Kudya.')}
          </p>
          <Link href="/provider/onboarding" className="mt-4 inline-block rounded-xl border border-slate-300 px-4 py-2 text-slate-800">
            {t('providerOnboarding', 'Provider onboarding')}
          </Link>
        </div>
      </div>
    </div>
  );
}
