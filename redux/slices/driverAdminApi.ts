import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { mapAdminDriverListItem, mapAdminDriverVerificationDetail } from "@/lib/driverMappers";

import { baseAPI } from "@/services/types";

import type { AdminDriverListItem, AdminDriverVerificationDetail } from "@/types/driver";



type RawRecord = Record<string, unknown>;



const adminDriverBaseQuery = fetchBaseQuery({

  baseUrl: `${baseAPI}/api/admin/drivers`,

  prepareHeaders: (headers) => {

    headers.set("Content-Type", "application/json");

    try {

      const token = JSON.parse(localStorage.getItem("auth_token") || "null") as string | null;

      if (token) headers.set("Authorization", `Bearer ${token}`);

    } catch {

      /* ignore */

    }

    return headers;

  },

});



export const adminDriverApi = createApi({

  reducerPath: "adminDriverApi",

  baseQuery: adminDriverBaseQuery,

  tagTypes: ["AdminDriverVerification"],

  endpoints: (builder) => ({

    getPendingDriverVerifications: builder.query<
      AdminDriverListItem[],
      { status?: string; hasDocuments?: boolean }
    >({
      query: ({ status, hasDocuments } = {}) => {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (hasDocuments) params.set("has_documents", "1");
        const qs = params.toString();
        return qs ? `/pending/?${qs}` : "/pending/";
      },

      transformResponse: (response: RawRecord[]) => response.map(mapAdminDriverListItem),

      providesTags: ["AdminDriverVerification"],

    }),

    getExpiredDriverDocuments: builder.query<AdminDriverListItem[], void>({

      query: () => "/expired-documents/",

      transformResponse: (response: RawRecord[]) => response.map(mapAdminDriverListItem),

      providesTags: ["AdminDriverVerification"],

    }),

    getDriverVerificationDetail: builder.query<AdminDriverVerificationDetail, number>({

      query: (id) => `/${id}/`,

      transformResponse: (response: RawRecord) => mapAdminDriverVerificationDetail(response),

      providesTags: (_result, _error, id) => [{ type: "AdminDriverVerification", id }],

    }),

    approveDriverVerification: builder.mutation<RawRecord, number>({

      query: (id) => ({ url: `/${id}/approve/`, method: "POST", body: {} }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    rejectDriverVerification: builder.mutation<RawRecord, { id: number; reason: string }>({

      query: ({ id, reason }) => ({ url: `/${id}/reject/`, method: "POST", body: { reason } }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    suspendDriverVerification: builder.mutation<RawRecord, { id: number; reason: string }>({

      query: ({ id, reason }) => ({ url: `/${id}/suspend/`, method: "POST", body: { reason } }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    reactivateDriverVerification: builder.mutation<RawRecord, number>({

      query: (id) => ({ url: `/${id}/reactivate/`, method: "POST", body: {} }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    approveDriverVehicle: builder.mutation<RawRecord, number>({

      query: (id) => ({ url: `/${id}/vehicle/approve/`, method: "POST", body: {} }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    rejectDriverVehicle: builder.mutation<RawRecord, { id: number; reason: string }>({

      query: ({ id, reason }) => ({ url: `/${id}/vehicle/reject/`, method: "POST", body: { reason } }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    approveDriverPersonalDocument: builder.mutation<RawRecord, { driverId: number; docId: number }>({

      query: ({ driverId, docId }) => ({

        url: `/${driverId}/documents/${docId}/approve/`,

        method: "POST",

        body: {},

      }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    rejectDriverPersonalDocument: builder.mutation<RawRecord, { driverId: number; docId: number; reason: string }>({

      query: ({ driverId, docId, reason }) => ({

        url: `/${driverId}/documents/${docId}/reject/`,

        method: "POST",

        body: { reason },

      }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    approveDriverVehicleDocument: builder.mutation<RawRecord, { driverId: number; docId: number }>({

      query: ({ driverId, docId }) => ({

        url: `/${driverId}/vehicle-documents/${docId}/approve/`,

        method: "POST",

        body: {},

      }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    rejectDriverVehicleDocument: builder.mutation<RawRecord, { driverId: number; docId: number; reason: string }>({

      query: ({ driverId, docId, reason }) => ({

        url: `/${driverId}/vehicle-documents/${docId}/reject/`,

        method: "POST",

        body: { reason },

      }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

    markDriverExpiredDocuments: builder.mutation<RawRecord, number>({

      query: (id) => ({ url: `/${id}/mark-expired/`, method: "POST", body: {} }),

      invalidatesTags: ["AdminDriverVerification"],

    }),

  }),

});



export const {

  useGetPendingDriverVerificationsQuery,

  useGetExpiredDriverDocumentsQuery,

  useGetDriverVerificationDetailQuery,

  useApproveDriverVerificationMutation,

  useRejectDriverVerificationMutation,

  useSuspendDriverVerificationMutation,

  useReactivateDriverVerificationMutation,

  useApproveDriverVehicleMutation,

  useRejectDriverVehicleMutation,

  useApproveDriverPersonalDocumentMutation,

  useRejectDriverPersonalDocumentMutation,

  useApproveDriverVehicleDocumentMutation,

  useRejectDriverVehicleDocumentMutation,

  useMarkDriverExpiredDocumentsMutation,

} = adminDriverApi;



export type { AdminDriverListItem };


