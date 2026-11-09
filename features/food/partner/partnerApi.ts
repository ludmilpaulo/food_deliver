import { createApi } from '@reduxjs/toolkit/query/react';
import { asList, axiosBaseQuery } from '../api/baseQuery';
import type {
  PartnerAction,
  PartnerAddon,
  PartnerAddonGroup,
  PartnerDashboard,
  PartnerMe,
  PartnerOpeningHour,
  PartnerOrderDetail,
  PartnerOrderPage,
  PartnerProduct,
  PartnerPromotion,
  PartnerReport,
  PartnerStoreSettings,
  PartnerTab,
  ProductCategoryOption,
  TeamMember,
  TeamRole,
} from './types';

const BASE = '/food/partner';

export const foodPartnerApi = createApi({
  reducerPath: 'foodPartnerApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Me', 'Dashboard', 'Orders', 'Order', 'Store', 'Products', 'Hours', 'Promotions', 'Team'],
  endpoints: (builder) => ({
    getPartnerMe: builder.query<PartnerMe, void>({ query: () => ({ url: `${BASE}/me/` }), providesTags: ['Me'] }),
    getPartnerDashboard: builder.query<PartnerDashboard, void>({
      query: () => ({ url: `${BASE}/dashboard/` }),
      providesTags: ['Dashboard'],
    }),
    getPartnerOrders: builder.query<PartnerOrderPage, { tab: PartnerTab | 'all'; page?: number; q?: string }>({
      query: (params) => ({ url: `${BASE}/orders/`, params }),
      providesTags: ['Orders'],
    }),
    getPartnerOrder: builder.query<PartnerOrderDetail, number>({
      query: (id) => ({ url: `${BASE}/orders/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    runPartnerAction: builder.mutation<
      PartnerOrderDetail,
      { id: number; action: PartnerAction; reason?: string; prep_minutes?: number; pin?: string }
    >({
      query: ({ id, ...body }) => ({ url: `${BASE}/orders/${id}/actions/`, method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Order', id }, 'Orders', 'Dashboard'],
    }),
    getPartnerStore: builder.query<PartnerStoreSettings, void>({ query: () => ({ url: `${BASE}/store/` }), providesTags: ['Store'] }),
    updatePartnerStore: builder.mutation<PartnerStoreSettings, Partial<PartnerStoreSettings> | FormData>({
      query: (data) => ({ url: `${BASE}/store/`, method: 'PATCH', data }),
      invalidatesTags: ['Store', 'Me', 'Dashboard'],
    }),
    getPartnerProducts: builder.query<PartnerProduct[], { status?: 'active' | 'archived' } | void>({
      query: (params) => ({ url: `${BASE}/products/`, params: params ?? undefined }),
      providesTags: ['Products'],
    }),
    createPartnerProduct: builder.mutation<PartnerProduct, FormData>({
      query: (data) => ({ url: `${BASE}/products/`, method: 'POST', data }),
      invalidatesTags: ['Products'],
    }),
    updatePartnerProduct: builder.mutation<PartnerProduct, { id: number; data: FormData | Record<string, string | boolean> }>({
      query: ({ id, data }) => ({ url: `${BASE}/products/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['Products'],
    }),
    archivePartnerProduct: builder.mutation<{ archived?: boolean } | null, number>({
      query: (id) => ({ url: `${BASE}/products/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Products'],
    }),
    getProductCategories: builder.query<ProductCategoryOption[], void>({
      query: () => ({ url: '/partner/product-categories/' }),
      transformResponse: (data: ProductCategoryOption[] | { results?: ProductCategoryOption[] }) => asList(data),
    }),
    createAddonGroup: builder.mutation<PartnerAddonGroup, Omit<PartnerAddonGroup, 'id' | 'addons' | 'sort_order'>>({
      query: (data) => ({ url: `${BASE}/addon-groups/`, method: 'POST', data }),
      invalidatesTags: ['Products'],
    }),
    updateAddonGroup: builder.mutation<PartnerAddonGroup, { id: number } & Partial<PartnerAddonGroup>>({
      query: ({ id, ...data }) => ({ url: `${BASE}/addon-groups/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['Products'],
    }),
    deleteAddonGroup: builder.mutation<null, number>({
      query: (id) => ({ url: `${BASE}/addon-groups/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Products'],
    }),
    createAddon: builder.mutation<PartnerAddon, { group: number; name: string; price: string }>({
      query: (data) => ({ url: `${BASE}/addons/`, method: 'POST', data }),
      invalidatesTags: ['Products'],
    }),
    updateAddon: builder.mutation<PartnerAddon, { id: number } & Partial<PartnerAddon>>({
      query: ({ id, ...data }) => ({ url: `${BASE}/addons/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['Products'],
    }),
    deleteAddon: builder.mutation<null, number>({
      query: (id) => ({ url: `${BASE}/addons/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Products'],
    }),
    getPartnerHours: builder.query<PartnerOpeningHour[], void>({ query: () => ({ url: `${BASE}/hours/` }), providesTags: ['Hours'] }),
    createPartnerHour: builder.mutation<PartnerOpeningHour, Pick<PartnerOpeningHour, 'day' | 'from_hour' | 'to_hour' | 'is_closed'>>({
      query: (data) => ({ url: `${BASE}/hours/`, method: 'POST', data }),
      invalidatesTags: ['Hours'],
    }),
    deletePartnerHour: builder.mutation<null, number>({
      query: (id) => ({ url: `${BASE}/hours/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Hours'],
    }),
    getPartnerPromotions: builder.query<PartnerPromotion[], void>({
      query: () => ({ url: `${BASE}/promotions/` }),
      providesTags: ['Promotions'],
    }),
    createPartnerPromotion: builder.mutation<PartnerPromotion, Omit<PartnerPromotion, 'id' | 'max_quantity' | 'min_quantity'>>({
      query: (data) => ({ url: `${BASE}/promotions/`, method: 'POST', data }),
      invalidatesTags: ['Promotions'],
    }),
    updatePartnerPromotion: builder.mutation<PartnerPromotion, { id: number } & Partial<PartnerPromotion>>({
      query: ({ id, ...data }) => ({ url: `${BASE}/promotions/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['Promotions'],
    }),
    getTeam: builder.query<TeamMember[], void>({ query: () => ({ url: `${BASE}/team/` }), providesTags: ['Team'] }),
    addTeamMember: builder.mutation<TeamMember, { email: string; role: TeamRole; name?: string }>({
      query: (data) => ({ url: `${BASE}/team/`, method: 'POST', data }),
      invalidatesTags: ['Team'],
    }),
    updateTeamMember: builder.mutation<TeamMember, { id: number; role?: TeamRole; is_active?: boolean }>({
      query: ({ id, ...data }) => ({ url: `${BASE}/team/${id}/`, method: 'PATCH', data }),
      invalidatesTags: ['Team'],
    }),
    removeTeamMember: builder.mutation<null, number>({
      query: (id) => ({ url: `${BASE}/team/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Team'],
    }),
    getPartnerReport: builder.query<PartnerReport, { from?: string; to?: string }>({
      query: (params) => ({ url: `${BASE}/reports/`, params }),
    }),
  }),
});

export const {
  useGetPartnerMeQuery,
  useGetPartnerDashboardQuery,
  useGetPartnerOrdersQuery,
  useGetPartnerOrderQuery,
  useRunPartnerActionMutation,
  useGetPartnerStoreQuery,
  useUpdatePartnerStoreMutation,
  useGetPartnerProductsQuery,
  useCreatePartnerProductMutation,
  useUpdatePartnerProductMutation,
  useArchivePartnerProductMutation,
  useGetProductCategoriesQuery,
  useCreateAddonGroupMutation,
  useUpdateAddonGroupMutation,
  useDeleteAddonGroupMutation,
  useCreateAddonMutation,
  useUpdateAddonMutation,
  useDeleteAddonMutation,
  useGetPartnerHoursQuery,
  useCreatePartnerHourMutation,
  useDeletePartnerHourMutation,
  useGetPartnerPromotionsQuery,
  useCreatePartnerPromotionMutation,
  useUpdatePartnerPromotionMutation,
  useGetTeamQuery,
  useAddTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useGetPartnerReportQuery,
} = foodPartnerApi;
