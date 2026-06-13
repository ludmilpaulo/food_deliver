import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseAPI } from "@/services/api";
import type {
  AppointmentSlot,
  AppointmentStatusUpdate,
  BookAppointmentPayload,
  DoctorAppointment,
  DoctorAvailability,
  DoctorAvailabilityInput,
  DoctorDashboardStats,
  DoctorDocument,
  DoctorDocumentType,
  DoctorListItem,
  DoctorProfileMe,
  DoctorService,
  DoctorServiceInput,
  DoctorVerificationStatusResponse,
  GeneratedSlotPreview,
  AdminDoctorVerificationDetail,
  AdminDoctorVerificationListItem,
} from "@/types/doctor";
import {
  mapAppointment,
  mapAvailability,
  mapDashboardStats,
  mapDoctorDocument,
  mapDoctorListItem,
  mapGeneratedSlots,
  mapProfile,
  mapService,
  mapSlot,
  mapVerificationStatus,
  mapAdminDoctorVerificationDetail,
  mapAdminDoctorVerificationListItem,
  toSnakeAvailability,
  toSnakeService,
} from "@/lib/doctorMappers";

type RawRecord = Record<string, unknown>;

const doctorBaseQuery = fetchBaseQuery({
  baseUrl: `${baseAPI}/api/doctors`,
  prepareHeaders: (headers, { endpoint }) => {
    const isUpload = endpoint === "uploadDoctorDocument";
    if (!isUpload) {
      headers.set("Content-Type", "application/json");
    }
    try {
      const token = JSON.parse(localStorage.getItem("auth_token") || "null") as string | null;
      if (token) headers.set("Authorization", `Bearer ${token}`);
    } catch {
      /* ignore */
    }
    const language = localStorage.getItem("language") || "en";
    headers.set("Accept-Language", language);
    return headers;
  },
});

