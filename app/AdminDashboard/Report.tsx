import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';
import {
  fetchAdminDashboardV1,
  fetchAdminMarketplaceReport,
  type AdminMarketplaceReport,
} from '@/features/admin/api/adminOrdersApi';
import { fetchAnalyticsDashboard } from '@/features/analytics/api/analyticsApi';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type PlatformStats = {
  orders_today: number;
  orders_week: number;
  rides_today: number;
  rides_active: number;
  deliveries_today: number;
  active_drivers: number;
  total_users: number;
};

type AnalyticsStats = {
  events_today?: number;
  events_week?: number;
  orders_today?: number;
  orders_week?: number;
  by_type_today?: Record<string, number>;
  by_type_week?: Record<string, number>;
};

const Report: React.FC = () => {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<PlatformStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [marketplace, setMarketplace] = useState<AdminMarketplaceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashboard, analyticsData, marketplaceData] = await Promise.all([
          fetchAdminDashboardV1(),
          fetchAnalyticsDashboard(),
          fetchAdminMarketplaceReport('week'),
        ]);
        setPlatform(dashboard);
        setAnalytics(analyticsData);
        setMarketplace(marketplaceData);
      } catch {
        setError(t('failedToFetchData', 'Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

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

  const summaryCards = [
    { label: t('ordersToday', 'Orders today'), value: platform?.orders_today ?? 0 },
    { label: t('orders7d', 'Orders (7d)'), value: platform?.orders_week ?? 0 },
    { label: t('delivered7d', 'Delivered (7d)'), value: marketplace?.delivered_week ?? 0 },
    { label: t('ridesToday', 'Rides today'), value: platform?.rides_today ?? 0 },
    { label: t('activeRides', 'Active rides'), value: platform?.rides_active ?? 0 },
    { label: t('driversOnline', 'Drivers online'), value: platform?.active_drivers ?? 0 },
    { label: t('eventsToday', 'Events today'), value: analytics?.events_today ?? 0 },
    { label: t('totalUsers', 'Total users'), value: platform?.total_users ?? 0 },
  ];

  const payoutCards = [
    { label: t('unpaidStoreTotal', 'Unpaid stores'), value: marketplace?.unpaid_store_total ?? 0 },
    { label: t('unpaidDriverTotal', 'Unpaid drivers'), value: marketplace?.unpaid_driver_total ?? 0 },
  ];

  const statusEntries = Object.entries(marketplace?.by_status ?? {});

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('platformReports', 'Platform reports')}</h1>
      <p className="text-slate-500 mb-6 text-sm">
        {t('adminAnalyticsHint', 'Combined marketplace, mobility, and analytics overview')}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-4 border">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {payoutCards.map((card) => (
          <div key={card.label} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">{card.label}</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{card.value.toLocaleString()} Kz</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">{t('revenue', 'Revenue')}</h2>
          </div>
          <div className="p-4">
            <Chart
              options={{
                chart: { id: 'admin-revenue-chart' },
                xaxis: {
                  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                },
              }}
              series={[{ name: t('revenue', 'Revenue'), data: marketplace?.revenue ?? [] }]}
              type="bar"
              height={280}
            />
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">{t('numberOfOrders', 'Number of orders')}</h2>
          </div>
          <div className="p-4">
            <Chart
              options={{
                chart: { id: 'admin-orders-chart' },
                xaxis: {
                  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                },
              }}
              series={[{ name: t('orders', 'Orders'), data: marketplace?.orders ?? [] }]}
              type="bar"
              height={280}
            />
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">{t('topStores', 'Top stores')}</h2>
          </div>
          <div className="p-4">
            {marketplace?.stores?.labels?.length ? (
              <Chart
                options={{ labels: marketplace.stores.labels }}
                series={marketplace.stores.data}
                type="pie"
                height={280}
              />
            ) : (
              <p className="text-slate-500 text-sm">{t('noData', 'No data')}</p>
            )}
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">{t('orderStatus', 'Order status')}</h2>
          </div>
          <div className="p-4 space-y-2">
            {statusEntries.length === 0 && (
              <p className="text-slate-500 text-sm">{t('noData', 'No data')}</p>
            )}
            {statusEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm border-b py-1">
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
