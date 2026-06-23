'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchAdminDrivers, type AdminDriver } from '@/features/admin/api/adminOrdersApi';
import { baseAPI } from '@/services/types';
import { useTranslation } from '@/hooks/useTranslation';

const DriverList: React.FC = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAdminDrivers();
      setDrivers(response);
    } catch {
      setError(t('failedToFetchData', 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="h-full w-full p-4">
      <h1 className="text-2xl font-bold mb-4">{t('drivers', 'Drivers')}</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="mt-4 w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('name', 'Name')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('phone', 'Phone')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('address', 'Address')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('plate', 'Plate')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('orders', 'Orders')}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t('status', 'Status')}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-slate-500">
                  {t('noData', 'No data')}
                </td>
              </tr>
            )}
            {drivers.map((driver) => (
              <tr key={driver.id} className="p-4 border-b border-blue-gray-50">
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 rounded-full overflow-hidden w-10 h-10">
                      {driver.avatar ? (
                        <Image
                          src={driver.avatar.startsWith('http') ? driver.avatar : `${baseAPI}${driver.avatar}`}
                          alt={driver.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                          {driver.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="font-normal">{driver.name}</div>
                  </div>
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="font-normal">{driver.phone || '—'}</div>
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="font-normal">{driver.address || '—'}</div>
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="font-normal">{driver.plate || '—'}</div>
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="font-normal">{driver.total_orders}</div>
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      driver.is_online ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {driver.is_online ? t('online', 'Online') : t('offline', 'Offline')}
                  </span>
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
