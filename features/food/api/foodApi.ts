import { createApi } from '@reduxjs/toolkit/query/react';
import { filtersToParams } from '../lib/filters';
import { asList, axiosBaseQuery, type FoodApiError } from './baseQuery';
import type {
  AvailableCoupon,
  CartQuote,
  CartQuoteRequest,
  Cuisine,
  CustomerAddress,
  CustomerRefund,
  FoodCheckoutRequest,
  FoodCheckoutResponse,
  FoodProduct,
  FoodStore,
  FoodStoreFilters,
  OrderChatMessage,
  OrderDetail,
  OrderRating,
  OrdersPage,
  RefundReason,
  ReorderResponse,
  StoreDeal,
  StoreReview,
} from '../types';

export type { FoodApiError };

export function foodErrorMessage(error: unknown, fallback: string): string {
  const body = (error as FoodApiError | undefined)?.data as
    | { error?: string; detail?: string; message?: string; non_field_errors?: string[] }
    | undefined;
  if (body && typeof body === 'object') {
    if (typeof body.error === 'string' && body.error) return body.error;
    if (typeof body.detail === 'string' && body.detail) return body.detail;
    if (typeof body.message === 'string' && body.message) return body.message;
    if (Array.isArray(body.non_field_errors) && body.non_field_errors[0]) return body.non_field_errors[0];
    const firstField = Object.values(body).find((value) => Array.isArray(value) && typeof value[0] === 'string');
    if (Array.isArray(firstField)) return String(firstField[0]);
  }
  return fallback;
}

export function foodErrorCode(error: unknown): string | undefined {
  const body = (error as FoodApiError | undefined)?.data as { code?: string } | undefined;
  return body && typeof body === 'object' && typeof body.code === 'string' ? body.code : undefined;
}

export const foodApi = createApi({
  reducerPath: 'foodApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Orders', 'Order', 'OrderChat', 'Addresses'],
  endpoints: (builder) => ({
    getFoodStores: builder.query<FoodStore[], FoodStoreFilters | void>({
      query: (filters) => ({ url: '/food/stores/', params: filtersToParams(filters ?? {}) }),
      transformResponse: (data: FoodStore[] | { results?: FoodStore[] }) => asList(data),
    }),
    getFoodStore: builder.query<FoodStore, number>({
      query: (id) => ({ url: `/food/stores/${id}/` }),
    }),
    getFoodStoreReviews: builder.query<StoreReview[], number>({
      query: (id) => ({ url: `/food/stores/${id}/reviews/`, params: { limit: 20 } }),
    }),
    getFoodStoreDeals: builder.query<StoreDeal[], number>({
      query: (id) => ({ url: `/food/stores/${id}/deals/` }),
    }),
    getFoodProducts: builder.query<FoodProduct[], { store?: number; search?: string; category?: number }>({
      query: (params) => ({ url: '/food/products/', params }),
      transformResponse: (data: FoodProduct[] | { results?: FoodProduct[] }) => asList(data),
    }),
    getFoodCuisines: builder.query<Cuisine[], void>({
      query: () => ({ url: '/food/cuisines/' }),
      transformResponse: (data: Cuisine[] | { results?: Cuisine[] }) => asList(data),
    }),
    getAvailableFoodCoupons: builder.query<AvailableCoupon[], { subtotal?: string } | void>({
      query: (params) => ({ url: '/food/coupons/available/', params: params ?? undefined }),
    }),
    quoteFoodCart: builder.mutation<CartQuote, CartQuoteRequest>({
      query: (body) => ({ url: '/food/checkout/quote/', method: 'POST', data: body }),
    }),
    placeFoodOrder: builder.mutation<FoodCheckoutResponse, { body: FoodCheckoutRequest; idempotencyKey: string }>({
      query: ({ body, idempotencyKey }) => ({
        url: '/food/checkout/',
        method: 'POST',
        data: body,
        headers: { 'Idempotency-Key': idempotencyKey },
      }),
      invalidatesTags: ['Orders'],
    }),
    getCustomerAddresses: builder.query<CustomerAddress[], void>({
      query: () => ({ url: '/customers/addresses/' }),
      transformResponse: (data: CustomerAddress[] | { results?: CustomerAddress[] }) => asList(data),
      providesTags: ['Addresses'],
    }),
    createCustomerAddress: builder.mutation<
      CustomerAddress,
      { label: string; address: string; latitude?: number | null; longitude?: number | null; instructions?: string }
    >({
      query: (body) => ({ url: '/customers/addresses/', method: 'POST', data: body }),
      invalidatesTags: ['Addresses'],
    }),
    getOrders: builder.query<OrdersPage, { status?: 'active' | 'completed' | 'cancelled'; vertical?: 'food'; page?: number }>({
      query: (params) => ({ url: '/orders/', params }),
      providesTags: ['Orders'],
    }),
    getOrder: builder.query<OrderDetail, number>({
      query: (id) => ({ url: `/orders/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    cancelOrder: builder.mutation<OrderDetail, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/orders/${id}/cancel/`, method: 'POST', data: { reason } }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Order', id }, 'Orders'],
    }),
    reorder: builder.mutation<ReorderResponse, number>({
      query: (id) => ({ url: `/orders/${id}/reorder/`, method: 'POST' }),
    }),
    rateOrder: builder.mutation<
      OrderRating,
      { id: number; store_rating: number; driver_rating?: number | null; tags?: string[]; comment?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/rating/`, method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Order', id }, 'Orders'],
    }),
    requestOrderRefund: builder.mutation<
      { id: number; status: string },
      { id: number; reason: RefundReason; details?: string; amount?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/refund-request/`, method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Order', id }],
    }),
    getRefunds: builder.query<CustomerRefund[], void>({
      query: () => ({ url: '/refunds/' }),
      providesTags: ['Orders'],
    }),
    getOrderChat: builder.query<OrderChatMessage[], number>({
      query: (id) => ({ url: `/orders/${id}/chat/` }),
      providesTags: (_result, _error, id) => [{ type: 'OrderChat', id }],
    }),
    sendOrderChat: builder.mutation<OrderChatMessage, { id: number; text: string }>({
      query: ({ id, text }) => ({ url: `/orders/${id}/chat/`, method: 'POST', data: { text } }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'OrderChat', id }],
    }),
  }),
});

export const {
  useGetFoodStoresQuery,
  useGetFoodStoreQuery,
  useGetFoodStoreReviewsQuery,
  useGetFoodStoreDealsQuery,
  useGetFoodProductsQuery,
  useGetFoodCuisinesQuery,
  useGetAvailableFoodCouponsQuery,
  useQuoteFoodCartMutation,
  usePlaceFoodOrderMutation,
  useGetCustomerAddressesQuery,
  useCreateCustomerAddressMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useReorderMutation,
  useCancelOrderMutation,
  useRateOrderMutation,
  useRequestOrderRefundMutation,
  useGetRefundsQuery,
  useGetOrderChatQuery,
  useSendOrderChatMutation,
} = foodApi;
