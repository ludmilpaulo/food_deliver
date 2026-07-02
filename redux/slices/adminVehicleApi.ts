import { createApi } from '@reduxjs/toolkit/query/react';

import type { AdminDriverVehicle, ChoiceOption, CountryVehicleRule } from '@/features/admin/drivers/vehicleTypes';
import { createAdminApiBaseQuery } from '@/lib/adminApiBaseQuery';
import { adminDriverApi } from '@/redux/slices/driverAdminApi';
import { adminDriversOperationsApi } from '@/redux/slices/adminDriversOperationsApi';

const adminVehicleBaseQuery = createAdminApiBaseQuery('/api/admin');

type ListResponse<T> = { results: T[] };

function invalidateDriverCaches(dispatch: (action: unknown) => void) {
  dispatch(adminDriversOperationsApi.util.invalidateTags(['DriverOps', 'DriverVehicle']));
  dispatch(adminDriverApi.util.invalidateTags(['AdminDriverVerification']));
}

export const adminVehicleApi = createApi({
  reducerPath: 'adminVehicleApi',
  baseQuery: adminVehicleBaseQuery,
  tagTypes: ['VehicleMeta', 'DriverVehicle', 'DriverOps'],
  endpoints: (builder) => ({
    getVehicleTypes: builder.query<ChoiceOption[], { countryId?: number }>({
      query: ({ countryId } = {}) => {
        const params = new URLSearchParams();
        if (countryId) params.set('country_id', String(countryId));
        const qs = params.toString();
        return qs ? `/vehicle-types/?${qs}` : '/vehicle-types/';
      },
      transformResponse: (r: ListResponse<ChoiceOption>) => r.results,
      providesTags: ['VehicleMeta'],
    }),
    getVehicleServiceTypes: builder.query<ChoiceOption[], void>({
      query: () => '/vehicle-service-types/',
      transformResponse: (r: ListResponse<ChoiceOption>) => r.results,
      providesTags: ['VehicleMeta'],
    }),
    getTaxiCategories: builder.query<ChoiceOption[], { vehicleType?: string }>({
      query: ({ vehicleType } = {}) => {
        const params = new URLSearchParams();
        if (vehicleType) params.set('vehicle_type', vehicleType);
        const qs = params.toString();
        return qs ? `/taxi-categories/?${qs}` : '/taxi-categories/';
      },
      transformResponse: (r: ListResponse<ChoiceOption>) => r.results,
      providesTags: ['VehicleMeta'],
    }),
    getCountryVehicleRules: builder.query<CountryVehicleRule[], { countryId?: number }>({
      query: ({ countryId } = {}) => {
        const params = new URLSearchParams();
        if (countryId) params.set('country_id', String(countryId));
        const qs = params.toString();
        return qs ? `/country-vehicle-rules/?${qs}` : '/country-vehicle-rules/';
      },
      transformResponse: (r: ListResponse<CountryVehicleRule>) => r.results,
      providesTags: ['VehicleMeta'],
    }),
    getDriverVehicle: builder.query<AdminDriverVehicle, number>({
      query: (driverId) => `/drivers/${driverId}/vehicle/`,
      providesTags: (_r, _e, id) => [{ type: 'DriverVehicle', id }],
    }),
    updateDriverVehicle: builder.mutation<
      AdminDriverVehicle,
      { driverId: number; body: Partial<AdminDriverVehicle> }
    >({
      query: ({ driverId, body }) => ({
        url: `/drivers/${driverId}/vehicle/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['DriverOps', 'DriverVehicle'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          invalidateDriverCaches(dispatch);
        } catch {
          /* ignore */
        }
      },
    }),
    approveDriverVehicle: builder.mutation<AdminDriverVehicle, number>({
      query: (driverId) => ({
        url: `/drivers/${driverId}/vehicle/approve/`,
        method: 'POST',
      }),
      invalidatesTags: ['DriverOps', 'DriverVehicle'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          invalidateDriverCaches(dispatch);
        } catch {
          /* ignore */
        }
      },
    }),
    rejectDriverVehicle: builder.mutation<
      AdminDriverVehicle,
      { driverId: number; reason: string }
    >({
      query: ({ driverId, reason }) => ({
        url: `/drivers/${driverId}/vehicle/reject/`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['DriverOps', 'DriverVehicle'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          invalidateDriverCaches(dispatch);
        } catch {
          /* ignore */
        }
      },
    }),
  }),
});

export const {
  useGetVehicleTypesQuery,
  useGetVehicleServiceTypesQuery,
  useGetTaxiCategoriesQuery,
  useGetCountryVehicleRulesQuery,
  useGetDriverVehicleQuery,
  useUpdateDriverVehicleMutation,
  useApproveDriverVehicleMutation,
  useRejectDriverVehicleMutation,
} = adminVehicleApi;
