'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/hooks/useTranslation';
import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '@/services/types';
import type { RootState } from '@/redux/store';

type BusinessAccount = {
  id: number;
  name: string;
  category_slug: string;
  dashboard_route: string;
  status: string;
  is_active: boolean;
};

export default function BusinessExperience() {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token) || readAuthToken();
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`${baseAPI}/api/v1/businesses/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('failed');
        return res.json() as Promise<BusinessAccount[]>;
      })
      .then((data) => {
        if (!cancelled) setAccounts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError(t('unableToLoadData', 'Unable to load data'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{t('business', 'Business')}</h1>
      <p className="mt-2 text-slate-600">
        {t('businessSubtitle', 'Manage the businesses linked to your Kudya account.')}
      </p>

      {loading ? <p className="mt-6 text-slate-500">{t('loading', 'Loading...')}</p> : null}
      {error ? <p className="mt-6 text-red-600">{error}</p> : null}

      {token && !loading && accounts.length === 0 ? (
        <p className="mt-6 text-slate-600">{t('noBusinessAccounts', 'No business accounts are linked to this user yet.')}</p>
      ) : null}

      <div className="mt-6 space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-2xl border border-slate-100 bg-white p-5">
            <h2 className="font-semibold text-slate-900">{account.name}</h2>
            <p className="text-sm text-slate-500">
              {account.category_slug} · {account.status}
            </p>
            {account.dashboard_route ? (
              <Link href={account.dashboard_route} className="mt-3 inline-block text-sm text-blue-700 underline">
                {t('openDashboard', 'Open dashboard')}
              </Link>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{t('corporateAccounts', 'Corporate accounts')}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t('corporateAccountsHint', 'Create a business record for your company. Invoicing and spend controls are not enabled yet.')}
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
