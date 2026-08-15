'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/hooks/useTranslation';
import LocationFilterBar from '@/components/location/LocationFilterBar';
import { useLocationFilter } from '@/contexts/LocationContext';
import type { RootState } from '@/redux/store';
import { useGetWalletHistoryQuery, useGetWalletQuery, useTopUpWalletMutation } from '@/redux/slices/marketplaceApi';
import { useGetPaymentMethodsQuery } from '@/redux/slices/paymentsApi';

export default function WalletExperience() {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const { country } = useLocationFilter();
  const { data: methods } = useGetPaymentMethodsQuery(undefined, { skip: !token });
  const currency = methods?.currency ?? country?.currency ?? 'ZAR';
  const { data: wallet, isLoading, refetch } = useGetWalletQuery(currency, { skip: !token });
  const { data: transactions = [] } = useGetWalletHistoryQuery(undefined, { skip: !token });
  const [topUp, { isLoading: toppingUp }] = useTopUpWalletMutation();
  const [amount, setAmount] = useState('100');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableMethods = (methods?.methods ?? []).filter((item) => item.available);
  const selectedMethod = method || methods?.default_method || availableMethods[0]?.code || 'card';

  const handleTopUp = async () => {
    setMessage(null);
    setError(null);
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(t('invalidAmount', 'Enter a valid amount.'));
      return;
    }
    try {
      const result = await topUp({
        amount: parsed,
        currency,
        method: selectedMethod,
        phone: phone || undefined,
      }).unwrap();
      if (result.authorization_url) {
        window.location.assign(result.authorization_url);
        return;
      }
      setMessage(result.customer_message || t('topUpStarted', 'Top-up created. Complete payment to credit your wallet.'));
      refetch();
    } catch (err) {
      let detail = '';
      if (err && typeof err === 'object' && 'data' in err) {
        const payload = err.data;
        if (payload && typeof payload === 'object' && 'detail' in payload) {
          const value = payload.detail;
          if (typeof value === 'string') detail = value;
        }
      }
      setError(detail || t('topUpFailed', 'Wallet top-up is unavailable until a payment provider is configured.'));
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

      <form
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void handleTopUp();
        }}
      >
        <label className="flex-1 text-sm text-slate-600">
          {t('topUpAmount', 'Top-up amount')}
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
          />
        </label>
        {availableMethods.length > 0 ? (
          <label className="flex-1 text-sm text-slate-600">
            {t('paymentMethod', 'Payment method')}
            <select
              value={selectedMethod}
              onChange={(event) => setMethod(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            >
              {availableMethods.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {availableMethods.find((item) => item.code === selectedMethod)?.requires_phone ? (
          <label className="flex-1 text-sm text-slate-600">
            EcoCash
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="2637…"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
            />
          </label>
        ) : null}
        <button
          type="submit"
          disabled={toppingUp}
          className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {toppingUp ? t('loading', 'Loading...') : t('topUp', 'Top up')}
        </button>
      </form>
      {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

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
