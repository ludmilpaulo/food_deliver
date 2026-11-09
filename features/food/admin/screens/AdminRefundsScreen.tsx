'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { foodErrorMessage } from '../../api/foodApi';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { useDecideRefundMutation, useGetAdminRefundsQuery } from '../adminApi';
import type { AdminRefundRow } from '../types';

const STATUSES: Array<AdminRefundRow['status']> = ['pending', 'approved', 'refunded', 'rejected'];

function RefundRow({ refund }: { refund: AdminRefundRow }) {
  const { t, languageCode } = useTranslation();
  const [decide, { isLoading }] = useDecideRefundMutation();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const act = async (action: 'approve' | 'reject' | 'mark_refunded') => {
    setError(null);
    try {
      await decide({ id: refund.id, action, note: note.trim() }).unwrap();
    } catch (err) {
      setError(foodErrorMessage(err, t('faDecisionFailed', 'The decision could not be saved.')));
    }
  };
  return (
    <li className="space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/food/orders/${refund.order_id}`} className="font-semibold text-kudya hover:underline">
          {refund.order_number}
        </Link>
        <span className="text-sm text-slate-600">{refund.restaurant} · {refund.customer}</span>
        <span className="ml-auto text-sm font-semibold">{refund.amount}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold">{t(`foodRefund_${refund.status}`, refund.status)}</span>
      </div>
      <p className="text-sm text-slate-700">
        <b>{refund.reason}</b> {refund.details}
      </p>
      <p className="text-xs text-slate-400">{new Date(refund.created_at).toLocaleString(languageCode)}</p>
      {refund.status === 'pending' || refund.status === 'approved' ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            placeholder={t('faRefundNote', 'Note (required to reject)')}
            aria-label={t('faRefundNote', 'Note (required to reject)')}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
          />
          {refund.status === 'pending' ? (
            <button type="button" disabled={isLoading} onClick={() => void act('approve')} className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
              {t('faApprove', 'Approve')}
            </button>
          ) : (
            <button type="button" disabled={isLoading} onClick={() => void act('mark_refunded')} className="rounded-full bg-kudya px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
              {t('faMarkRefunded', 'Mark refunded')}
            </button>
          )}
          <button type="button" disabled={isLoading} onClick={() => void act('reject')} className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600 disabled:opacity-50">
            {t('faReject', 'Reject')}
          </button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </li>
  );
}

export default function AdminRefundsScreen() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<AdminRefundRow['status']>('pending');
  const refunds = useGetAdminRefundsQuery({ status });
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">{t('faRefunds', 'Refunds')}</h1>
      <div className="flex gap-2" role="tablist">
        {STATUSES.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={status === key}
            onClick={() => setStatus(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${status === key ? 'bg-kudya text-white' : 'bg-white ring-1 ring-slate-200'}`}
          >
            {t(`foodRefund_${key}`, key)}
          </button>
        ))}
      </div>
      {refunds.isLoading ? (
        <FoodSkeletonGrid count={3} variant="row" />
      ) : refunds.isError || !refunds.data ? (
        <FoodError onRetry={refunds.refetch} />
      ) : refunds.data.results.length === 0 ? (
        <FoodEmpty title={t('faNoRefunds', 'No refund requests here')} />
      ) : (
        <ul className="space-y-3">
          {refunds.data.results.map((refund) => (
            <RefundRow key={refund.id} refund={refund} />
          ))}
        </ul>
      )}
    </div>
  );
}
