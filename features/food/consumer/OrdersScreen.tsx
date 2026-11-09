'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { resolveMediaUrl } from '@/lib/resolveMediaUrl';
import { useGetOrdersQuery, useGetRefundsQuery } from '../api/foodApi';
import FoodHeader from '../components/FoodHeader';
import FoodImage from '../components/FoodImage';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../components/FoodStates';
import { useReorder } from '../hooks/useReorder';
import { formatMoney } from '../lib/money';
import type { OrderListItem } from '../types';

type Tab = 'active' | 'completed' | 'cancelled';

const REFUND_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-sky-100 text-sky-800',
  refunded: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
};

function OrderRow({ order, onReorder, busy }: { order: OrderListItem; onReorder: (id: number) => void; busy: boolean }) {
  const { t, languageCode } = useTranslation();
  return (
    <li className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <FoodImage src={order.store.logo ? resolveMediaUrl(order.store.logo) : null} alt="" className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">{order.store.name}</p>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="truncate text-sm text-slate-500">{order.items_preview.join(', ')}</p>
        <p className="text-xs text-slate-400">
          {order.number} · {new Date(order.created_at).toLocaleString(languageCode)} ·{' '}
          {formatMoney(order.total, order.currency, languageCode)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        {order.can_reorder ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onReorder(order.id)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-kudya disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            {t('foodReorder', 'Reorder')}
          </button>
        ) : null}
        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex items-center gap-1 rounded-full bg-kudya px-3 py-1.5 text-xs font-semibold text-white"
        >
          {order.status === 'delivered' || order.status === 'cancelled' ? t('foodViewDetails', 'Details') : t('foodTrack', 'Track')}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </li>
  );
}

export default function OrdersScreen() {
  const { t, languageCode } = useTranslation();
  const [tab, setTab] = useState<Tab>('active');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<OrderListItem[]>([]);
  const orders = useGetOrdersQuery({ status: tab, vertical: 'food', page });
  const refunds = useGetRefundsQuery();
  const reorder = useReorder();

  useEffect(() => {
    const results = orders.data?.results;
    if (!results) return;
    setRows((current) =>
      page === 1 ? results : [...current, ...results.filter((row) => !current.some((existing) => existing.id === row.id))],
    );
  }, [orders.data, page]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setPage(1);
    setRows([]);
  };

  const tabs: Array<[Tab, string]> = [
    ['active', t('foodOrdersCurrent', 'Current')],
    ['completed', t('foodOrdersPast', 'Past')],
    ['cancelled', t('foodOrdersCancelled', 'Cancelled')],
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <FoodHeader backHref="/food" title={t('foodMyOrders', 'My orders')} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('foodMyOrders', 'My orders')}</h1>
        <div className="flex gap-2" role="tablist">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => switchTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === key ? 'bg-kudya text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {reorder.error ? <FoodError message={reorder.error} /> : null}
        {reorder.result?.unavailable.length ? (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">{t('foodReorderPartial', 'Some items could not be added:')}</p>
            <ul className="list-disc pl-5">
              {reorder.result.unavailable.map((row, index) => (
                <li key={`${row.product_id}-${index}`}>
                  {row.name} — {row.reason}
                </li>
              ))}
            </ul>
            {reorder.result.lines.length ? (
              <Link href="/food/cart" className="mt-2 inline-block font-semibold text-kudya underline">
                {t('foodViewCart', 'View cart')}
              </Link>
            ) : null}
          </div>
        ) : null}

        {orders.isLoading && page === 1 ? (
          <FoodSkeletonGrid count={3} variant="row" />
        ) : orders.isError ? (
          <FoodError onRetry={orders.refetch} />
        ) : rows.length === 0 && !orders.isFetching ? (
          <FoodEmpty
            title={
              tab === 'active'
                ? t('foodNoCurrentOrders', 'No orders in progress')
                : tab === 'completed'
                  ? t('foodNoPastOrders', 'No past orders yet')
                  : t('foodNoCancelledOrders', 'No cancelled orders')
            }
            action={
              <Link href="/food/restaurants" className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white">
                {t('foodBrowseRestaurants', 'Browse restaurants')}
              </Link>
            }
          />
        ) : (
          <>
            <ul className="space-y-3">
              {rows.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  busy={reorder.isLoading}
                  onReorder={(id) => void reorder.run(id, t('foodReorderFailed', 'We could not reorder this.'))}
                />
              ))}
            </ul>
            {orders.data?.next ? (
              <div className="text-center">
                <button
                  type="button"
                  disabled={orders.isFetching}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-full border border-kudya px-6 py-2 text-sm font-semibold text-kudya disabled:opacity-50"
                >
                  {orders.isFetching ? t('foodLoading', 'Loading…') : t('foodShowMore', 'Show more')}
                </button>
              </div>
            ) : null}
          </>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">{t('foodRefunds', 'Refund requests')}</h2>
          {refunds.isLoading ? (
            <FoodSkeletonGrid count={1} variant="row" />
          ) : refunds.isError ? (
            <FoodError onRetry={refunds.refetch} />
          ) : !refunds.data?.length ? (
            <p className="text-sm text-slate-500">{t('foodNoRefunds', 'You have not requested any refunds.')}</p>
          ) : (
            <ul className="space-y-2">
              {refunds.data.map((refund) => (
                <li key={refund.id} className="flex items-center justify-between rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-100">
                  <Link href={`/account/orders/${refund.order_id}`} className="font-medium text-slate-900 hover:underline">
                    {refund.order_number} · {refund.store_name}
                  </Link>
                  <span className="flex items-center gap-2">
                    {formatMoney(refund.amount, refund.currency, languageCode)}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${REFUND_STYLES[refund.status] ?? ''}`}>
                      {t(`foodRefund_${refund.status}`, refund.status)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
