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
import {
  useCreateTransferMutation,
  useCreateWithdrawalMutation,
  useCreateVasPurchaseMutation,
  useGetFinancialAccountQuery,
  useGetRemittanceCorridorsQuery,
} from '@/redux/slices/financialApi';

type Tab = 'balance' | 'send' | 'withdraw' | 'remittance' | 'services';

export default function WalletExperience() {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const { country } = useLocationFilter();
  const [tab, setTab] = useState<Tab>('balance');
  const { data: methods } = useGetPaymentMethodsQuery(undefined, { skip: !token });
  const currency = methods?.currency ?? country?.currency ?? 'ZAR';
  const { data: wallet, isLoading, refetch } = useGetWalletQuery(currency, { skip: !token });
  const { data: financial } = useGetFinancialAccountQuery(currency, { skip: !token });
  const { data: transactions = [] } = useGetWalletHistoryQuery(undefined, { skip: !token });
  const { data: corridors = [] } = useGetRemittanceCorridorsQuery(undefined, { skip: !token || tab !== 'remittance' });
  const [topUp, { isLoading: toppingUp }] = useTopUpWalletMutation();
  const [createTransfer, { isLoading: transferring }] = useCreateTransferMutation();
  const [createWithdrawal, { isLoading: withdrawing }] = useCreateWithdrawalMutation();
  const [createVas, { isLoading: vasBusy }] = useCreateVasPurchaseMutation();

  const [amount, setAmount] = useState('100');
  const [phone, setPhone] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [pin, setPin] = useState('');
  const [method, setMethod] = useState('');
  const [payoutDetails, setPayoutDetails] = useState('{}');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableMethods = (methods?.methods ?? []).filter((item) => item.available);
  const selectedMethod = method || methods?.default_method || availableMethods[0]?.code || 'card';
  const displayWallet = financial?.primary_wallet ?? wallet;

  const resetFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleTopUp = async () => {
    resetFeedback();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(t('invalidAmount'));
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
      setMessage(t('topUpStarted'));
      refetch();
    } catch (err) {
      setError(extractError(err) || t('topUpFailed'));
    }
  };

  const handleTransfer = async () => {
    resetFeedback();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(t('invalidAmount'));
      return;
    }
    try {
      await createTransfer({
        amount: parsed,
        currency,
        recipient_phone: recipientPhone,
        pin: pin || undefined,
        idempotency_key: `transfer-${Date.now()}`,
      }).unwrap();
      setMessage(t('transferSuccess'));
      refetch();
    } catch (err) {
      setError(extractError(err) || t('failed'));
    }
  };

  const handleWithdraw = async () => {
    resetFeedback();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0 || !pin) {
      setError(t('invalidAmount'));
      return;
    }
    let details: Record<string, unknown> = {};
    try {
      details = JSON.parse(payoutDetails) as Record<string, unknown>;
    } catch {
      setError(t('invalidAmount'));
      return;
    }
    try {
      await createWithdrawal({
        amount: parsed,
        currency,
        method: selectedMethod,
        payout_details: details,
        pin,
        idempotency_key: `withdraw-${Date.now()}`,
      }).unwrap();
      setMessage(t('withdrawalPending'));
      refetch();
    } catch (err) {
      setError(extractError(err) || t('failed'));
    }
  };

  const handleVas = async (serviceType: string) => {
    resetFeedback();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(t('invalidAmount'));
      return;
    }
    try {
      await createVas({
        service_type: serviceType,
        amount: parsed,
        currency,
        country_code: country?.code ?? 'ZA',
        recipient: recipientPhone,
        pin: pin || undefined,
      }).unwrap();
      setMessage(t('completed'));
      refetch();
    } catch (err) {
      setError(extractError(err) || t('failed'));
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">{t('walletTitle')}</h1>
        <p className="mt-4 text-slate-600">{t('loginRequired', 'Please sign in to continue.')}</p>
        <Link href="/LoginScreenUser?next=/wallet" className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-white">
          {t('login', 'Login')}
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'balance', label: t('walletTitle') },
    { id: 'send', label: t('sendMoney') },
    { id: 'withdraw', label: t('withdraw') },
    { id: 'remittance', label: t('remittance') },
    { id: 'services', label: t('airtime') },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <LocationFilterBar className="mb-6" />
      <h1 className="text-3xl font-bold text-slate-900">{t('walletTitle')}</h1>
      <p className="mt-1 text-slate-600">{t('walletSubtitle')}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">{t('availableBalance')}</p>
        <p className="mt-2 text-4xl font-bold">
          {isLoading ? '...' : `${displayWallet?.currency ?? currency} ${Number(displayWallet?.available_balance ?? 0).toFixed(2)}`}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {t('pending')}: {displayWallet?.currency ?? currency} {Number(displayWallet?.pending_balance ?? 0).toFixed(2)}
        </p>
        {displayWallet?.reserved_balance ? (
          <p className="mt-1 text-sm text-slate-400">
            {t('reservedBalance')}: {displayWallet.currency} {Number(displayWallet.reserved_balance).toFixed(2)}
          </p>
        ) : null}
      </div>

      {tab === 'balance' && (
        <form
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            void handleTopUp();
          }}
        >
          <label className="flex-1 text-sm text-slate-600">
            {t('topUpAmount')}
            <input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900" />
          </label>
          {availableMethods.length > 0 ? (
            <label className="flex-1 text-sm text-slate-600">
              {t('paymentMethod', 'Payment method')}
              <select value={selectedMethod} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900">
                {availableMethods.map((item) => (
                  <option key={item.code} value={item.code}>{item.label}</option>
                ))}
              </select>
            </label>
          ) : null}
          <button type="submit" disabled={toppingUp} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60">
            {toppingUp ? t('loading', 'Loading...') : t('topUp')}
          </button>
        </form>
      )}

      {tab === 'send' && (
        <form className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-white p-4" onSubmit={(e) => { e.preventDefault(); void handleTransfer(); }}>
          <label className="block text-sm text-slate-600">
            {t('recipientPhone')}
            <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="block text-sm text-slate-600">
            {t('topUpAmount')}
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="block text-sm text-slate-600">
            {t('walletPin')}
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <button type="submit" disabled={transferring} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60">
            {t('sendMoney')}
          </button>
        </form>
      )}

      {tab === 'withdraw' && (
        <form className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-white p-4" onSubmit={(e) => { e.preventDefault(); void handleWithdraw(); }}>
          <label className="block text-sm text-slate-600">
            {t('topUpAmount')}
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="block text-sm text-slate-600">
            {t('payoutMethod')}
            <input value={selectedMethod} readOnly className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50" />
          </label>
          <label className="block text-sm text-slate-600">
            Payout details (JSON)
            <textarea value={payoutDetails} onChange={(e) => setPayoutDetails(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs" rows={3} />
          </label>
          <label className="block text-sm text-slate-600">
            {t('walletPin')}
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <button type="submit" disabled={withdrawing} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60">
            {t('withdraw')}
          </button>
        </form>
      )}

      {tab === 'remittance' && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-sm text-slate-600">{t('remittance')}</p>
          {corridors.length === 0 ? (
            <p className="mt-2 text-slate-500">{t('featureUnavailable')}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {corridors.map((c) => (
                <li key={c.id} className="rounded-xl border border-slate-100 px-3 py-2 text-sm">
                  {c.origin_country} → {c.destination_country} ({c.source_currency}/{c.destination_currency}) — {c.payout_method}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'services' && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { type: 'airtime', label: t('airtime') },
            { type: 'data', label: t('buyData') },
            { type: 'electricity', label: t('payElectricity') },
            { type: 'utility', label: t('payBills') },
            { type: 'voucher', label: t('buyVoucher') },
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              disabled={vasBusy}
              onClick={() => void handleVas(item.type)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              {item.label}
            </button>
          ))}
          <label className="col-span-full block text-sm text-slate-600">
            {t('recipientPhone')}
            <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="col-span-full block text-sm text-slate-600">
            {t('topUpAmount')}
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
        </div>
      )}

      {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">{t('transactions')}</h2>
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
                  <p className="font-semibold text-slate-800">{tx.amount} {tx.currency}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const payload = err.data;
    if (payload && typeof payload === 'object' && 'detail' in payload) {
      const value = payload.detail;
      if (typeof value === 'string') return value;
    }
  }
  return '';
}
