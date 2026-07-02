'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import {
  MdPeople,
  MdWifi,
  MdWork,
  MdPendingActions,
  MdBlock,
  MdCheckCircle,
  MdStar,
  MdWarning,
} from 'react-icons/md';

import AdminDriversHeader from '@/features/admin/drivers/components/AdminDriversHeader';
import AnalyticsCards from '@/features/admin/drivers/components/AnalyticsCards';
import DriversTable from '@/features/admin/drivers/components/DriversTable';
import KpiCard from '@/features/admin/drivers/components/KpiCard';
import OperationsPanel from '@/features/admin/drivers/components/OperationsPanel';
import ServiceTabs from '@/features/admin/drivers/components/ServiceTabs';
import { useTranslation } from '@/hooks/useTranslation';
import {
  canApproveDrivers,
  canSuspendDrivers,
  canViewDriverIncidents,
  canViewDriverOpsTracking,
  canViewDriverPayouts,
  canViewDriverVerificationPanels,
  isFinanceOnlyAdmin,
} from '@/features/admin/drivers/permissions';
import type {
  DriverOpsFilters,
  DriverRegion,
  DriverServiceType,
  LiveMapDriver,
} from '@/features/admin/drivers/types';
import { useAdminDriverLiveWebSocket } from '@/hooks/useAdminDriverLiveWebSocket';
import { readAuthToken, readStoredAuthUser } from '@/lib/authToken';
import { selectAuthHydrated, selectUser } from '@/redux/slices/authSlice';
import {
  useGetDriverAnalyticsQuery,
  useGetDriverKpisQuery,
  useGetDriverLiveInsightsQuery,
  useGetDriverLiveMapQuery,
  useGetDriverOpsListQuery,
  useGetExpiringDocumentsPanelQuery,
  useGetPendingVerificationsPanelQuery,
  useGetPayoutSummaryQuery,
  useGetRecentIncidentsQuery,
  useGetTopPerformingDriversQuery,
} from '@/redux/slices/adminDriversOperationsApi';

const DriverOpsMap = dynamic(() => import('@/features/admin/drivers/components/DriverOpsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[min(50vh,320px)] w-full animate-pulse rounded-2xl bg-slate-100 sm:h-[400px] lg:h-[480px]" />
  ),
});

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 6);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function mergeLiveLocation(
  drivers: LiveMapDriver[],
  event: {
    driver_id: number;
    latitude: number;
    longitude: number;
    status: string;
    last_location_at: string | null;
  },
): LiveMapDriver[] {
  const id = `drv_${String(event.driver_id).padStart(6, '0')}`;
  const idx = drivers.findIndex((d) => d.driver_id === event.driver_id || d.id === id);
  if (idx >= 0) {
    const next = [...drivers];
    next[idx] = {
      ...next[idx],
      latitude: event.latitude,
      longitude: event.longitude,
      status: event.status,
      last_location_at: event.last_location_at,
    };
    return next;
  }
  return drivers;
}

