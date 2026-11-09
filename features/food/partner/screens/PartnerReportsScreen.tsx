'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { downloadV1File } from '../../api/baseQuery';
import { foodErrorMessage } from '../../api/foodApi';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel, StatCard } from '../../components/WorkspaceShell';
import { formatMoney } from '../../lib/money';
import { useGetPartnerReportQuery } from '../partnerApi';

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function PartnerReportsScreen() {
  const { t, languageCode } = useTranslation();
  const [from, setFrom] = useState(isoDaysAgo(29));
  const [to, setTo] = useState(isoDaysAgo(0));
  const report = useGetPartnerReportQuery({ from, to });
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const download = async (kind: 'csv' | 'pdf') => {
    setDownloadError(null);
    try {
      await downloadV1File('/food/partner/reports/', { from, to, export: kind }, `kudya-report-${from}-${to}.${kind}`);
    } catch {
      setDownloadError(t('fpDownloadFailed', 'The export could not be downloaded.'));
    }
  };

  const data = report.data;
  const money = (value: string | undefined) => (value === undefined ? '—' : formatMoney(value, data?.currency, languageCode));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t('fpReports', 'Reports')}</h1>
        <div className="flex flex-wrap items-end gap-2 text-sm">
          <label className="space-y-1">
            <span className="text-xs text-slate-500">{t('fpFrom', 'From')}</span>
            <input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="block rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-slate-500">{t('fpTo', 'To')}</span>
            <input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className="block rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <button type="button" onClick={() => void download('csv')} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold">
            <Download className="h-4 w-4" aria-hidden /> CSV
          </button>
          <button type="button" onClick={() => void download('pdf')} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold">
            <Download className="h-4 w-4" aria-hidden /> PDF
          </button>
        </div>
      </div>
      {downloadError ? <p className="text-sm text-red-600">{downloadError}</p> : null}

      {report.isLoading || report.isFetching ? (
        <FoodSkeletonGrid count={4} />
      ) : report.isError || !data ? (
        <FoodError message={foodErrorMessage(report.error, t('foodLoadFailed', 'We could not load this right now.'))} onRetry={report.refetch} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t('fpOrders', 'Orders')} value={data.summary.orders} hint={t('fpCompletedCancelled', '{completed} completed · {cancelled} cancelled', { completed: data.summary.completed, cancelled: data.summary.cancelled })} />
            <StatCard label={t('fpRevenue', 'Revenue')} value={money(data.summary.revenue)} tone="good" />
            <StatCard label={t('fpAvgPrep', 'Average preparation')} value={data.summary.average_prep_minutes !== null ? `${data.summary.average_prep_minutes} min` : '—'} />
            <StatCard label={t('fpDiscounts', 'Discounts')} value={money(data.summary.discounts)} />
            {data.summary.net_earnings !== undefined ? (
              <>
                <StatCard label={t('fpPlatformFee', 'Kudya commission')} value={money(data.summary.commissions)} />
                <StatCard label={t('fpNet', 'Your earnings')} value={money(data.summary.net_earnings)} tone="good" />
                <StatCard label={t('fpPaidOut', 'Paid out')} value={money(data.summary.paid_out)} />
                <StatCard label={t('fpOutstandingPayouts', 'Outstanding payouts')} value={money(data.summary.outstanding)} tone="food" />
              </>
            ) : null}
            <StatCard label={t('fpRefunds', 'Refund requests')} value={data.summary.refunds_requested} hint={money(data.summary.refunds_amount)} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title={t('fpDaily', 'Daily orders')}>
              {data.daily.length === 0 ? (
                <FoodEmpty title={t('fpNoOrdersInRange', 'No orders in this period')} />
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-1">{t('fpDate', 'Date')}</th>
                      <th>{t('fpOrders', 'Orders')}</th>
                      <th>{t('fpTabCancelled', 'Cancelled / rejected')}</th>
                      <th className="text-right">{t('fpRevenue', 'Revenue')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.daily.map((row) => (
                      <tr key={row.date}>
                        <td className="py-1">{row.date}</td>
                        <td>{row.orders}</td>
                        <td>{row.cancelled}</td>
                        <td className="text-right">{money(row.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
            <Panel title={t('fpBestSellers', 'Best-selling meals')}>
              {data.best_sellers.length === 0 ? (
                <FoodEmpty title={t('fpNoSalesYet', 'No sales yet.')} />
              ) : (
                <ol className="space-y-1 text-sm">
                  {data.best_sellers.map((row, index) => (
                    <li key={row.name} className="flex justify-between gap-3">
                      <span>
                        {index + 1}. {row.name} <span className="text-slate-400">×{Number(row.quantity)}</span>
                      </span>
                      <span>{money(row.revenue)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
