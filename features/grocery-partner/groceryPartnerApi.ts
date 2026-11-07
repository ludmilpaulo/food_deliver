import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '@/services/api';
import type {
  GroceryPartnerAnalytics,
  GroceryPartnerDashboard,
  GroceryPartnerMeta,
  GroceryPartnerOrderDetail,
  GroceryPartnerOrderCard,
  GroceryPartnerProduct,
  GroceryPartnerRevenue,
  GroceryPartnerSales,
  GroceryPartnerSettings,
  GroceryPromotion,
  GroceryStockMovement,
  GroceryPartnerNotification,
} from './types';

const partnerBase = '/api/v1/groceries/partner';

export const groceryPartnerApi = createApi({
  reducerPath: 'groceryPartnerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseAPI,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      const token = readAuthToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const language =
        typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
      headers.set('Accept-Language', language);
      return headers;
    },
  }),
  tagTypes: [
    'GroceryPartnerDashboard',
    'GroceryPartnerProducts',
    'GroceryPartnerOrders',
    'GroceryPartnerInventory',
    'GroceryPartnerPromotions',
    'GroceryPartnerSettings',
  ],
  endpoints: (builder) => ({
    getGroceryPartnerDashboard: builder.query<GroceryPartnerDashboard, void>({
      query: () => `${partnerBase}/dashboard/`,
      providesTags: ['GroceryPartnerDashboard'],
    }),
    getGroceryPartnerMeta: builder.query<GroceryPartnerMeta, void>({
      query: () => `${partnerBase}/meta/`,
    }),
    getGroceryPartnerSales: builder.query<GroceryPartnerSales, string | void>({
      query: (period) => ({ url: `${partnerBase}/sales/`, params: { period: period || '7d' } }),
    }),
    getGroceryPartnerRevenue: builder.query<GroceryPartnerRevenue, string | void>({
      query: (period) => ({ url: `${partnerBase}/revenue/`, params: { period: period || 'month' } }),
    }),
    getGroceryPartnerAnalytics: builder.query<GroceryPartnerAnalytics, void>({
      query: () => `${partnerBase}/analytics/`,
    }),
    getGroceryPartnerProducts: builder.query<
      GroceryPartnerProduct[],
      { q?: string; category?: string; status?: string; stock?: string; brand?: string } | void
    >({
      query: (params) => ({ url: `${partnerBase}/products/`, params: params ?? {} }),
      providesTags: ['GroceryPartnerProducts'],
    }),
    getGroceryPartnerProduct: builder.query<GroceryPartnerProduct, number>({
      query: (id) => `${partnerBase}/products/${id}/`,
      providesTags: ['GroceryPartnerProducts'],
    }),
    createGroceryPartnerProduct: builder.mutation<GroceryPartnerProduct, FormData>({
      query: (body) => ({ url: `${partnerBase}/products/`, method: 'POST', body }),
      invalidatesTags: ['GroceryPartnerProducts', 'GroceryPartnerDashboard'],
    }),
    updateGroceryPartnerProduct: builder.mutation<
      GroceryPartnerProduct,
      { id: number; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `${partnerBase}/products/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['GroceryPartnerProducts', 'GroceryPartnerDashboard'],
    }),
    deactivateGroceryPartnerProduct: builder.mutation<void, number>({
      query: (id) => ({ url: `${partnerBase}/products/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['GroceryPartnerProducts', 'GroceryPartnerDashboard'],
    }),
    adjustGroceryStock: builder.mutation<
      { product: GroceryPartnerProduct; movement: GroceryStockMovement },
      { id: number; delta: string; reason?: string; note?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${partnerBase}/inventory/${id}/adjust/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GroceryPartnerProducts', 'GroceryPartnerInventory', 'GroceryPartnerDashboard'],
    }),
    getGroceryStockHistory: builder.query<GroceryStockMovement[], number | void>({
      query: (product) => ({
        url: `${partnerBase}/inventory/history/`,
        params: product ? { product } : {},
      }),
      providesTags: ['GroceryPartnerInventory'],
    }),
    getGroceryPartnerOrders: builder.query<GroceryPartnerOrderCard[], string | void>({
      query: (statusFilter) => ({
        url: `${partnerBase}/orders/`,
        params: statusFilter ? { status: statusFilter } : {},
      }),
      providesTags: ['GroceryPartnerOrders'],
    }),
    getGroceryPartnerOrder: builder.query<GroceryPartnerOrderDetail, number>({
      query: (id) => `${partnerBase}/orders/${id}/`,
      providesTags: ['GroceryPartnerOrders'],
    }),
    updateGroceryPartnerOrderStatus: builder.mutation<GroceryPartnerOrderDetail, { id: number; status: string }>({
      query: ({ id, status: next }) => ({
        url: `${partnerBase}/orders/${id}/status/`,
        method: 'PATCH',
        body: { status: next },
      }),
      invalidatesTags: ['GroceryPartnerOrders', 'GroceryPartnerDashboard'],
    }),
    pickGroceryOrderLine: builder.mutation<
      GroceryPartnerOrderDetail,
      { id: number; line_id: number; pick_status: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${partnerBase}/orders/${id}/pick/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['GroceryPartnerOrders'],
    }),
    substituteGroceryOrderLine: builder.mutation<
      GroceryPartnerOrderDetail,
      { id: number; line_id: number; substitute_product_id: number }
    >({
      query: ({ id, ...body }) => ({
        url: `${partnerBase}/orders/${id}/substitute/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GroceryPartnerOrders'],
    }),
    getGroceryPartnerPromotions: builder.query<GroceryPromotion[], void>({
      query: () => `${partnerBase}/promotions/`,
      providesTags: ['GroceryPartnerPromotions'],
    }),
    createGroceryPartnerPromotion: builder.mutation<GroceryPromotion, Partial<GroceryPromotion>>({
      query: (body) => ({ url: `${partnerBase}/promotions/`, method: 'POST', body }),
      invalidatesTags: ['GroceryPartnerPromotions'],
    }),
    getGroceryPartnerSettings: builder.query<GroceryPartnerSettings, void>({
      query: () => `${partnerBase}/settings/`,
      providesTags: ['GroceryPartnerSettings'],
    }),
    updateGroceryPartnerSettings: builder.mutation<GroceryPartnerSettings, Partial<GroceryPartnerSettings>>({
      query: (body) => ({ url: `${partnerBase}/settings/`, method: 'PATCH', body }),
      invalidatesTags: ['GroceryPartnerSettings', 'GroceryPartnerDashboard'],
    }),
    getGroceryPartnerNotifications: builder.query<
      { count: number; results: GroceryPartnerNotification[] },
      void
    >({
      query: () => `${partnerBase}/notifications/`,
    }),
    getGroceryPartnerCustomers: builder.query<
      Array<{ id: number; name: string; phone: string; orders: number; spent: number }>,
      void
    >({
      query: () => `${partnerBase}/customers/`,
    }),
    getGroceryPartnerReviews: builder.query<
      Array<{
        id: number;
        product: number;
        product_name: string;
        customer_name: string;
        rating: number;
        comment: string;
        created_at: string;
      }>,
      void
    >({
      query: () => `${partnerBase}/reviews/`,
    }),
  }),
});

export const {
  useGetGroceryPartnerDashboardQuery,
  useGetGroceryPartnerMetaQuery,
  useGetGroceryPartnerSalesQuery,
  useGetGroceryPartnerRevenueQuery,
  useGetGroceryPartnerAnalyticsQuery,
  useGetGroceryPartnerProductsQuery,
  useGetGroceryPartnerProductQuery,
  useCreateGroceryPartnerProductMutation,
  useUpdateGroceryPartnerProductMutation,
  useDeactivateGroceryPartnerProductMutation,
  useAdjustGroceryStockMutation,
  useGetGroceryStockHistoryQuery,
  useGetGroceryPartnerOrdersQuery,
  useGetGroceryPartnerOrderQuery,
  useUpdateGroceryPartnerOrderStatusMutation,
  usePickGroceryOrderLineMutation,
  useSubstituteGroceryOrderLineMutation,
  useGetGroceryPartnerPromotionsQuery,
  useCreateGroceryPartnerPromotionMutation,
  useGetGroceryPartnerSettingsQuery,
  useUpdateGroceryPartnerSettingsMutation,
  useGetGroceryPartnerNotificationsQuery,
  useGetGroceryPartnerCustomersQuery,
  useGetGroceryPartnerReviewsQuery,
} = groceryPartnerApi;