export default function GlobalDriverOperationsDashboard() {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const authHydrated = useSelector(selectAuthHydrated);
  const storedUser = authHydrated ? readStoredAuthUser() : null;
  const role = user?.role ?? storedUser?.role;
  const isPlatformAdmin = user?.is_platform_admin ?? storedUser?.is_platform_admin;

  const financeOnly = isFinanceOnlyAdmin(role);
  const canTrack = canViewDriverOpsTracking(role, isPlatformAdmin);
  const hasAuth = authHydrated && Boolean(readAuthToken());
  const canVerify = canViewDriverVerificationPanels(role);
  const canIncidents = canViewDriverIncidents(role);
  const canPayouts = canViewDriverPayouts(role);
  const canApprove = canApproveDrivers(role);
  const canSuspend = canSuspendDrivers(role);

  const defaults = defaultDateRange();
  const [region, setRegion] = useState<DriverRegion>('all');
  const [serviceType, setServiceType] = useState<DriverServiceType>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);

  const filters: DriverOpsFilters = useMemo(
    () => ({
      region,
      service_type: serviceType,
      date_from: dateFrom,
      date_to: dateTo,
      search: debouncedSearch || undefined,
      page,
      page_size: 10,
    }),
    [region, serviceType, dateFrom, dateTo, debouncedSearch, page],
  );

  useEffect(() => {
    setPage(1);
  }, [region, serviceType, debouncedSearch, dateFrom, dateTo]);

  const skipTracking = !authHydrated || !hasAuth || !canTrack || financeOnly;
  const kpisQuery = useGetDriverKpisQuery(filters, { skip: skipTracking });
  const mapQuery = useGetDriverLiveMapQuery(filters, {
    skip: skipTracking,
    pollingInterval: skipTracking ? 0 : 30000,
  });
  const insightsQuery = useGetDriverLiveInsightsQuery(filters, {
    skip: skipTracking,
    pollingInterval: skipTracking ? 0 : 30000,
  });
  const analyticsQuery = useGetDriverAnalyticsQuery(filters, { skip: skipTracking });
  const listQuery = useGetDriverOpsListQuery(filters, { skip: skipTracking });
  const pendingQuery = useGetPendingVerificationsPanelQuery(undefined, { skip: !canVerify });
  const expiringQuery = useGetExpiringDocumentsPanelQuery(undefined, { skip: !canVerify });
  const incidentsQuery = useGetRecentIncidentsQuery(undefined, { skip: !canIncidents });
  const topQuery = useGetTopPerformingDriversQuery({ period: 'week' }, { skip: skipTracking });
  const payoutQuery = useGetPayoutSummaryQuery({ period: 'week' }, { skip: !canPayouts });

  const sessionExpired =
    analyticsQuery.isError &&
    analyticsQuery.error &&
    'status' in analyticsQuery.error &&
    analyticsQuery.error.status === 401;

  const { connected: wsConnected, lastEvent } = useAdminDriverLiveWebSocket(!skipTracking);
  const [liveDrivers, setLiveDrivers] = useState<LiveMapDriver[]>([]);

  useEffect(() => {
    setLiveDrivers(mapQuery.data?.drivers ?? []);
  }, [mapQuery.data?.drivers]);

  useEffect(() => {
    if (!lastEvent) return;
    setLiveDrivers((prev) => mergeLiveLocation(prev, lastEvent));
  }, [lastEvent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#live-driver-map') return;
    const scrollToMap = () => {
      document.getElementById('live-driver-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (!mapQuery.isLoading && liveDrivers.length > 0) {
      scrollToMap();
      return;
    }
    const timer = window.setTimeout(scrollToMap, 600);
    return () => window.clearTimeout(timer);
  }, [mapQuery.isLoading, liveDrivers.length]);

  useEffect(() => {
    if (!hasAuth || !authHydrated || skipTracking) return;
    if (listQuery.isError) void listQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch once when auth becomes ready after error
  }, [hasAuth, authHydrated, skipTracking, listQuery.isError]);

  const kpis = kpisQuery.data;
  const sideLoading =
    pendingQuery.isLoading ||
    expiringQuery.isLoading ||
    incidentsQuery.isLoading ||
    topQuery.isLoading ||
    payoutQuery.isLoading;

  if (financeOnly) {
    return (
      <div className="min-h-full bg-slate-50">
        <AdminDriversHeader
          search={search}
          onSearchChange={setSearch}
          region={region}
          onRegionChange={setRegion}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
        <div className="mx-auto w-full max-w-lg p-3 sm:p-6">
          <OperationsPanel
            payout={payoutQuery.data}
            loading={payoutQuery.isLoading}
            showInsights={false}
            showPending={false}
            showExpiring={false}
            showIncidents={false}
            showTopDrivers={false}
            showPayouts
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <AdminDriversHeader
        search={search}
        onSearchChange={setSearch}
        region={region}
        onRegionChange={setRegion}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
        {sessionExpired && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t(
              'adminSessionExpired',
              'Your session expired. Sign in again as a platform admin to load driver data.',
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4 xl:grid-cols-8">
          <KpiCard title={t('totalDrivers', 'Total Drivers')} value={kpis?.total_drivers.toLocaleString() ?? '—'} change={kpis?.total_drivers_change ?? 0} icon={MdPeople} loading={kpisQuery.isLoading} />
          <KpiCard title={t('driversOnline', 'Online Now')} value={kpis?.online_now.toLocaleString() ?? '—'} change={kpis?.online_now_change ?? 0} icon={MdWifi} loading={kpisQuery.isLoading} />
          <KpiCard title={t('onActiveJob', 'On Active Job')} value={kpis?.on_active_job.toLocaleString() ?? '—'} change={kpis?.on_active_job_change ?? 0} icon={MdWork} loading={kpisQuery.isLoading} />
          <KpiCard title={t('verificationPending', 'Verification Pending')} value={kpis?.verification_pending.toLocaleString() ?? '—'} change={kpis?.verification_pending_change ?? 0} icon={MdPendingActions} loading={kpisQuery.isLoading} />
          <KpiCard title={t('suspended', 'Suspended')} value={kpis?.suspended.toLocaleString() ?? '—'} change={kpis?.suspended_change ?? 0} icon={MdBlock} loading={kpisQuery.isLoading} />
          <KpiCard title={t('completedToday', 'Completed Today')} value={kpis?.completed_today.toLocaleString() ?? '—'} change={kpis?.completed_today_change ?? 0} icon={MdCheckCircle} loading={kpisQuery.isLoading} />
          <KpiCard title={t('averageRating', 'Average Rating')} value={kpis?.average_rating.toFixed(2) ?? '—'} change={kpis?.average_rating_change ?? 0} icon={MdStar} loading={kpisQuery.isLoading} />
          <KpiCard title={t('documentExpiryAlerts', 'Document Expiry Alerts')} value={kpis?.document_expiry_alerts.toLocaleString() ?? '—'} change={kpis?.document_expiry_alerts_change ?? 0} icon={MdWarning} loading={kpisQuery.isLoading} />
        </div>

        <ServiceTabs value={serviceType} onChange={setServiceType} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_min(100%,320px)] lg:gap-6 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-4 sm:space-y-6">
            <section id="live-driver-map" className="scroll-mt-24">
              <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">
                <h2 className="text-base font-semibold text-slate-800 sm:text-lg">{t('liveDriverMap', 'Live Driver Map')}</h2>
                {wsConnected && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:text-xs">
                    WebSocket live
                  </span>
                )}
              </div>
              <DriverOpsMap
                drivers={liveDrivers}
                clusters={mapQuery.data?.clusters ?? []}
                loading={mapQuery.isLoading}
              />
            </section>

            <AnalyticsCards
              data={analyticsQuery.data}
              loading={analyticsQuery.isLoading}
              error={analyticsQuery.isError}
              onRetry={() => {
                if (!analyticsQuery.isUninitialized) void analyticsQuery.refetch();
              }}
            />

            <section>
              <h2 className="mb-2 text-base font-semibold text-slate-800 sm:mb-3 sm:text-lg">{t('drivers', 'Drivers')}</h2>
              <DriversTable
                rows={listQuery.data?.results ?? []}
                count={listQuery.data?.count ?? 0}
                page={listQuery.data?.page ?? page}
                pageSize={listQuery.data?.page_size ?? 10}
                loading={listQuery.isLoading || listQuery.isFetching}
                error={listQuery.isError && !listQuery.isFetching}
                onPageChange={setPage}
                canApprove={canApprove}
                canSuspend={canSuspend}
                canConfigureVehicle={canVerify}
                onRetry={() => {
                  if (!listQuery.isUninitialized) void listQuery.refetch();
                }}
              />
            </section>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start xl:top-24">
            <OperationsPanel
              insights={insightsQuery.data}
              pending={pendingQuery.data}
              expiring={expiringQuery.data}
              incidents={incidentsQuery.data}
              topDrivers={topQuery.data}
              payout={payoutQuery.data}
              loading={sideLoading && !insightsQuery.data}
              showInsights
              showPending={canVerify}
              showExpiring={canVerify}
              showIncidents={canIncidents}
              showTopDrivers
              showPayouts={canPayouts}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
