'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel } from '../../components/WorkspaceShell';
import { formatMoney } from '../../lib/money';
import { PARTNER_TABS, STATUS_LABELS, STATUS_STYLES, TAB_LABELS } from '../../partner/labels';
import type { FoodFulfilmentStatus, PartnerTab } from '../../partner/types';
import { useGetAdminOrderQuery, useGetAdminOrdersQuery } from '../adminApi';

function StatusPill({ status, fallback }: { status: string; fallback: string }) {
  const { t } = useTranslation();
  const key = status as FoodFulfilmentStatus;
  const label = STATUS_LABELS[key];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[key] ?? 'bg-slate-100'}`}>{label ? t(...label) : fallback}</span>;
}

export default function AdminOrdersScreen() {
  const { t, languageCode } = useTranslation();
  const [status, setStatus] = useState<PartnerTab | ''>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const orders = useGetAdminOrdersQuery({ status: status || undefined, q: q || undefined, page }, { pollingInterval: 30_000 });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t('faOrders', 'Orders')}</h1>
        <input
          value={q}
          onChange={(event) => {
            setPage(1);
            setQ(event.target.value);
          }}
          placeholder={t('fpSearchOrder', 'Order number (KD-123)')}
          aria-label={t('fpSearchOrder', 'Order number (KD-123)')}
          className="w-56 rounded-full border border-slate-200 px-4 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto" role="tablist">
        {(['', ...PARTNER_TABS] as Array<PartnerTab | ''>).map((key) => (
          <button
            key={key || 'all'}
            type="button"
            role="tab"
            aria-selected={status === key}
            onClick={() => {
              setPage(1);
              setStatus(key);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${status === key ? 'bg-kudya text-white' : 'bg-white ring-1 ring-slate-200'}`}
          >
            {key ? t(...TAB_LABELS[key]) : t('faAll', 'All')}
            {key && orders.data ? <span className="ml-1 opacity-70">({orders.data.counts[key] ?? 0})</span> : null}
          </button>
        ))}
      </div>
      {orders.isLoading ? (
        <FoodSkeletonGrid count={4} variant="row" />
      ) : orders.isError || !orders.data ? (
        <FoodError onRetry={orders.refetch} />
      ) : orders.data.results.length === 0 ? (
        <FoodEmpty title={t('fpNoOrdersInTab', 'No orders here right now')} />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{t('faOrder', 'Order')}</th>
                <th>{t('faRestaurant', 'Restaurant')}</th>
                <th>{t('fpCustomer', 'Customer')}</th>
                <th>{t('fpCourier', 'Courier')}</th>
                <th>{t('fpPayment', 'Payment')}</th>
                <th>{t('faStatus', 'Status')}</th>
                <th className="pr-4 text-right">{t('fpTotal', 'Total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.data.results.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/food/orders/${row.id}`} className="font-semibold text-kudya hover:underline">
                      {row.number}
                    </Link>
                    <p className="text-xs text-slate-500">{new Date(row.created_at).toLocaleString(languageCode)}</p>
                  </td>
                  <td>{row.restaurant.name}</td>
                  <td>{row.customer}</td>
                  <td>{row.courier ?? '—'}</td>
                  <td>{row.payment_method} · {row.payment_status}</td>
                  <td><StatusPill status={row.status} fallback={row.status_label} /></td>
                  <td className="pr-4 text-right">{formatMoney(row.total, row.currency, languageCode)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {orders.data ? (
        <div className="flex justify-center gap-3">
          <button type="button" disabled={!orders.data.previous} onClick={() => setPage((value) => value - 1)} className="rounded-full border px-4 py-2 text-sm disabled:opacity-40">
            {t('fpPrevious', 'Previous')}
          </button>
          <button type="button" disabled={!orders.data.next} onClick={() => setPage((value) => value + 1)} className="rounded-full border px-4 py-2 text-sm disabled:opacity-40">
            {t('fpNext', 'Next')}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AdminOrderDetailScreen({ id }: { id: number }) {
  const { t, languageCode } = useTranslation();
  const order = useGetAdminOrderQuery(id);
  if (order.isLoading) return <FoodSkeletonGrid count={3} variant="row" />;
  if (order.isError || !order.data) {
    const status = (order.error as { status?: number } | undefined)?.status;
    return status === 404 ? <FoodEmpty title={t('faNotInScope', 'Not found in your region')} /> : <FoodError onRetry={order.refetch} />;
  }
  const data = order.data;
  const money = (value: string) => formatMoney(value, data.currency, languageCode);
  return (
    <div className="space-y-5">
      <Link href="/admin/food/orders" className="inline-flex items-center gap-1 text-sm text-kudya hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {t('faBackToOrders', 'All orders')}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{data.number}</h1>
        <StatusPill status={data.status} fallback={data.status_label} />
        <span className="text-sm text-slate-500">{data.restaurant.name} · {data.fulfilment_type}</span>
      </div>
      {data.cancellation_reason ? <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{data.cancellation_reason}</p> : null}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={t('fpItems', 'Items')}>
          <ul className="space-y-1 text-sm">
            {data.lines.map((line, index) => (
              <li key={`${line.name}-${index}`} className="flex justify-between">
                <span>{Number(line.quantity)} × {line.name}</span>
                <span>{money(line.subtotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1 border-t border-slate-100 pt-2 text-sm">
            <div className="flex justify-between"><dt>{t('fpDeliveryFee', 'Delivery fee')}</dt><dd>{money(data.delivery_fee)}</dd></div>
            <div className="flex justify-between"><dt>{t('fpDiscount', 'Discount')}</dt><dd>-{money(data.discount_amount)}</dd></div>
            <div className="flex justify-between"><dt>{t('faCourierEarning', 'Courier earning')}</dt><dd>{money(data.driver_commission)}</dd></div>
            <div className="flex justify-between font-bold"><dt>{t('fpTotal', 'Total')}</dt><dd>{money(data.total)}</dd></div>
          </dl>
        </Panel>
        <Panel title={t('faParties', 'People and delivery')}>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt>{t('fpCustomer', 'Customer')}</dt><dd>{data.customer}</dd></div>
            <div className="flex justify-between"><dt>{t('fpCourier', 'Courier')}</dt><dd>{data.courier ?? '—'}</dd></div>
            <div className="flex justify-between"><dt>{t('fpAddress', 'Address')}</dt><dd className="text-right">{data.address || '—'}</dd></div>
            {data.delivery_request ? (
              <div className="flex justify-between"><dt>{t('faDeliveryRequest', 'Delivery request')}</dt><dd>{data.delivery_request.number} · {data.delivery_request.status}</dd></div>
            ) : null}
          </dl>
        </Panel>
        <Panel title={t('fpPayment', 'Payment')}>
          {data.payments.length === 0 ? (
            <p className="text-sm text-slate-500">{data.payment_method === 'cash' ? t('foodCashOnDelivery', 'Cash on delivery') : t('faNoPayments', 'No payment attempts')}</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {data.payments.map((payment) => (
                <li key={payment.reference} className="flex justify-between gap-2">
                  <span className="font-mono text-xs">{payment.reference}</span>
                  <span>{payment.method} · {payment.status} · {money(payment.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          {data.refunds.length ? (
            <p className="text-sm text-slate-600">
              {t('faRefunds', 'Refunds')}: {data.refunds.map((refund) => `${refund.status} ${money(refund.amount)}`).join(', ')}
            </p>
          ) : null}
        </Panel>
        <Panel title={t('fpTimeline', 'Timeline')}>
          <ol className="space-y-1 text-sm">
            {data.timeline.map((event, index) => (
              <li key={`${event.status}-${index}`} className="flex justify-between">
                <span>{event.label}</span>
                <span className="text-xs text-slate-400">{new Date(event.at).toLocaleString(languageCode)}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
