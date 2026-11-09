import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../api/baseQuery';
import type {
  AdminFoodConfig,
  AdminFoodOverview,
  AdminFoodReport,
  AdminOrderDetail,
  AdminOrderRow,
  AdminPromo,
  AdminRefundRow,
  AdminRestaurantDetail,
  AdminRestaurantRow,
  Paginated,
  VerificationStatus,
} from './types';

const BASE = '/admin/food';

type WithCounts<T> = Paginated<T> & { counts: Record<string, number> };

export const foodAdminApi = createApi({
  reducerPath: 'foodAdminApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Overview', 'Restaurants', 'Restaurant', 'Orders', 'Refunds', 'Config', 'Promos'],
  endpoints: (builder) => ({
    getFoodOverview: builder.query<AdminFoodOverview, void>({ query: () => ({ url: `${BASE}/overview/` }), providesTags: ['Overview'] }),
    getAdminRestaurants: builder.query<WithCounts<AdminRestaurantRow>, { status?: VerificationStatus | ''; q?: string; page?: number }>({
      query: (params) => ({ url: `${BASE}/restaurants/`, params }),
      providesTags: ['Restaurants'],
    }),
    getAdminRestaurant: builder.query<AdminRestaurantDetail, number>({
      query: (id) => ({ url: `${BASE}/restaurants/${id}/` }),
      providesTags: (_r, _e, id) => [{ type: 'Restaurant', id }],
    }),
    decideRestaurant: builder.mutation<AdminRestaurantRow, { id: number; action: 'approve' | 'reject' | 'suspend' | 'reactivate'; reason?: string }>({
      query: ({ id, ...data }) => ({ url: `${BASE}/restaurants/${id}/decision/`, method: 'POST', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Restaurant', id }, 'Restaurants', 'Overview'],
    }),
    getAdminOrders: builder.query<
      WithCounts<AdminOrderRow>,
      { status?: string; q?: string; page?: number; from?: string; to?: string; payment_method?: string }
    >({
      query: (params) => ({ url: `${BASE}/orders/`, params }),
      providesTags: ['Orders'],
    }),
    getAdminOrder: builder.query<AdminOrderDetail, number>({ query: (id) => ({ url: `${BASE}/orders/${id}/` }) }),
    getAdminRefunds: builder.query<Paginated<AdminRefundRow>, { status?: string; page?: number }>({
      query: (params) => ({ url: `${BASE}/refunds/`, params }),
      providesTags: ['Refunds'],
    }),
    decideRefund: builder.mutation<{ id: number; status: string }, { id: number; action: 'approve' | 'reject' | 'mark_refunded'; note?: string }>({
      query: ({ id, ...data }) => ({ url: `${BASE}/refunds/${id}/decision/`, method: 'POST', data }),
      invalidatesTags: ['Refunds', 'Overview'],
    }),
    getFoodConfig: builder.query<AdminFoodConfig, void>({ query: () => ({ url: `${BASE}/config/` }), providesTags: ['Config'] }),
    updateFoodConfig: builder.mutation<
      AdminFoodConfig,
      {
        allowed_country_ids?: number[];
        module_active?: boolean;
        delivery_fees?: Array<{ country_id: number | null; delivery_base_fee: string }>;
        commissions?: Array<{ country_id: number | null; value: string; fee_type?: string; transaction_type?: string }>;
      }
    >({
      query: (data) => ({ url: `${BASE}/config/`, method: 'PATCH', data }),
      invalidatesTags: ['Config'],
    }),
    getFoodPromos: builder.query<AdminPromo[], void>({ query: () => ({ url: `${BASE}/promotions/` }), providesTags: ['Promos'] }),
    createFoodPromo: builder.mutation<AdminPromo, Partial<AdminPromo>>({
      query: (data) => ({ url: `${BASE}/promotions/`, method: 'POST', data }),
      invalidatesTags: ['Promos'],
    }),
    updateFoodPromo: builder.mutation<AdminPromo, { id: number } & Partial<AdminPromo>>({
      query: ({ id, ...data }) => ({ url: `${BASE}/promotions/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['Promos'],
    }),
    getFoodReport: builder.query<AdminFoodReport, { from?: string; to?: string }>({
      query: (params) => ({ url: `${BASE}/reports/`, params }),
    }),
  }),
});

export const {
  useGetFoodOverviewQuery,
  useGetAdminRestaurantsQuery,
  useGetAdminRestaurantQuery,
  useDecideRestaurantMutation,
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useGetAdminRefundsQuery,
  useDecideRefundMutation,
  useGetFoodConfigQuery,
  useUpdateFoodConfigMutation,
  useGetFoodPromosQuery,
  useCreateFoodPromoMutation,
  useUpdateFoodPromoMutation,
  useGetFoodReportQuery,
} = foodAdminApi;
