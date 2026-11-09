'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BellRing, Bike, ShoppingBag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { useGetPartnerOrdersQuery } from '../partnerApi';
import { PARTNER_TABS, STATUS_LABELS, STATUS_STYLES, TAB_LABELS, minutesSince, waitingLabel } from '../labels';
import type { PartnerTab } from '../types';

export default function PartnerOrdersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get('tab') as PartnerTab | null;
  const tab: PartnerTab = requested && PARTNER_TABS.includes(requested) ? requested : 'new';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const orders = useGetPartnerOrdersQuery({ tab, page, q: search || undefined }, { pollingInterval: 20_000 });
  const lastNew = useRef<number | null>(null);
  const [alert, setAlert] = useState(false);

  const newCount = orders.data?.counts.new;
  useEffect(() => {
    if (newCount === undefined) return;
    if (lastNew.current !== null && newCount > lastNew.current) setAlert(true);
    lastNew.current = newCount;
  }, [newCount]);

  const selectTab = (next: PartnerTab) => {
    setPage(1);
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t('fpOrders', 'Orders')}</h1>
        <input
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder={t('fpSearchOrder', 'Order number (KD-123)')}
          aria-label={t('fpSearchOrder', 'Order number (KD-123)')}
          className="w-56 rounded-full border border-slate-200 px-4 py-2 text-sm"
        />
      </div>

      {alert ? (
        <button
          type="button"
          onClick={() => {
            setAlert(false);
            selectTab('new');
          }}
          className="flex w-full items-center gap-2 rounded-xl bg-food px-4 py-3 text-left text-sm font-semibold text-white shadow"
          role="alert"
        >
          <BellRing className="h-5 w-5" aria-hidden />
          {t('fpNewOrderAlert', 'New order received — tap to review')}
        </button>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {PARTNER_TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => selectTab(key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              tab === key ? 'bg-kudya text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            {t(...TAB_LABELS[key])}
            {orders.data ? (
              <span className={`ml-2 rounded-full px-1.5 text-xs ${tab === key ? 'bg-white/20' : key === 'new' && orders.data.counts.new ? 'bg-food text-white' : 'bg-slate-100'}`}>
                {orders.data.counts[key]}
              </span>
            ) : null}
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
        <>
          <ul className="grid gap-3 md:grid-cols-2">
            {orders.data.results.map((order) => {
              const [key, fallback] = STATUS_LABELS[order.status] ?? ['', order.status_label];
              const waiting = minutesSince(order.created_at);
              return (
                <li key={order.id}>
                  <Link
                    href={`/partner/food/orders/${order.id}`}
                    className={`block rounded-2xl bg-white p-4 shadow-sm ring-1 hover:ring-kudya ${order.status === 'new' ? 'ring-food' : 'ring-slate-100'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-900">{order.number}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status] ?? ''}`}>
                        {key ? t(key, fallback) : fallback}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-600">
                      {Number(order.item_count)} × · {order.items_preview.join(', ')}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        {order.fulfilment_type === 'pickup' ? <ShoppingBag className="h-3.5 w-3.5" aria-hidden /> : <Bike className="h-3.5 w-3.5" aria-hidden />}
                        {order.fulfilment_type === 'pickup' ? t('fpPickup', 'Pickup') : t('fpDelivery', 'Delivery')}
                      </span>
                      <span>{order.customer_name}</span>
                      <span>{t(...waitingLabel(waiting))}</span>
                      {order.prep_estimate_minutes ? <span>{t('fpPrepEstimate', 'Prep {minutes} min', { minutes: order.prep_estimate_minutes })}</span> : null}
                      <span className="ml-auto font-semibold text-slate-900">{order.total}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              disabled={!orders.data.previous}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm disabled:opacity-40"
            >
              {t('fpPrevious', 'Previous')}
            </button>
            <button
              type="button"
              disabled={!orders.data.next}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm disabled:opacity-40"
            >
              {t('fpNext', 'Next')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
