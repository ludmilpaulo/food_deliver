'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel, StatCard } from '../../components/WorkspaceShell';
import { useGetFoodReportQuery } from '../adminApi';

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function AdminReportsScreen() {
  const { t } = useTranslation();
  const [from, setFrom] = useState(isoDaysAgo(29));
  const [to, setTo] = useState(isoDaysAgo(0));
  const report = useGetFoodReportQuery({ from, to });
  const data = report.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t('faReports', 'Financial reports')}</h1>
        <div className="flex gap-2 text-sm">
          <input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('fpFrom', 'From')} />
          <input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('fpTo', 'To')} />
        </div>
      </div>
      {report.isLoading || report.isFetching ? (
        <FoodSkeletonGrid count={6} />
      ) : report.isError || !data ? (
        <FoodError onRetry={report.refetch} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t('faGov', 'Gross order value')} value={data.gross_order_value} hint={t('faOrdersCount', '{completed} completed of {orders}', { completed: data.completed, orders: data.orders })} />
            <StatCard label={t('faNetRevenue', 'Net platform revenue')} value={data.net_platform_revenue} tone="good" />
            <StatCard label={t('faRestaurantEarnings', 'Restaurant earnings')} value={data.restaurant_earnings} />
            <StatCard label={t('faCourierEarnings', 'Courier earnings')} value={data.courier_earnings} />
            <StatCard label={t('faCommissionTotal', 'Commission')} value={data.restaurant_commission} />
            <StatCard label={t('fpDiscounts', 'Discounts')} value={data.discounts} />
            <StatCard label={t('faDeliveryFees', 'Delivery fees')} value={data.delivery_fees} />
            <StatCard label={t('faRefunded', 'Refunded')} value={data.refunds.refunded_amount} hint={t('faRefundsPending', '{count} pending', { count: data.refunds.pending })} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title={t('faPayouts', 'Restaurant payouts')}>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt>{t('fpPaidOut', 'Paid out')}</dt><dd>{data.payouts.paid_out}</dd></div>
                <div className="flex justify-between"><dt>{t('fpOutstandingPayouts', 'Outstanding payouts')}</dt><dd>{data.payouts.outstanding}</dd></div>
              </dl>
            </Panel>
            <Panel title={t('faReconciliation', 'Payment reconciliation')}>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt>{t('faOnlineOrders', 'Completed online orders')}</dt><dd>{data.reconciliation.online_order_total}</dd></div>
                <div className="flex justify-between"><dt>{t('faVerifiedPayments', 'Verified payments')}</dt><dd>{data.reconciliation.verified_payments_total}</dd></div>
                <div className={`flex justify-between font-semibold ${Number(data.reconciliation.difference) === 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  <dt>{t('faDifference', 'Difference')}</dt>
                  <dd>{data.reconciliation.difference}</dd>
                </div>
              </dl>
              {data.reconciliation.orders_without_verified_payment.length ? (
                <p className="text-sm text-red-600">
                  {t('faUnverifiedOrders', 'Orders without a verified payment:')}{' '}
                  {data.reconciliation.orders_without_verified_payment.map((id) => (
                    <Link key={id} href={`/admin/food/orders/${id}`} className="mr-2 underline">
                      KD-{id}
                    </Link>
                  ))}
                </p>
              ) : (
                <p className="text-xs text-emerald-700">{t('faReconciled', 'Every completed online order has a verified payment.')}</p>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
