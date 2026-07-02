'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  fetchAdminDrivers,
  fetchOnlineDriverLocations,
  type AdminDriver,
  type AdminDriverFilters,
  type AdminLiveDriver,
} from '@/features/admin/api/adminOrdersApi';
import { baseAPI } from '@/services/types';
import { useTranslation } from '@/hooks/useTranslation';
import DriverAdminFilters from '@/components/admin/DriverAdminFilters';

const DriverLiveMap = dynamic(() => import('@/components/admin/DriverLiveMap'), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse bg-slate-100" />,
});

function formatLocationTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

const DriverList: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AdminDriverFilters>({});
  const debouncedQ = useDebouncedValue(filters.q ?? '', 400);
  const queryFilters = useMemo(
    () => ({ ...filters, q: debouncedQ || undefined }),
    [filters, debouncedQ],
  );

  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [liveDrivers, setLiveDrivers] = useState<AdminLiveDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [driverRows, liveRows] = await Promise.all([
        fetchAdminDrivers(queryFilters),
        fetchOnlineDriverLocations(queryFilters),
      ]);
      setDrivers(driverRows);
      setLiveDrivers(liveRows);
    } catch {
      setError(t('failedToFetchData', 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [queryFilters, t]);

  useEffect(() => {
    setLoading(true);
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchOnlineDriverLocations(queryFilters)
        .then(setLiveDrivers)
        .catch(() => undefined);
    }, 8000);
    return () => clearInterval(interval);
  }, [queryFilters]);

  if (loading && drivers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && drivers.length === 0) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  const onlineCount = liveDrivers.length;
  const locatedCount = liveDrivers.filter((d) => d.latitude != null && d.longitude != null).length;

  return (
    <div className="h-full w-full space-y-6 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('drivers', 'Drivers')}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {t('liveDriverMapHint', 'Live map updates every 8 seconds when drivers are online.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchData()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {t('refresh', 'Refresh')}
        </button>
      </div>

      <DriverAdminFilters filters={filters} onChange={setFilters} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <p className="font-semibold text-slate-800">{t('liveDriverLocations', 'Live driver locations')}</p>
          <p className="text-sm text-slate-600">
            {onlineCount} {t('online', 'Online')} · {locatedCount} {t('withGps', 'with GPS')} · {drivers.length}{' '}
            {t('matchingDrivers', 'matching')}
          </p>
        </div>
        <DriverLiveMap drivers={liveDrivers} />
        {onlineCount === 0 ? (
          <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            {t('noOnlineDrivers', 'No drivers are online right now for the selected filters.')}
          </p>
        ) : locatedCount === 0 ? (
          <p className="border-t border-slate-100 px-4 py-3 text-sm text-amber-700">
            {t(
              'onlineDriversNoGps',
              'Drivers are online but GPS has not been received yet. Ask them to enable location on the phone.',
            )}
          </p>
        ) : null}
      </section>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="mt-0 w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('name', 'Name')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('country', 'Country')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('city', 'City')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('phone', 'Phone')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('plate', 'Plate')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('vehicleType', 'Vehicle')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('orders', 'Orders')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('status', 'Status')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('lastLocation', 'Last location')}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-slate-500">
                  {t('noData', 'No data')}
                </td>
              </tr>
            )}
            {drivers.map((driver) => (
              <tr key={driver.id} className="border-b border-blue-gray-50 p-4">
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                      {driver.avatar ? (
                        <Image
                          src={driver.avatar.startsWith('http') ? driver.avatar : `${baseAPI}${driver.avatar}`}
                          alt={driver.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                          {driver.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-normal">{driver.name}</div>
                      {driver.verification_status ? (
                        <div className="text-xs capitalize text-slate-500">
                          {driver.verification_status.replace(/_/g, ' ')}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="border-y border-blue-gray-100 p-4 text-sm">
                  {driver.country_name || '—'}
                </td>
                <td className="border-y border-blue-gray-100 p-4 text-sm">
                  {driver.city_name || '—'}
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="font-normal">{driver.phone || '—'}</div>
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="font-normal">{driver.plate || '—'}</div>
                </td>
                <td className="border-y border-blue-gray-100 p-4 text-sm capitalize">
                  {driver.vehicle_type?.replace(/_/g, ' ') || '—'}
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="font-normal">{driver.total_orders}</div>
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <span
                    className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                      driver.is_online ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {driver.is_online ? t('online', 'Online') : t('offline', 'Offline')}
                  </span>
                </td>
                <td className="border-y border-blue-gray-100 p-4 text-sm text-slate-600">
                  {driver.latitude != null && driver.longitude != null
                    ? `${driver.latitude.toFixed(5)}, ${driver.longitude.toFixed(5)}`
                    : '—'}
                  {driver.last_location_update ? (
                    <div className="text-xs text-slate-400">{formatLocationTime(driver.last_location_update)}</div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverList;
