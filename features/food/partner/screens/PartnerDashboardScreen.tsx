'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel, StatCard } from '../../components/WorkspaceShell';
import { formatMoney } from '../../lib/money';
import { useGetPartnerDashboardQuery, useUpdatePartnerStoreMutation } from '../partnerApi';
import { useCan } from '../PartnerWorkspace';
import { TAB_LABELS } from '../labels';

export default function PartnerDashboardScreen() {
  const { t, languageCode } = useTranslation();
  const canOrders = useCan('view_orders');
  const canStore = useCan('manage_store');
  const dashboard = useGetPartnerDashboardQuery(undefined, { pollingInterval: 30_000 });
  const [updateStore, { isLoading: saving }] = useUpdatePartnerStoreMutation();

  if (dashboard.isLoading) return <FoodSkeletonGrid count={6} />;
  if (dashboard.isError || !dashboard.data) return <FoodError onRetry={dashboard.refetch} />;
  const data = dashboard.data;
  const money = (value: string) => formatMoney(value, data.currency, languageCode);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t('fpToday', 'Today')}</h1>
        {canStore ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => void updateStore({ accepting_orders: !data.accepting_orders })}
            className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
              data.accepting_orders ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {data.accepting_orders ? t('fpPauseOrders', 'Pause new orders') : t('fpResumeOrders', 'Resume orders')}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('fpTodayOrders', "Today's orders")} value={data.today.orders} />
        <StatCard label={t('fpRevenueToday', 'Revenue today')} value={money(data.today.revenue)} tone="good" />
        <StatCard
          label={t('fpRating', 'Customer rating')}
          value={data.rating.average !== null ? `${data.rating.average} ★` : '—'}
          hint={t('fpRatingCount', '{count} ratings', { count: data.rating.count })}
        />
        {data.outstanding_payouts !== undefined ? (
          <StatCard label={t('fpOutstandingPayouts', 'Outstanding payouts')} value={money(data.outstanding_payouts)} tone="food" />
        ) : (
          <StatCard label={t('fpCompletedToday', 'Completed today')} value={data.today.completed} />
        )}
      </div>

      {canOrders ? (
        <Panel
          title={t('fpOpenOrders', 'Open orders')}
          action={
            <Link href="/partner/food/orders" className="text-sm font-semibold text-kudya hover:underline">
              {t('fpGoToBoard', 'Open order board')}
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(['new', 'accepted', 'preparing', 'ready', 'with_courier'] as const).map((tab) => (
              <Link
                key={tab}
                href={`/partner/food/orders?tab=${tab}`}
                className={`rounded-xl p-3 ring-1 ring-slate-100 hover:ring-kudya ${tab === 'new' && data.open.new ? 'bg-food-soft' : 'bg-slate-50'}`}
              >
                <p className="text-xs text-slate-500">{t(...TAB_LABELS[tab])}</p>
                <p className="text-xl font-bold text-slate-900">{data.open[tab]}</p>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
            <p>{t('fpCompletedToday', 'Completed today')}: <b>{data.today.completed}</b></p>
            <p>{t('fpCancelledToday', 'Cancelled today')}: <b>{data.today.cancelled}</b></p>
          </div>
        </Panel>
      ) : null}

      <Panel title={t('fpPopularProducts', 'Popular products (30 days)')}>
        {data.popular_products.length === 0 ? (
          <p className="text-sm text-slate-500">{t('fpNoSalesYet', 'No sales yet.')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">{t('fpProduct', 'Product')}</th>
                <th>{t('fpQuantity', 'Quantity')}</th>
                <th className="text-right">{t('fpRevenue', 'Revenue')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.popular_products.map((row) => (
                <tr key={row.name}>
                  <td className="py-2 font-medium text-slate-900">{row.name}</td>
                  <td>{Number(row.quantity)}</td>
                  <td className="text-right">{money(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
