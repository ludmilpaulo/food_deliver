import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '@/services/api';

export type RideCategory = {
  id: number;
  name: string;
  slug: string;
  capacity: number;
};

export type RidePriceEstimate = {
  distance_km: number;
  duration_minutes: number;
  currency: string;
  estimated_min_price: number;
  estimated_max_price: number;
  default_fare?: number;
};

export type Ride = {
  id: number;
  ride_number: string;
  status: string;
  pickup_address: string;
  destination_address: string;
  estimated_price: string;
  currency: string;
  driver_name?: string | null;
  driver_phone?: string | null;
};

export const ridesApi = createApi({
  reducerPath: 'ridesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseAPI,
    prepareHeaders: (headers) => {
      const token = readAuthToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Rides'],
  endpoints: (builder) => ({
    getRideCategories: builder.query<RideCategory[], string>({
      query: (countryCode) => `/api/rides/categories/?country_code=${encodeURIComponent(countryCode)}`,
    }),
    estimateRidePrice: builder.mutation<
      RidePriceEstimate,
      {
        pickup_latitude: number;
        pickup_longitude: number;
        destination_latitude: number;
        destination_longitude: number;
        ride_category_id: number;
        country_code?: string;
      }
    >({
      query: (body) => ({ url: '/api/rides/estimate-price/', method: 'POST', body }),
    }),
    requestRide: builder.mutation<
      Ride,
      {
        pickup_address: string;
        pickup_lat: number;
        pickup_lng: number;
        destination_address: string;
        destination_lat: number;
        destination_lng: number;
        ride_type: string;
        payment_method: string;
        country_code?: string;
      }
    >({
      query: (body) => ({ url: '/api/rides/request/', method: 'POST', body }),
      invalidatesTags: ['Rides'],
    }),
    getRideSearchStatus: builder.query<{ ride: Ride }, number>({
      query: (rideId) => `/api/rides/${rideId}/search-status/`,
    }),
    cancelRide: builder.mutation<Ride, { rideId: number; reason?: string }>({
      query: ({ rideId, reason }) => ({
        url: `/api/rides/${rideId}/cancel/`,
        method: 'POST',
        body: { reason: reason ?? '' },
      }),
      invalidatesTags: ['Rides'],
    }),
  }),
});

export const {
  useGetRideCategoriesQuery,
  useEstimateRidePriceMutation,
  useRequestRideMutation,
  useGetRideSearchStatusQuery,
  useCancelRideMutation,
} = ridesApi;