const adminDoctorBaseQuery = fetchBaseQuery({
  baseUrl: `${baseAPI}/api/admin/doctors`,
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

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  baseQuery: doctorBaseQuery,
  tagTypes: ["DoctorDashboard", "DoctorProfile", "DoctorServices", "DoctorAvailability", "DoctorSlots", "DoctorAppointments", "PublicDoctors", "DoctorVerification", "DoctorDocuments"],
  endpoints: (builder) => ({
    getDoctorDashboard: builder.query<DoctorDashboardStats, void>({
      query: () => "/me/dashboard/",
      transformResponse: (response: RawRecord) => mapDashboardStats(response),
      providesTags: ["DoctorDashboard", "DoctorProfile", "DoctorAppointments"],
    }),
    getDoctorProfile: builder.query<DoctorProfileMe, void>({
      query: () => "/me/profile/",
      transformResponse: (response: RawRecord) => mapProfile(response),
      providesTags: ["DoctorProfile"],
    }),
    updateDoctorProfile: builder.mutation<DoctorProfileMe, Partial<DoctorProfileMe>>({
      query: (body) => ({
        url: "/me/profile/",
        method: "PATCH",
        body: {
          clinic_name: body.clinicName,
          biography: body.biography,
          professional_title: body.professionalTitle,
          years_experience: body.yearsExperience,
          languages: body.languages,
          consultation_fee: body.consultationFee,
          online_consultation_enabled: body.onlineConsultationEnabled,
          physical_consultation_enabled: body.physicalConsultationEnabled,
          license_number: body.licenseNumber,
          conditions_treated: body.conditionsTreated,
          services_offered: body.servicesOffered,
          insurance_accepted: body.insuranceAccepted,
          first_name: body.firstName,
          last_name: body.lastName,
        },
      }),
      transformResponse: (response: RawRecord) => mapProfile(response),
      invalidatesTags: ["DoctorProfile", "DoctorDashboard"],
    }),
    getDoctorServices: builder.query<DoctorService[], void>({
      query: () => "/me/services/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapService(row)),
      providesTags: ["DoctorServices"],
    }),
    createDoctorService: builder.mutation<DoctorService, DoctorServiceInput>({
      query: (body) => ({
        url: "/me/services/",
        method: "POST",
        body: toSnakeService(body),
      }),
      transformResponse: (response: RawRecord) => mapService(response),
      invalidatesTags: ["DoctorServices", "DoctorDashboard"],
    }),
    updateDoctorService: builder.mutation<DoctorService, { id: number; body: Partial<DoctorServiceInput> }>({
      query: ({ id, body }) => ({
        url: `/me/services/${id}/`,
        method: "PATCH",
        body: toSnakeService({
          name: body.name ?? "",
          description: body.description,
          price: body.price ?? "0",
          durationMinutes: body.durationMinutes,
          consultationType: body.consultationType,
          isActive: body.isActive,
        }),
      }),
      transformResponse: (response: RawRecord) => mapService(response),
      invalidatesTags: ["DoctorServices"],
    }),
    deleteDoctorService: builder.mutation<void, number>({
      query: (id) => ({ url: `/me/services/${id}/`, method: "DELETE" }),
      invalidatesTags: ["DoctorServices", "DoctorDashboard"],
    }),
    getDoctorAvailability: builder.query<DoctorAvailability[], void>({
      query: () => "/me/availability/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapAvailability(row)),
      providesTags: ["DoctorAvailability"],
    }),
    createDoctorAvailability: builder.mutation<DoctorAvailability, DoctorAvailabilityInput>({
      query: (body) => ({
        url: "/me/availability/",
        method: "POST",
        body: toSnakeAvailability(body),
      }),
      transformResponse: (response: RawRecord) => mapAvailability(response),
      invalidatesTags: ["DoctorAvailability", "DoctorSlots", "DoctorDashboard"],
    }),
    deleteDoctorAvailability: builder.mutation<void, number>({
      query: (id) => ({ url: `/me/availability/${id}/`, method: "DELETE" }),
      invalidatesTags: ["DoctorAvailability", "DoctorSlots", "DoctorDashboard"],
    }),
    previewDoctorAvailability: builder.mutation<GeneratedSlotPreview[], DoctorAvailabilityInput>({
      query: (body) => ({
        url: "/me/availability/preview/",
        method: "POST",
        body: toSnakeAvailability(body),
      }),
      transformResponse: (response: RawRecord) => mapGeneratedSlots(response),
    }),
    getDoctorSlots: builder.query<AppointmentSlot[], string | undefined>({
      query: (date) => (date ? `/me/slots/?date=${date}` : "/me/slots/"),
      transformResponse: (response: RawRecord[]) => response.map((row) => mapSlot(row)),
      providesTags: ["DoctorSlots"],
    }),
    blockDoctorSlot: builder.mutation<AppointmentSlot, { id: number; isBlocked: boolean }>({
      query: ({ id, isBlocked }) => ({
        url: `/me/slots/${id}/block/`,
        method: "PATCH",
        body: { is_blocked: isBlocked },
      }),
      transformResponse: (response: RawRecord) => mapSlot(response),
      invalidatesTags: ["DoctorSlots", "DoctorDashboard"],
    }),
    getDoctorAppointments: builder.query<DoctorAppointment[], { filter?: string; search?: string }>({
      query: ({ filter = "all", search = "" }) => {
        const params = new URLSearchParams({ filter });
        if (search) params.set("search", search);
        return `/me/appointments/?${params.toString()}`;
      },
      transformResponse: (response: RawRecord[]) => response.map((row) => mapAppointment(row)),
      providesTags: ["DoctorAppointments"],
    }),
    updateDoctorAppointmentStatus: builder.mutation<DoctorAppointment, { id: number; body: AppointmentStatusUpdate }>({
      query: ({ id, body }) => ({
        url: `/me/appointments/${id}/status/`,
        method: "PATCH",
        body: {
          status: body.status,
          doctor_notes: body.doctorNotes,
          cancellation_reason: body.cancellationReason,
        },
      }),
      transformResponse: (response: RawRecord) => mapAppointment(response),
      invalidatesTags: ["DoctorAppointments", "DoctorDashboard", "DoctorSlots"],
    }),
    getPublicDoctors: builder.query<DoctorListItem[], Record<string, string>>({
      query: (params) => {
        const search = new URLSearchParams(params);
        return `/?${search.toString()}`;
      },
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) => {
        const rows = Array.isArray(response) ? response : response.results ?? [];
        return rows.map((row) => mapDoctorListItem(row));
      },
      providesTags: ["PublicDoctors"],
    }),
    getPublicDoctor: builder.query<DoctorListItem, number>({
      query: (id) => `/${id}/`,
      transformResponse: (response: RawRecord) => mapDoctorListItem(response),
      providesTags: ["PublicDoctors"],
    }),
    getPublicAvailableSlots: builder.query<AppointmentSlot[], { doctorId: number; date: string }>({
      query: ({ doctorId, date }) => `/${doctorId}/available-slots/?date=${date}`,
      transformResponse: (response: RawRecord[]) => response.map((row) => mapSlot(row)),
    }),
    getDoctorVerificationStatus: builder.query<DoctorVerificationStatusResponse, void>({
      query: () => "/me/verification-status/",
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      providesTags: ["DoctorVerification"],
    }),
    getDoctorDocuments: builder.query<DoctorDocument[], void>({
      query: () => "/me/documents/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapDoctorDocument(row)),
      providesTags: ["DoctorDocuments"],
    }),
    uploadDoctorDocument: builder.mutation<DoctorDocument, { documentType: DoctorDocumentType; file: File }>({
      query: ({ documentType, file }) => {
        const formData = new FormData();
        formData.append("document_type", documentType);
        formData.append("file", file);
        return {
          url: "/me/documents/",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: RawRecord) => mapDoctorDocument(response),
      invalidatesTags: ["DoctorDocuments", "DoctorVerification", "DoctorDashboard"],
    }),
    deleteDoctorDocument: builder.mutation<void, number>({
      query: (id) => ({ url: `/me/documents/${id}/`, method: "DELETE" }),
      invalidatesTags: ["DoctorDocuments", "DoctorVerification"],
    }),
    submitDoctorForReview: builder.mutation<DoctorVerificationStatusResponse, void>({
      query: () => ({ url: "/me/submit-for-review/", method: "POST", body: {} }),
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      invalidatesTags: ["DoctorVerification", "DoctorDashboard", "DoctorProfile"],
    }),
  }),
});

