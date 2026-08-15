import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '@/services/api';
import type {
  AccommodationListing,
  City,
  Country,
  PackageEstimate,
  RentalVehicle,
  WalletSummary,
  WalletTransaction,
  WalletTopUpResponse,
} from '@/types/marketplace';

type RawRecord = Record<string, unknown>;

function unwrapList<T>(data: T[] | { results?: T[] }): T[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

function mapCountry(raw: RawRecord): Country {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    code: String(raw.code ?? ''),
    currency: String(raw.currency ?? 'AOA'),
    currency_symbol: raw.currency_symbol === null || raw.currency_symbol === undefined
      ? null
      : String(raw.currency_symbol),
    is_active: raw.is_active === undefined ? true : Boolean(raw.is_active),
  };
}

function mapCity(raw: RawRecord): City {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? raw.name ?? '').toLowerCase().replace(/\s+/g, '-'),
    country_code: String(raw.country_code ?? ''),
  };
}

function getAuthToken(): string | null {
  return readAuthToken();
}

const marketplaceBaseQuery = fetchBaseQuery({
  baseUrl: baseAPI,
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    headers.set('Accept-Language', language);
    return headers;
  },
});

export const marketplaceApi = createApi({
  reducerPath: 'marketplaceApi',
  baseQuery: marketplaceBaseQuery,
  tagTypes: ['Countries', 'Cities', 'Wallet', 'Rentals', 'Stays', 'Courier', 'PartnerRentals'],
  endpoints: (builder) => ({
    getCountries: builder.query<Country[], void>({
      query: () => '/api/countries/',
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>
        unwrapList(response).map(mapCountry).filter((c) => c.is_active !== false),
      providesTags: ['Countries'],
    }),
    getCities: builder.query<City[], number>({
      query: (countryId) => `/api/platform/cities/?country=${countryId}`,
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>
        unwrapList(response).map(mapCity),
      providesTags: (_result, _error, countryId) => [{ type: 'Cities', id: countryId }],
    }),
    getWallet: builder.query<WalletSummary, string | void>({
      query: (currency) => ({
        url: '/api/wallet/me/',
        params: currency ? { currency } : undefined,
      }),
      providesTags: ['Wallet'],
    }),
    getWalletHistory: builder.query<WalletTransaction[], void>({
      query: () => '/api/wallet/history/',
      providesTags: ['Wallet'],
    }),
    topUpWallet: builder.mutation<
      WalletTopUpResponse,
      { amount: number; currency: string; country?: string; method?: string; phone?: string }
    >({
      query: (body) => ({
        url: '/api/wallet/top_up/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet'],
    }),
    getRentalVehicles: builder.query<RentalVehicle[], { country?: string; city?: number }>({
      query: (params) => ({
        url: '/api/rentals/vehicles/',
        params,
      }),
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>
        unwrapList(response) as RentalVehicle[],
      providesTags: ['Rentals'],
    }),
    getAccommodationListings: builder.query<AccommodationListing[], { country?: number; city?: number }>({
      query: (params) => ({
        url: '/api/accommodation/listings/',
        params,
      }),
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>
        unwrapList(response) as AccommodationListing[],
      providesTags: ['Stays'],
    }),
    getStayProperties: builder.query<RawRecord[], { country?: number; city?: number }>({
      query: ({ country, city }) => {
        const params: Record<string, string | number> = { purpose: 'stay' };
        if (country) params.country = country;
        if (city) params.city = city;
        return { url: '/api/properties/search/', params };
      },
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) => unwrapList(response),
      providesTags: ['Stays'],
    }),
    bookRental: builder.mutation<
      RawRecord,
      {
        vehicle: number;
        start_date: string;
        end_date: string;
        pickup_location: string;
        return_location: string;
      }
    >({
      query: (body) => ({
        url: '/api/rentals/bookings/book/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rentals'],
    }),
    getMyRentalVehicles: builder.query<RentalVehicle[], void>({
      query: () => '/api/rentals/me/vehicles/',
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>
        unwrapList(response) as RentalVehicle[],
      providesTags: ['PartnerRentals'],
    }),
    createRentalVehicle: builder.mutation<RentalVehicle, RawRecord>({
      query: (body) => ({
        url: '/api/rentals/me/vehicles/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PartnerRentals'],
    }),
    getPartnerRentalBookings: builder.query<RawRecord[], void>({
      query: () => '/api/rentals/me/vehicles/bookings/',
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) => unwrapList(response),
      providesTags: ['PartnerRentals'],
    }),
    estimatePackage: builder.mutation<
      PackageEstimate,
      {
        pickup_lat: number;
        pickup_lng: number;
        dropoff_lat: number;
        dropoff_lng: number;
        package_type: string;
        urgency: string;
      }
    >({
      query: (body) => ({
        url: '/api/deliveries/estimate/',
        method: 'POST',
        body,
      }),
    }),
    requestPackage: builder.mutation<
      RawRecord,
      {
        pickup_address: string;
        pickup_lat: number;
        pickup_lng: number;
        dropoff_address: string;
        dropoff_lat: number;
        dropoff_lng: number;
        package_type: string;
        urgency: string;
        recipient_name: string;
        recipient_phone: string;
        package_notes?: string;
      }
    >({
      query: (body) => ({
        url: '/api/deliveries/request/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Courier'],
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetCitiesQuery,
  useGetWalletQuery,
  useGetWalletHistoryQuery,
  useTopUpWalletMutation,
  useGetRentalVehiclesQuery,
  useGetAccommodationListingsQuery,
  useGetStayPropertiesQuery,
  useBookRentalMutation,
  useGetMyRentalVehiclesQuery,
  useCreateRentalVehicleMutation,
  useGetPartnerRentalBookingsQuery,
  useEstimatePackageMutation,
  useRequestPackageMutation,
} = marketplaceApi;
