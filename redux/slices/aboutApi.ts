import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AboutUsData } from '@/services/types';
import { baseAPI } from '@/services/api';

// Define your API base URL using NEXT_PUBLIC_BASE_API
const baseUrl =baseAPI  || 'https://www.kudya.shop';

export const aboutApi = createApi({
  reducerPath: 'aboutApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getAboutUs: builder.query<AboutUsData | null, void>({
      query: () => '/info/aboutus/',
      // transformResponse lets you grab the first item like you did before
      transformResponse: (response: AboutUsData[]) => response[0] || null,
    }),
    getCarousel: builder.query<any, void>({
      query: () => '/info/carousels/',
    }),
  }),
});

export const { useGetAboutUsQuery, useGetCarouselQuery } = aboutApi;
