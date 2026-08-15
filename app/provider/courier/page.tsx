'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/hooks/useTranslation';
import { baseAPI } from '@/services/types';
import { readAuthToken } from '@/lib/authToken';
import type { RootState } from '@/redux/store';
import withPartnerAuth from '@/components/PartnerRouteGuard';

type DeliveryRow = {
  id: number;
  delivery_number?: string;
  status?: string;
  pickup_address?: string;
  dropoff_address?: string;
};

function PartnerCourierPage() {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token) || readAuthToken();
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${baseAPI}/api/deliveries/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('failed');
        const data: unknown = await res.json();
        if (Array.isArray(data)) return data as DeliveryRow[];
        if (data && typeof data === 'object' && 'results' in data) {
          const results = (data as { results?: DeliveryRow[] }).results;
          return Array.isArray(results) ? results : [];
        }
        return [];
      })
      .then(setRows)
      .catch(() => setError(t('unableToLoadData', 'Unable to load data')));
  }, [token, t]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{t('sendPackage', 'Send Package')}</h1>
      <p className="mt-2 text-slate-600">
        {t(
          'courierWebHint',
          'Live GPS accept/complete happens in the Kudya Partner mobile app. This page lists jobs visible to your driver account.',
        )}
      </p>
      {error ? <p className="mt-4 text-red-600">{error}</p> : null}
      <ul className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <li className="rounded-xl border bg-white p-4 text-slate-500">{t('noResultsFound', 'No results found')}</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className="rounded-xl border bg-white p-4">
              <p className="font-semibold">{row.delivery_number || `#${row.id}`}</p>
              <p className="text-sm text-slate-500">{row.status}</p>
              <p className="text-sm text-slate-600">
                {row.pickup_address} → {row.dropoff_address}
              </p>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}

export default withPartnerAuth(PartnerCourierPage);
