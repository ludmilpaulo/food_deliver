import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AboutUsData } from '@/services/types';
import { baseAPI } from '@/services/api';

// Define your API base URL using NEXT_PUBLIC_BASE_API
const baseUrl =baseAPI;

// aboutApi.ts
export const aboutApi = createApi({
  reducerPath: 'aboutApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    // FIX: Return array, not single object
    getAboutUs: builder.query<AboutUsData[], void>({
      query: () => '/info/aboutus/',
    }),
    getCarousel: builder.query<any, void>({
      query: () => '/info/carousels/',
    }),
  }),
});


export const { useGetAboutUsQuery, useGetCarouselQuery } = aboutApi;