export const adminDoctorApi = createApi({
  reducerPath: "adminDoctorApi",
  baseQuery: adminDoctorBaseQuery,
  tagTypes: ["AdminDoctorVerification"],
  endpoints: (builder) => ({
    getPendingDoctorVerifications: builder.query<AdminDoctorVerificationListItem[], { status?: string }>({
      query: ({ status } = {}) => {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        const qs = params.toString();
        return qs ? `/pending-verification/?${qs}` : "/pending-verification/";
      },
      transformResponse: (response: RawRecord[]) => response.map((row) => mapAdminDoctorVerificationListItem(row)),
      providesTags: ["AdminDoctorVerification"],
    }),
    getDoctorVerificationDetail: builder.query<AdminDoctorVerificationDetail, number>({
      query: (id) => `/${id}/verification-detail/`,
      transformResponse: (response: RawRecord) => mapAdminDoctorVerificationDetail(response),
      providesTags: (_result, _error, id) => [{ type: "AdminDoctorVerification", id }],
    }),
    approveDoctorVerification: builder.mutation<DoctorVerificationStatusResponse, number>({
      query: (id) => ({ url: `/${id}/approve/`, method: "POST", body: {} }),
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      invalidatesTags: ["AdminDoctorVerification"],
    }),
    rejectDoctorVerification: builder.mutation<DoctorVerificationStatusResponse, { id: number; reason: string }>({
      query: ({ id, reason }) => ({ url: `/${id}/reject/`, method: "POST", body: { reason } }),
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      invalidatesTags: ["AdminDoctorVerification"],
    }),
    suspendDoctorVerification: builder.mutation<DoctorVerificationStatusResponse, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/${id}/suspend/`, method: "POST", body: { reason: reason ?? "" } }),
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      invalidatesTags: ["AdminDoctorVerification"],
    }),
    requestMoreDoctorInfo: builder.mutation<DoctorVerificationStatusResponse, { id: number; notes: string }>({
      query: ({ id, notes }) => ({ url: `/${id}/request-more-info/`, method: "POST", body: { notes } }),
      transformResponse: (response: RawRecord) => mapVerificationStatus(response),
      invalidatesTags: ["AdminDoctorVerification"],
    }),
  }),
});

export const appointmentsApi = createApi({
  reducerPath: "appointmentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/appointments`,
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
  }),
  endpoints: (builder) => ({
    bookAppointment: builder.mutation<DoctorAppointment, BookAppointmentPayload>({
      query: (body) => ({
        url: "/book/",
        method: "POST",
        body: {
          slot_id: body.slotId,
          appointment_type: body.appointmentType,
          service_id: body.serviceId,
          notes: body.notes ?? "",
        },
      }),
      transformResponse: (response: RawRecord) => mapAppointment(response),
    }),
  }),
});

export const {
  useGetDoctorDashboardQuery,
  useGetDoctorProfileQuery,
  useUpdateDoctorProfileMutation,
  useGetDoctorServicesQuery,
  useCreateDoctorServiceMutation,
  useUpdateDoctorServiceMutation,
  useDeleteDoctorServiceMutation,
  useGetDoctorAvailabilityQuery,
  useCreateDoctorAvailabilityMutation,
  useDeleteDoctorAvailabilityMutation,
  usePreviewDoctorAvailabilityMutation,
  useGetDoctorSlotsQuery,
  useBlockDoctorSlotMutation,
  useGetDoctorAppointmentsQuery,
  useUpdateDoctorAppointmentStatusMutation,
  useGetPublicDoctorsQuery,
  useGetPublicDoctorQuery,
  useGetPublicAvailableSlotsQuery,
  useGetDoctorVerificationStatusQuery,
  useGetDoctorDocumentsQuery,
  useUploadDoctorDocumentMutation,
  useDeleteDoctorDocumentMutation,
  useSubmitDoctorForReviewMutation,
} = doctorApi;

export const {
  useGetPendingDoctorVerificationsQuery,
  useGetDoctorVerificationDetailQuery,
  useApproveDoctorVerificationMutation,
  useRejectDoctorVerificationMutation,
  useSuspendDoctorVerificationMutation,
  useRequestMoreDoctorInfoMutation,
} = adminDoctorApi;

export const { useBookAppointmentMutation } = appointmentsApi;
