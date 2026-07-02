import { createApi } from '@reduxjs/toolkit/query/react';

import type {
  DriverAnalytics,
  DriverKpis,
  DriverOpsFilters,
  DriverOpsListResponse,
  ExpiringDocumentItem,
  IncidentItem,
  LiveInsights,
  LiveMapResponse,
  PayoutSummary,
  PendingVerificationItem,
  TopDriverItem,
} from '@/features/admin/drivers/types';
import { createAdminApiBaseQuery } from '@/lib/adminApiBaseQuery';

function buildQuery(filters: DriverOpsFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.region && filters.region !== 'all') params.set('region', filters.region);
  if (filters.service_type && filters.service_type !== 'all') {
    params.set('service_type', filters.service_type);
  }
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.country) params.set('country', filters.country);
  if (filters.city) params.set('city', filters.city);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.page_size) params.set('page_size', String(filters.page_size));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

const adminDriversOpsBaseQuery = createAdminApiBaseQuery('/api/admin/drivers');

export const adminDriversOperationsApi = createApi({
  reducerPath: 'adminDriversOperationsApi',
  baseQuery: adminDriversOpsBaseQuery,
  tagTypes: ['DriverOps', 'DriverVehicle'],
  refetchOnMountOrArgChange: 30,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getDriverKpis: builder.query<DriverKpis, DriverOpsFilters>({
      query: (filters) => `/dashboard/kpis/${buildQuery(filters)}`,
      providesTags: ['DriverOps'],
    }),
    getDriverLiveMap: builder.query<LiveMapResponse, DriverOpsFilters>({
      query: (filters) => `/live-map/${buildQuery(filters)}`,
      providesTags: ['DriverOps'],
    }),
    getDriverLiveInsights: builder.query<LiveInsights, DriverOpsFilters>({
      query: (filters) => `/live-insights/${buildQuery(filters)}`,
      providesTags: ['DriverOps'],
    }),
    getDriverAnalytics: builder.query<DriverAnalytics, DriverOpsFilters>({
      query: (filters) => `/analytics/${buildQuery(filters)}`,
      providesTags: ['DriverOps'],
    }),
    getDriverOpsList: builder.query<DriverOpsListResponse, DriverOpsFilters>({
      query: (filters) => {
        const qs = buildQuery(filters);
        return qs ? `/${qs}` : '/';
      },
      providesTags: ['DriverOps'],
    }),
    getPendingVerificationsPanel: builder.query<PendingVerificationItem[], void>({
      query: () => '/pending-verifications/',
      providesTags: ['DriverOps'],
    }),
    getExpiringDocumentsPanel: builder.query<ExpiringDocumentItem[], void>({
      query: () => '/expiring-documents/',
      providesTags: ['DriverOps'],
    }),
    getRecentIncidents: builder.query<IncidentItem[], void>({
      query: () => '/incidents/recent/',
      providesTags: ['DriverOps'],
    }),
    getTopPerformingDrivers: builder.query<TopDriverItem[], { period?: string }>({
      query: ({ period = 'week' } = {}) => `/top-performing/?period=${period}`,
      providesTags: ['DriverOps'],
    }),
    getPayoutSummary: builder.query<PayoutSummary, { period?: string }>({
      query: ({ period = 'week' } = {}) => `/payout-summary/?period=${period}`,
      providesTags: ['DriverOps'],
    }),
    approveDriver: builder.mutation<{ detail: string }, number>({
      query: (id) => ({ url: `/${id}/approve/`, method: 'POST' }),
      invalidatesTags: ['DriverOps'],
    }),
    rejectDriver: builder.mutation<{ detail: string }, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/${id}/reject/`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['DriverOps'],
    }),
    suspendDriver: builder.mutation<{ detail: string }, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/${id}/suspend/`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['DriverOps'],
    }),
    reactivateDriver: builder.mutation<{ detail: string }, number>({
      query: (id) => ({ url: `/${id}/reactivate/`, method: 'POST' }),
      invalidatesTags: ['DriverOps'],
    }),
  }),
});

export const {
  useGetDriverKpisQuery,
  useGetDriverLiveMapQuery,
  useGetDriverLiveInsightsQuery,
  useGetDriverAnalyticsQuery,
  useGetDriverOpsListQuery,
  useGetPendingVerificationsPanelQuery,
  useGetExpiringDocumentsPanelQuery,
  useGetRecentIncidentsQuery,
  useGetTopPerformingDriversQuery,
  useGetPayoutSummaryQuery,
  useApproveDriverMutation,
  useRejectDriverMutation,
  useSuspendDriverMutation,
  useReactivateDriverMutation,
} = adminDriversOperationsApi;
