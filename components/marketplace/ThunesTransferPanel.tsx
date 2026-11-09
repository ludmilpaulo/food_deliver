'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from '@/hooks/useTranslation';
import { buildBeneficiary, fieldLabel, fieldOptions, type TransferSection } from '@/lib/transferFields';
import {
  fetchTransfer,
  fetchTransfers,
  fetchTransferDestinations,
  requestTransferQuote,
  sendMoneyTransfer,
  verifyTransferBeneficiary,
} from '@/services/transferApi';
import type { MoneyTransferRow, TransferDestination, TransferQuote, TransferVerification } from '@/types/payments';

const SECTIONS: TransferSection[] = ['credit_party_identifier', 'beneficiary'];

function detailOf(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    if (detail) return detail;
  }
  return fallback;
}

type Props = { currency: string };

export default function ThunesTransferPanel({ currency }: Props) {
  const { t } = useTranslation();
  const [destinations, setDestinations] = useState<TransferDestination[] | null>(null);
  const [history, setHistory] = useState<MoneyTransferRow[]>([]);
  const [payerId, setPayerId] = useState('');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [choice, setChoice] = useState<Record<TransferSection, number>>({ credit_party_identifier: 0, beneficiary: 0 });
  const [values, setValues] = useState<Record<string, string>>({});
  const [verification, setVerification] = useState<TransferVerification | null>(null);
  const [pin, setPin] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<MoneyTransferRow | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => globalThis.crypto.randomUUID());

  useEffect(() => {
    fetchTransferDestinations()
      .then(setDestinations)
      .catch(() => setDestinations([]));
    fetchTransfers()
      .then(setHistory)
      .catch(() => setHistory([]));
  }, []);

  const destination = destinations?.find((row) => row.payer_id === payerId) ?? null;
  const options = useMemo(() => fieldOptions(quote?.required_fields ?? destination?.required_fields), [quote, destination]);
  const expired = quote ? new Date(quote.expires_at).getTime() <= Date.now() : false;

  const resetQuote = () => {
    setQuote(null);
    setVerification(null);
    setConfirmed(false);
    setResult(null);
  };

  const getQuote = async () => {
    if (!destination) return;
    setBusy(true);
    setError('');
    resetQuote();
    try {
      setQuote(
        await requestTransferQuote({
          payer_id: destination.payer_id,
          amount,
          currency,
          destination_currency: destination.currency,
        }),
      );
      setIdempotencyKey(globalThis.crypto.randomUUID());
    } catch (err) {
      setError(detailOf(err, t('transferQuoteFailed', 'A quote could not be created.')));
    } finally {
      setBusy(false);
    }
  };

  const beneficiary = () => buildBeneficiary(options, choice, values);

  const verify = async () => {
    if (!destination) return;
    setBusy(true);
    setError('');
    try {
      setVerification(await verifyTransferBeneficiary(destination.payer_id, beneficiary()));
    } catch (err) {
      setError(detailOf(err, t('transferVerifyFailed', 'The account could not be checked.')));
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!quote) return;
    setBusy(true);
    setError('');
    try {
      const sent = await sendMoneyTransfer(
        { quote_id: quote.id, beneficiary: beneficiary(), pin, confirmed: true },
        idempotencyKey,
      );
      setResult(sent);
      setPin('');
      setHistory((rows) => [sent, ...rows.filter((row) => row.id !== sent.id)]);
    } catch (err) {
      setError(detailOf(err, t('transferSendFailed', 'The transfer could not be sent.')));
    } finally {
      setBusy(false);
    }
  };

  const refresh = async (id: number) => {
    try {
      const row = await fetchTransfer(id);
      setHistory((rows) => rows.map((item) => (item.id === id ? row : item)));
      if (result?.id === id) setResult(row);
    } catch {
      setError(t('transferRefreshFailed', 'The transfer status could not be refreshed.'));
    }
  };

  const statusText = (row: MoneyTransferRow) => {
    if (row.beneficiary_received) return t('transferDelivered', 'Delivered to the beneficiary');
    if (row.reversed_to_wallet) return t('transferReversed', 'Not delivered. The money was returned to your wallet.');
    if (row.open_rfi) return t('transferNeedsInfo', 'More information is needed. Kudya compliance will contact you.');
    return t('transferInProgress', 'In progress. It is not delivered until the payer confirms.');
  };

  if (destinations === null) {
    return <p className="mt-2 text-sm text-slate-500">{t('loading', 'Loading…')}</p>;
  }
  if (destinations.length === 0) return null;

  const canSend = Boolean(quote) && !expired && confirmed && pin.length >= 4 && !busy;

  return (
    <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-4">
      <h2 className="text-lg font-semibold">{t('transferTitle', 'Send money abroad')}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-slate-600">{t('transferDestination', 'Destination')}</span>
          <select
            value={payerId}
            onChange={(event) => {
              setPayerId(event.target.value);
              setValues({});
              setChoice({ credit_party_identifier: 0, beneficiary: 0 });
              resetQuote();
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          >
            <option value="">{t('transferChooseDestination', 'Choose a destination')}</option>
            {destinations.map((row) => (
              <option key={row.payer_id} value={row.payer_id}>
                {row.name} · {row.country} · {row.currency}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate-600">
            {t('transferAmount', 'Amount')} ({currency})
          </span>
          <input
            type="number"
            min={destination?.min_amount ?? undefined}
            max={destination?.max_amount ?? undefined}
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              resetQuote();
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => void getQuote()}
        disabled={!destination || !(Number(amount) > 0) || busy}
        className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {t('transferGetQuote', 'Get quote')}
      </button>

      {quote ? (
        <dl className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-2"><dt>{t('transferFee', 'Fee')}</dt><dd>{quote.fee} {quote.source_currency}</dd></div>
          <div className="flex justify-between gap-2"><dt>{t('transferTotal', 'Total from wallet')}</dt><dd className="font-semibold">{quote.total_debit} {quote.source_currency}</dd></div>
          <div className="flex justify-between gap-2"><dt>{t('transferReceives', 'Beneficiary receives')}</dt><dd className="font-semibold">{quote.destination_amount} {quote.destination_currency}</dd></div>
          <div className="flex justify-between gap-2"><dt>{t('transferRate', 'Exchange rate')}</dt><dd>{quote.fx_rate || '—'}</dd></div>
          <p className={`sm:col-span-2 ${expired ? 'text-red-600' : 'text-slate-500'}`}>
            {expired
              ? t('transferQuoteExpired', 'This quote has expired. Get a new quote.')
              : `${t('transferQuoteValid', 'Quote valid until')} ${new Date(quote.expires_at).toLocaleTimeString()}`}
          </p>
        </dl>
      ) : null}

      {quote && !expired ? (
        <div className="mt-4 space-y-4">
          {SECTIONS.map((section) =>
            options[section].length ? (
              <fieldset key={section} className="space-y-2">
                <legend className="text-sm font-medium">
                  {section === 'beneficiary'
                    ? t('transferBeneficiaryDetails', 'Beneficiary details')
                    : t('transferAccountDetails', 'Account details')}
                </legend>
                {options[section].length > 1 ? (
                  <select
                    aria-label={t('transferDetailType', 'Detail type')}
                    value={choice[section]}
                    onChange={(event) => {
                      setChoice((prev) => ({ ...prev, [section]: Number(event.target.value) }));
                      setVerification(null);
                    }}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                  >
                    {options[section].map((group, index) => (
                      <option key={group.join('+')} value={index}>
                        {group.map(fieldLabel).join(' + ')}
                      </option>
                    ))}
                  </select>
                ) : null}
                <div className="grid gap-2 sm:grid-cols-2">
                  {(options[section][choice[section]] ?? []).map((name) => {
                    const key = `${section}.${name}`;
                    return (
                      <label key={key} className="text-sm">
                        <span className="text-slate-600">{fieldLabel(name)}</span>
                        <input
                          value={values[key] ?? ''}
                          onChange={(event) => {
                            setValues((prev) => ({ ...prev, [key]: event.target.value }));
                            setVerification(null);
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                        />
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null,
          )}
          <button
            type="button"
            onClick={() => void verify()}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            {t('transferVerify', 'Check account')}
          </button>
          {verification ? (
            <p className={`text-sm ${verification.verified ? 'text-emerald-700' : 'text-amber-700'}`} role="status">
              {verification.verified ? t('transferVerified', 'The account was confirmed by the payer.') : verification.warning}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-slate-600">{t('transferPin', 'Wallet PIN')}</span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              />
            </label>
            <label className="flex items-start gap-2 text-sm sm:mt-6">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />
              <span>
                {t('transferConfirm', 'I confirm the beneficiary details and that {amount} will leave my wallet.', {
                  amount: `${quote.total_debit} ${quote.source_currency}`,
                })}
              </span>
            </label>
          </div>
          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {t('transferSend', 'Send money')}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm" role="status">
          {statusText(result)}
        </p>
      ) : null}

      {history.length ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold">{t('transferHistory', 'Recent transfers')}</h3>
          <ul className="mt-2 space-y-2">
            {history.map((row) => (
              <li key={row.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span>
                    {row.amount} {row.currency} → {row.destination_amount} {row.destination_currency}
                  </span>
                  <span className="text-slate-500">{new Date(row.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-600">{statusText(row)}</span>
                  {!row.beneficiary_received && !row.reversed_to_wallet ? (
                    <button type="button" onClick={() => void refresh(row.id)} className="text-xs font-medium underline">
                      {t('checkAgain', 'Check again')}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
