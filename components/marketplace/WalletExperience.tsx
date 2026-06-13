'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/hooks/useTranslation';
import LocationFilterBar from '@/components/location/LocationFilterBar';
import { useLocationFilter } from '@/contexts/LocationContext';
import type { RootState } from '@/redux/store';
import {
  useGetWalletHistoryQuery,
  useGetWalletQuery,
  useTopUpWalletMutation,
} from '@/redux/slices/marketplaceApi';

export default function WalletExperience() {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const { country } = useLocationFilter();
  const currency = country?.currency ?? 'AOA';
  const { data: wallet, isLoading, refetch } = useGetWalletQuery(currency, { skip: !token });
  const { data: transactions = [] } = useGetWalletHistoryQuery(undefined, { skip: !token });
  const [topUpWallet, { isLoading: toppingUp }] = useTopUpWalletMutation();
  const [amount, setAmount] = useState('1000');
  const [message, setMessage] = useState<string | null>(null);

  const handleTopUp = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setMessage(null);
    try {
      await topUpWallet({ amount: Number(amount), currency }).unwrap();
      setMessage(t('topUpSuccess', 'Wallet topped up successfully.'));
      refetch();
    } catch {
      setMessage(t('topUpFailed', 'Could not top up wallet.'));
    }
  };

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

      <form onSubmit={handleTopUp} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-100 bg-white p-5">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          {t('topUpAmount', 'Top-up amount')}
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={toppingUp}
          className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
        >
          {t('topUp', 'Top up')}
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

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
