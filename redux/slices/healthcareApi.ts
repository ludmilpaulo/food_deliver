import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { baseAPI } from '@/services/api';

import { buildHealthcareQuery } from '@/lib/healthcareQuery';

import {

  mapCity,

  mapCountry,

  mapHealthcareDoctor,

  mapSpecialty,

  unwrapList,

} from '@/lib/healthcareMappers';

import {

  mapBookingSettings,

  mapHealthcareAppointment,

  mapHealthcareBookingResponse,

  mapHealthcareSlot,

} from '@/lib/healthcareBookingMappers';

import { readAuthToken } from '@/lib/authToken';

import { toApiConsultationType } from '@/lib/bookingUtils';

import type {

  BookHealthcareAppointmentPayload,

  City,

  Country,

  DoctorAvailableSlot,

  DoctorBookingSettings,

  DoctorFilters,

  DoctorSpecialty,

  HealthcareAppointment,

  HealthcareBookingResult,

  HealthcareDoctor,

} from '@/types/healthcare';



type RawRecord = Record<string, unknown>;



function getAuthToken(): string | null {
  return readAuthToken();
}



const healthcareBaseQuery = fetchBaseQuery({

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



export const healthcareApi = createApi({

  reducerPath: 'healthcareApi',

  baseQuery: healthcareBaseQuery,

  tagTypes: ['HealthcareDoctors', 'HealthcareDoctor', 'Countries', 'Cities', 'Specialties', 'Slots', 'Appointments'],

  endpoints: (builder) => ({

    getCountries: builder.query<Country[], void>({

      query: () => '/api/countries/',

      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>

        unwrapList(response)

          .map((row) => mapCountry(row))

          .filter((c) => c.is_active !== false),

      providesTags: ['Countries'],

    }),

    getCities: builder.query<City[], { countryId: number }>({

      query: ({ countryId }) => `/api/platform/cities/?country=${countryId}`,

      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>

        unwrapList(response).map((row) => mapCity(row)),

      providesTags: ['Cities'],

    }),

    getDoctorSpecialties: builder.query<DoctorSpecialty[], void>({

      query: () => '/api/doctors/specialties/',

      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>

        unwrapList(response).map((row) => mapSpecialty(row)),

      providesTags: ['Specialties'],

    }),

    getHealthcareDoctors: builder.query<HealthcareDoctor[], DoctorFilters>({
      query: (filters) => {
        const qs = buildHealthcareQuery(filters);
        return qs ? `/api/doctors/?${qs}` : '/api/doctors/';
      },

      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>

        unwrapList(response).map((row) => mapHealthcareDoctor(row)),

      providesTags: ['HealthcareDoctors'],

    }),

    getHealthcareDoctor: builder.query<HealthcareDoctor, number>({

      query: (doctorId) => `/api/doctors/${doctorId}/`,

      transformResponse: (response: RawRecord) => mapHealthcareDoctor(response),

      providesTags: (_result, _error, doctorId) => [{ type: 'HealthcareDoctor', id: doctorId }],

    }),

    getDoctorBookingSettings: builder.query<DoctorBookingSettings, number>({

      query: (doctorId) => `/api/doctors/${doctorId}/booking-settings/`,

      transformResponse: (response: RawRecord) => mapBookingSettings(response),

    }),

    getDoctorAvailableDays: builder.query<

      string[],

      { doctorId: number; month: string; consultationType?: string }

    >({

      query: ({ doctorId, month, consultationType }) => {

        const params = new URLSearchParams({ month });

        if (consultationType) params.set('consultation_type', consultationType);

        return `/api/doctors/${doctorId}/available-days/?${params.toString()}`;

      },

      transformResponse: (response: RawRecord) => {

        const dates = response.dates;

        return Array.isArray(dates) ? dates.filter((item): item is string => typeof item === 'string') : [];

      },

    }),

    getDoctorAvailableSlots: builder.query<

      DoctorAvailableSlot[],

      { doctorId: number; date: string; consultationType?: string }

    >({

      query: ({ doctorId, date, consultationType }) => {

        const params = new URLSearchParams({ date });

        if (consultationType) params.set('consultation_type', consultationType);

        return `/api/doctors/${doctorId}/available-slots/?${params.toString()}`;

      },

      transformResponse: (response: RawRecord[]) => response.map((row) => mapHealthcareSlot(row)),

      providesTags: ['Slots'],

    }),

    getDoctorNextAvailableSlot: builder.query<

      DoctorAvailableSlot,

      { doctorId: number; afterDate?: string; consultationType?: string }

    >({

      query: ({ doctorId, afterDate, consultationType }) => {

        const params = new URLSearchParams();

        if (afterDate) params.set('after_date', afterDate);

        if (consultationType) params.set('consultation_type', consultationType);

        const qs = params.toString();

        return `/api/doctors/${doctorId}/next-available-slot/${qs ? `?${qs}` : ''}`;

      },

      transformResponse: (response: RawRecord) => mapHealthcareSlot(response),

    }),

    getHealthcareAppointment: builder.query<HealthcareAppointment, number>({

      query: (appointmentId) => `/api/appointments/${appointmentId}/`,

      transformResponse: (response: RawRecord) => mapHealthcareAppointment(response),

      providesTags: (_result, _error, appointmentId) => [{ type: 'Appointments', id: appointmentId }],

    }),

    createHealthcareAppointment: builder.mutation<HealthcareBookingResult, BookHealthcareAppointmentPayload>({

      query: (body) => ({

        url: '/api/doctor-appointments/book/',

        method: 'POST',

        body: {

          slot_id: body.slotId,

          appointment_type: body.consultationType,

          consultation_type: toApiConsultationType(body.consultationType),

          reason: body.reason,

          notes: body.reason,

          patient: body.patient,

          payment_method: body.paymentMethod,

        },

      }),

      transformResponse: (response: RawRecord) => mapHealthcareBookingResponse(response),

      invalidatesTags: ['Slots', 'HealthcareDoctors', 'Appointments'],

    }),

  }),

});



export const {

  useGetCountriesQuery,

  useGetCitiesQuery,

  useGetDoctorSpecialtiesQuery,

  useGetHealthcareDoctorsQuery,

  useGetHealthcareDoctorQuery,

  useGetDoctorBookingSettingsQuery,

  useGetDoctorAvailableDaysQuery,

  useGetDoctorAvailableSlotsQuery,

  useGetDoctorNextAvailableSlotQuery,

  useGetHealthcareAppointmentQuery,

  useCreateHealthcareAppointmentMutation,

} = healthcareApi;

