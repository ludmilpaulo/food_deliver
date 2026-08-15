'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/hooks/useTranslation';
import LocationFilterBar from '@/components/location/LocationFilterBar';
import { useLocationFilter } from '@/contexts/LocationContext';
import type { RootState } from '@/redux/store';
import { useGetWalletHistoryQuery, useGetWalletQuery } from '@/redux/slices/marketplaceApi';

export default function WalletExperience() {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const { country } = useLocationFilter();
  const currency = country?.currency ?? 'AOA';
  const { data: wallet, isLoading } = useGetWalletQuery(currency, { skip: !token });
  const { data: transactions = [] } = useGetWalletHistoryQuery(undefined, { skip: !token });

  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">{t('wallet', 'Wallet')}</h1>
        <p className="mt-4 text-slate-600">{t('loginRequired', 'Please sign in to continue.')}</p>
        <Link href="/LoginScreenUser?next=/wallet" className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-white">
          {t('login', 'Login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <LocationFilterBar className="mb-6" />
      <h1 className="text-3xl font-bold text-slate-900">{t('wallet', 'Wallet')}</h1>
      <div className="mt-6 rounded-3xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">{t('availableBalance', 'Available balance')}</p>
        <p className="mt-2 text-4xl font-bold">
          {isLoading ? '...' : `${wallet?.currency ?? currency} ${Number(wallet?.available_balance ?? 0).toFixed(2)}`}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {t('pending', 'Pending')}: {wallet?.currency ?? currency}{' '}
          {Number(wallet?.pending_balance ?? 0).toFixed(2)}
        </p>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        {t(
          'walletTopUpUnavailable',
          'Wallet top-up is temporarily unavailable until a payment provider is connected. Balance and history below are from the server.',
        )}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">{t('transactions', 'Transactions')}</h2>
        <div className="mt-4 space-y-3">
          {transactions.length === 0 ? (
            <p className="text-slate-500">{t('noTransactions', 'No transactions yet.')}</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">{tx.description || tx.transaction_type}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-slate-800">
                    {tx.amount} {tx.currency}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
