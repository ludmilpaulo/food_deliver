'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useGetFinancialAdminOverviewQuery } from '@/redux/slices/financialApi';

export default function FinancialAdmin() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetFinancialAdminOverviewQuery();

  if (isLoading) return <p className="text-slate-600">{t('loading', 'Loading...')}</p>;
  if (error) return <p className="text-red-600">{t('failed')}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">{t('financialOverview')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('transactions')} value={String(data?.total_journals ?? 0)} />
        <StatCard label={t('completed')} value={String(data?.completed ?? 0)} />
        <StatCard label={t('pending')} value={String(data?.pending ?? 0)} />
        <StatCard label={t('failed')} value={String(data?.failed ?? 0)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label={t('totalDebit')} value={String(data?.total_volume ?? '0')} />
        <StatCard label={t('fee')} value={String(data?.total_fees ?? '0')} />
      </div>
      <section>
        <h3 className="font-semibold text-slate-800">{t('reconciliation')}</h3>
        <p className="text-sm text-slate-600">{t('riskAlerts')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-slate-800">{t('settlement')}</h3>
        <p className="text-sm text-slate-600">{t('frozenAccounts')}</p>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
