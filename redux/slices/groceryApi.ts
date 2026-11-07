import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '@/services/api';
import type {
  GroceryCategory,
  GroceryHome,
  GroceryProductPage,
  GroceryProductQuery,
} from '@/types/grocery';

type FavoriteResponse = {
  favorited: boolean;
  product_id: number;
};

type GroceryQuoteResponse = {
  lines: Array<{
    product_id: number;
    name: string;
    quantity: string;
    selling_unit: string;
    selling_unit_label: string;
    unit_price: string;
    subtotal: string;
  }>;
  subtotal: string;
};

function compactParams(query: GroceryProductQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (query.q) params.q = query.q;
  if (query.category_slug) params.category_slug = query.category_slug;
  if (query.on_sale) params.on_sale = 'true';
  if (query.featured) params.featured = 'true';
  if (query.page) params.page = query.page;
  if (query.page_size) params.page_size = query.page_size;
  return params;
}

export const groceryApi = createApi({
  reducerPath: 'groceryApi',
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
  tagTypes: ['GroceryHome', 'GroceryProducts', 'GroceryCategories'],
  endpoints: (builder) => ({
    getGroceryHome: builder.query<GroceryHome, void>({
      query: () => '/api/v1/groceries/home/',
      providesTags: ['GroceryHome'],
    }),
    getGroceryCategories: builder.query<GroceryCategory[], void>({
      query: () => '/api/v1/groceries/categories/',
      transformResponse: (response: GroceryCategory[] | { results?: GroceryCategory[] }) =>
        Array.isArray(response) ? response : response.results ?? [],
      providesTags: ['GroceryCategories'],
    }),
    getGroceryProducts: builder.query<GroceryProductPage, GroceryProductQuery | void>({
      query: (arg) => ({
        url: '/api/v1/groceries/products/',
        params: compactParams(arg ?? {}),
      }),
      providesTags: ['GroceryProducts'],
    }),
    toggleGroceryFavorite: builder.mutation<FavoriteResponse, number>({
      query: (productId) => ({
        url: `/api/v1/groceries/products/${productId}/favorite/`,
        method: 'POST',
      }),
      invalidatesTags: ['GroceryProducts'],
    }),
    quoteGroceryLines: builder.mutation<
      GroceryQuoteResponse,
      { lines: Array<{ product_id: number; quantity: string | number }> }
    >({
      query: (body) => ({
        url: '/api/v1/groceries/quote/',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetGroceryHomeQuery,
  useGetGroceryCategoriesQuery,
  useGetGroceryProductsQuery,
  useToggleGroceryFavoriteMutation,
  useQuoteGroceryLinesMutation,
} = groceryApi;
