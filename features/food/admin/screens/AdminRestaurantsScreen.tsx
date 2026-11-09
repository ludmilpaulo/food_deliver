'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { foodErrorMessage } from '../../api/foodApi';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel } from '../../components/WorkspaceShell';
import { useDecideRestaurantMutation, useGetAdminRestaurantQuery, useGetAdminRestaurantsQuery } from '../adminApi';
import type { VerificationStatus } from '../types';

const STATUSES: VerificationStatus[] = ['pending', 'approved', 'suspended', 'rejected'];
const STATUS_STYLE: Record<VerificationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  suspended: 'bg-red-100 text-red-700',
  rejected: 'bg-slate-200 text-slate-700',
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const { t } = useTranslation();
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>{t(`faStatus_${status}`, status)}</span>;
}

export default function AdminRestaurantsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = (params.get('status') as VerificationStatus | null) ?? '';
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const restaurants = useGetAdminRestaurantsQuery({ status, q: q || undefined, page });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t('faRestaurants', 'Restaurants')}</h1>
        <input
          value={q}
          onChange={(event) => {
            setPage(1);
            setQ(event.target.value);
          }}
          placeholder={t('faSearchRestaurant', 'Search name or owner email')}
          aria-label={t('faSearchRestaurant', 'Search name or owner email')}
          className="w-64 rounded-full border border-slate-200 px-4 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto" role="tablist">
        {(['', ...STATUSES] as Array<VerificationStatus | ''>).map((key) => (
          <button
            key={key || 'all'}
            type="button"
            role="tab"
            aria-selected={status === key}
            onClick={() => {
              setPage(1);
              router.replace(key ? `${pathname}?status=${key}` : pathname);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${status === key ? 'bg-kudya text-white' : 'bg-white ring-1 ring-slate-200'}`}
          >
            {key ? t(`faStatus_${key}`, key) : t('faAll', 'All')}
            {key && restaurants.data ? <span className="ml-1 opacity-70">({restaurants.data.counts[key] ?? 0})</span> : null}
          </button>
        ))}
      </div>
      {restaurants.isLoading ? (
        <FoodSkeletonGrid count={4} variant="row" />
      ) : restaurants.isError || !restaurants.data ? (
        <FoodError onRetry={restaurants.refetch} />
      ) : restaurants.data.results.length === 0 ? (
        <FoodEmpty title={t('faNoRestaurants', 'No restaurants found')} />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{t('faRestaurant', 'Restaurant')}</th>
                <th>{t('faOwner', 'Owner')}</th>
                <th>{t('faRegion', 'Region')}</th>
                <th>{t('faOrders', 'Orders')}</th>
                <th>{t('faStatus', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {restaurants.data.results.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/food/restaurants/${row.id}`} className="font-semibold text-kudya hover:underline">
                      {row.name}
                    </Link>
                    <p className="text-xs text-slate-500">{row.cuisine}</p>
                  </td>
                  <td>{row.owner?.email ?? '—'}</td>
                  <td>{[row.city, row.country].filter(Boolean).join(', ') || '—'}</td>
                  <td>{row.order_count ?? 0}</td>
                  <td><VerificationBadge status={row.verification_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {restaurants.data ? (
        <div className="flex justify-center gap-3">
          <button type="button" disabled={!restaurants.data.previous} onClick={() => setPage((value) => value - 1)} className="rounded-full border px-4 py-2 text-sm disabled:opacity-40">
            {t('fpPrevious', 'Previous')}
          </button>
          <button type="button" disabled={!restaurants.data.next} onClick={() => setPage((value) => value + 1)} className="rounded-full border px-4 py-2 text-sm disabled:opacity-40">
            {t('fpNext', 'Next')}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AdminRestaurantDetailScreen({ id }: { id: number }) {
  const { t, languageCode } = useTranslation();
  const restaurant = useGetAdminRestaurantQuery(id);
  const [decide, { isLoading }] = useDecideRestaurantMutation();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  if (restaurant.isLoading) return <FoodSkeletonGrid count={3} variant="row" />;
  if (restaurant.isError || !restaurant.data) {
    const status = (restaurant.error as { status?: number } | undefined)?.status;
    return status === 404 ? <FoodEmpty title={t('faNotInScope', 'Not found in your region')} /> : <FoodError onRetry={restaurant.refetch} />;
  }
  const data = restaurant.data;
  const act = async (action: 'approve' | 'reject' | 'suspend' | 'reactivate') => {
    setMessage(null);
    try {
      await decide({ id, action, reason: reason.trim() }).unwrap();
      setReason('');
      setMessage(t('faDecisionSaved', 'Decision saved and recorded in the audit log.'));
    } catch (err) {
      setMessage(foodErrorMessage(err, t('faDecisionFailed', 'The decision could not be saved.')));
    }
  };
  const actions: Array<['approve' | 'reject' | 'suspend' | 'reactivate', string, string, string]> =
    data.verification_status === 'pending'
      ? [['approve', 'faApprove', 'Approve', 'bg-emerald-600 text-white'], ['reject', 'faReject', 'Reject', 'border border-red-200 text-red-600']]
      : data.verification_status === 'approved'
        ? [['suspend', 'faSuspend', 'Suspend', 'border border-red-200 text-red-600']]
        : [['reactivate', 'faReactivate', 'Approve / reactivate', 'bg-emerald-600 text-white']];

  return (
    <div className="space-y-5">
      <Link href="/admin/food/restaurants" className="inline-flex items-center gap-1 text-sm text-kudya hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {t('faBackToRestaurants', 'All restaurants')}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{data.name}</h1>
        <VerificationBadge status={data.verification_status} />
      </div>
      <Panel title={t('faDecision', 'Verification decision')}>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={500}
          rows={2}
          placeholder={t('faReasonPlaceholder', 'Reason (required to reject or suspend; shared with the restaurant)')}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {actions.map(([action, key, fallback, style]) => (
            <button key={action} type="button" disabled={isLoading} onClick={() => void act(action)} className={`rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50 ${style}`}>
              {t(key, fallback)}
            </button>
          ))}
        </div>
        {data.verification_note ? <p className="text-sm text-slate-600">{t('faLastNote', 'Last note')}: {data.verification_note}</p> : null}
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={t('faProfile', 'Profile')}>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt>{t('faOwner', 'Owner')}</dt><dd>{data.owner?.name} · {data.owner?.email}</dd></div>
            <div className="flex justify-between"><dt>{t('fpPhone', 'Phone')}</dt><dd>{data.phone}</dd></div>
            <div className="flex justify-between"><dt>{t('fpAddress', 'Address')}</dt><dd className="text-right">{data.address}</dd></div>
            <div className="flex justify-between"><dt>{t('faRegion', 'Region')}</dt><dd>{[data.city, data.country].filter(Boolean).join(', ') || '—'}</dd></div>
            <div className="flex justify-between"><dt>{t('faOrders', 'Orders')}</dt><dd>{data.stats.orders} ({data.stats.completed} / {data.stats.cancelled})</dd></div>
            <div className="flex justify-between"><dt>{t('fpRating', 'Customer rating')}</dt><dd>{data.stats.rating ?? '—'} ({data.stats.rating_count})</dd></div>
          </dl>
        </Panel>
        <Panel title={t('faDocuments', 'Verification documents')}>
          {data.license ? (
            <a href={data.license} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium text-kudya underline">
              {t('faLicense', 'Business licence')}
            </a>
          ) : null}
          {data.documents.length === 0 && !data.license ? (
            <p className="text-sm text-slate-500">{t('faNoDocuments', 'No documents uploaded yet.')}</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {data.documents.map((doc) => (
                <li key={doc.id} className="flex justify-between gap-2">
                  {doc.file ? (
                    <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-kudya underline">
                      {doc.type}
                    </a>
                  ) : (
                    <span>{doc.type}</span>
                  )}
                  <span className="text-slate-500">{doc.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={t('foodOpeningHours', 'Opening hours')}>
          <ul className="space-y-1 text-sm">
            {data.opening_hours.map((row, index) => (
              <li key={`${row.day}-${index}`} className="flex justify-between">
                <span>{row.day}</span>
                <span>{row.is_closed ? t('foodClosed', 'Closed') : `${row.from_hour} – ${row.to_hour}`}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title={t('faAuditHistory', 'Audit history')}>
          {data.audit.length === 0 ? (
            <p className="text-sm text-slate-500">{t('faNoAudit', 'No decisions recorded yet.')}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.audit.map((event, index) => (
                <li key={`${event.at}-${index}`}>
                  <p className="font-medium text-slate-900">{event.action}</p>
                  <p className="text-xs text-slate-500">
                    {event.actor ?? '—'} · {new Date(event.at).toLocaleString(languageCode)}
                    {typeof event.metadata.reason === 'string' && event.metadata.reason ? ` · ${event.metadata.reason}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
