'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel, StatCard } from '../../components/WorkspaceShell';
import { useGetFoodOverviewQuery } from '../adminApi';

export default function AdminOverviewScreen() {
  const { t } = useTranslation();
  const overview = useGetFoodOverviewQuery(undefined, { pollingInterval: 60_000 });
  if (overview.isLoading) return <FoodSkeletonGrid count={6} />;
  if (overview.isError || !overview.data) return <FoodError onRetry={overview.refetch} />;
  const data = overview.data;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('faOverview', 'Overview')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label={t('faOrdersToday', 'Orders today')} value={data.orders_today} />
        <StatCard label={t('faActiveOrders', 'Active orders')} value={data.active_orders} />
        <StatCard label={t('faStuckOrders', 'Waiting over 30 min')} value={data.stuck_orders} tone={data.stuck_orders ? 'bad' : 'default'} />
        <StatCard label={t('faCancelledToday', 'Cancelled today')} value={data.cancelled_today} />
        <StatCard label={t('faPendingRefunds', 'Refunds to review')} value={data.pending_refunds} tone={data.pending_refunds ? 'food' : 'default'} />
        <StatCard label={t('faPendingRestaurants', 'Restaurants to verify')} value={data.restaurants.pending} tone={data.restaurants.pending ? 'food' : 'default'} />
      </div>
      <Panel title={t('faRestaurantsByStatus', 'Restaurants by status')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['pending', 'approved', 'suspended', 'rejected'] as const).map((status) => (
            <Link key={status} href={`/admin/food/restaurants?status=${status}`} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 hover:ring-kudya">
              <p className="text-xs text-slate-500">{t(`faStatus_${status}`, status)}</p>
              <p className="text-xl font-bold">{data.restaurants[status]}</p>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
