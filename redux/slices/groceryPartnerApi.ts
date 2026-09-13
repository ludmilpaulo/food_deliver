import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { readAuthToken } from "@/lib/authToken";
import { baseAPI } from "@/services/api";
import type {
  GroceryAnalyticsData,
  GroceryDashboardData,
  GroceryMeta,
  GroceryOrder,
  GroceryProduct,
  GroceryPromotion,
  GroceryRevenueData,
  GrocerySalesData,
  GroceryStaff,
} from "@/features/grocery-partner/types";

function unwrapList<T>(data: T[] | { results?: T[] }): T[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

const groceryPartnerBaseQuery = fetchBaseQuery({
  baseUrl: `${baseAPI}/api/v1/partner`,
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    const token = readAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const language = typeof window !== "undefined" ? localStorage.getItem("language") || "en" : "en";
    headers.set("Accept-Language", language);
    return headers;
  },
});

export const groceryPartnerApi = createApi({
  reducerPath: "groceryPartnerApi",
  baseQuery: groceryPartnerBaseQuery,
  tagTypes: [
    "GroceryDashboard",
    "GroceryProducts",
    "GroceryOrders",
    "GroceryInventory",
    "GroceryPromotions",
    "GroceryStore",
    "GroceryStaff",
    "GroceryMeta",
  ],
  endpoints: (builder) => ({
    getGroceryMeta: builder.query<GroceryMeta, void>({
      query: () => "/grocery/meta/",
      providesTags: ["GroceryMeta"],
    }),
    getGroceryDashboard: builder.query<GroceryDashboardData, void>({
      query: () => "/grocery/dashboard/",
      providesTags: ["GroceryDashboard", "GroceryOrders"],
    }),
    getGrocerySales: builder.query<GrocerySalesData, string | void>({
      query: (range) => ({ url: "/grocery/sales/", params: { range: range || "7d" } }),
    }),
    getGroceryRevenue: builder.query<GroceryRevenueData, { range?: string; start_date?: string; end_date?: string } | void>({
      query: (params) => ({ url: "/grocery/revenue/", params: params || { range: "month" } }),
    }),
    getGroceryAnalytics: builder.query<GroceryAnalyticsData, void>({
      query: () => "/grocery/analytics/",
    }),
    getGroceryProducts: builder.query<GroceryProduct[], Record<string, string> | void>({
      query: (params) => ({ url: "/products/", params: params || {} }),
      transformResponse: (response: GroceryProduct[] | { results?: GroceryProduct[] }) => unwrapList(response),
      providesTags: ["GroceryProducts"],
    }),
    createGroceryProduct: builder.mutation<GroceryProduct, FormData>({
      query: (body) => ({ url: "/products/", method: "POST", body }),
      invalidatesTags: ["GroceryProducts", "GroceryDashboard", "GroceryInventory"],
    }),
    updateGroceryProduct: builder.mutation<GroceryProduct, { id: number; body: FormData }>({
      query: ({ id, body }) => ({ url: `/products/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["GroceryProducts", "GroceryInventory", "GroceryDashboard"],
    }),
    deleteGroceryProduct: builder.mutation<void, number>({
      query: (id) => ({ url: `/products/${id}/`, method: "DELETE" }),
      invalidatesTags: ["GroceryProducts", "GroceryInventory", "GroceryDashboard"],
    }),
    getGroceryInventory: builder.query<GroceryProduct[], string | void>({
      query: (statusFilter) => ({
        url: "/grocery/inventory/",
        params: statusFilter ? { status: statusFilter } : undefined,
      }),
      providesTags: ["GroceryInventory"],
    }),
    adjustGroceryStock: builder.mutation<
      { product: GroceryProduct },
      { id: number; adjustment: number; reason?: string; note?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/grocery/inventory/${id}/adjust/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["GroceryInventory", "GroceryProducts", "GroceryDashboard"],
    }),
    getGroceryStockHistory: builder.query<
      Array<{
        id: number;
        product: string;
        product_id: number;
        previous_quantity: number;
        adjustment: number;
        new_quantity: number;
        reason: string;
        note: string;
        user: string;
        created_at: string;
      }>,
      number | void
    >({
      query: (productId) => ({
        url: "/grocery/stock-history/",
        params: productId ? { product: productId } : undefined,
      }),
    }),
    getGroceryOrders: builder.query<GroceryOrder[], void>({
      query: () => "/orders/",
      transformResponse: (response: GroceryOrder[] | { results?: GroceryOrder[] }) => unwrapList(response),
      providesTags: ["GroceryOrders"],
    }),
    updateGroceryOrderStatus: builder.mutation<GroceryOrder, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/grocery/orders/${id}/status/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["GroceryOrders", "GroceryDashboard"],
    }),
    pickGroceryOrderItem: builder.mutation<
      GroceryOrder,
      { orderId: number; itemId: number; pick_status: string; substituted_product?: number; pick_note?: string }
    >({
      query: ({ orderId, itemId, ...body }) => ({
        url: `/grocery/orders/${orderId}/items/${itemId}/pick/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["GroceryOrders"],
    }),
    getGroceryPromotions: builder.query<GroceryPromotion[], void>({
      query: () => "/grocery/promotions/",
      providesTags: ["GroceryPromotions"],
    }),
    createGroceryPromotion: builder.mutation<GroceryPromotion, Partial<GroceryPromotion>>({
      query: (body) => ({ url: "/grocery/promotions/", method: "POST", body }),
      invalidatesTags: ["GroceryPromotions"],
    }),
    updateGroceryPromotion: builder.mutation<GroceryPromotion, { id: number; body: Partial<GroceryPromotion> }>({
      query: ({ id, body }) => ({ url: `/grocery/promotions/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["GroceryPromotions"],
    }),
    deleteGroceryPromotion: builder.mutation<void, number>({
      query: (id) => ({ url: `/grocery/promotions/${id}/`, method: "DELETE" }),
      invalidatesTags: ["GroceryPromotions"],
    }),
    getGroceryReviews: builder.query<
      Array<{ id: number; product: string; user: string; rating: number; comment: string; created_at: string }>,
      void
    >({
      query: () => "/grocery/reviews/",
    }),
    getGroceryCustomers: builder.query<Array<{ id: number; name?: string; phone?: string }>, void>({
      query: () => "/reports/customers/",
      transformResponse: (response: Array<{ id: number; name?: string; phone?: string }> | { results?: Array<{ id: number; name?: string; phone?: string }> }) =>
        unwrapList(response),
    }),
    updateGroceryAvailability: builder.mutation<GroceryDashboardData["store"], Record<string, unknown>>({
      query: (body) => ({ url: "/grocery/availability/", method: "PATCH", body }),
      invalidatesTags: ["GroceryStore", "GroceryDashboard"],
    }),
    updateGroceryStore: builder.mutation<GroceryDashboardData["store"], FormData | Record<string, unknown>>({
      query: (body) => ({ url: "/store/", method: "PATCH", body }),
      invalidatesTags: ["GroceryStore", "GroceryDashboard"],
    }),
    getGroceryStaff: builder.query<GroceryStaff[], void>({
      query: () => "/grocery/staff/",
      providesTags: ["GroceryStaff"],
    }),
    createGroceryStaff: builder.mutation<GroceryStaff, Partial<GroceryStaff>>({
      query: (body) => ({ url: "/grocery/staff/", method: "POST", body }),
      invalidatesTags: ["GroceryStaff"],
    }),
    getOpeningHours: builder.query<Array<{ day: string; from_hour: string; to_hour: string; is_closed: boolean }>, void>({
      query: () => "/opening-hours/",
    }),
    createOpeningHour: builder.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({ url: "/opening-hours/", method: "POST", body }),
    }),
  }),
});

export const {
  useGetGroceryMetaQuery,
  useGetGroceryDashboardQuery,
  useGetGrocerySalesQuery,
  useGetGroceryRevenueQuery,
  useGetGroceryAnalyticsQuery,
  useGetGroceryProductsQuery,
  useCreateGroceryProductMutation,
  useUpdateGroceryProductMutation,
  useDeleteGroceryProductMutation,
  useGetGroceryInventoryQuery,
  useAdjustGroceryStockMutation,
  useGetGroceryStockHistoryQuery,
  useGetGroceryOrdersQuery,
  useUpdateGroceryOrderStatusMutation,
  usePickGroceryOrderItemMutation,
  useGetGroceryPromotionsQuery,
  useCreateGroceryPromotionMutation,
  useUpdateGroceryPromotionMutation,
  useDeleteGroceryPromotionMutation,
  useGetGroceryReviewsQuery,
  useGetGroceryCustomersQuery,
  useUpdateGroceryAvailabilityMutation,
  useUpdateGroceryStoreMutation,
  useGetGroceryStaffQuery,
  useCreateGroceryStaffMutation,
  useGetOpeningHoursQuery,
  useCreateOpeningHourMutation,
} = groceryPartnerApi;
