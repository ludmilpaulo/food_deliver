import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseAPI } from "@/services/api";
import { readAuthToken } from "@/lib/authToken";
import type {
  PropertyDashboardStats,
  PropertyEnquiry,
  PropertyEnquiryStatus,
  PropertyListing,
  PropertyListingInput,
} from "@/types/property";
import {
  mapPropertyDashboardStats,
  mapPropertyEnquiry,
  mapPropertyListing,
  toSnakeListingInput,
} from "@/lib/propertyMappers";

type RawRecord = Record<string, unknown>;

const propertyBaseQuery = fetchBaseQuery({
  baseUrl: `${baseAPI}/api/properties`,
  prepareHeaders: (headers, { endpoint }) => {
    const isMultipart =
      endpoint === "createPropertyListing" || endpoint === "updatePropertyListing";
    if (!isMultipart) {
      headers.set("Content-Type", "application/json");
    }
    const token = readAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const language = localStorage.getItem("language") || "en";
    headers.set("Accept-Language", language);
    return headers;
  },
});

export const propertyApi = createApi({
  reducerPath: "propertyApi",
  baseQuery: propertyBaseQuery,
  tagTypes: ["PropertyDashboard", "PropertyListings", "PropertyEnquiries"],
  endpoints: (builder) => ({
    getPropertyDashboard: builder.query<PropertyDashboardStats, { days?: number } | void>({
      query: (params) => {
        const days = params && "days" in params ? params.days : undefined;
        return days ? `/me/dashboard/?days=${days}` : "/me/dashboard/";
      },
      transformResponse: (response: RawRecord) => mapPropertyDashboardStats(response),
      providesTags: ["PropertyDashboard"],
    }),
    getPropertyListings: builder.query<PropertyListing[], void>({
      query: () => "/me/listings/",
      transformResponse: (response: RawRecord[]) => response.map((row) => mapPropertyListing(row)),
      providesTags: ["PropertyListings"],
    }),
    createPropertyListing: builder.mutation<PropertyListing, PropertyListingInput>({
      query: (body) => ({
        url: "/me/listings/",
        method: "POST",
        body: toSnakeListingInput(body),
      }),
      transformResponse: (response: RawRecord) => mapPropertyListing(response),
      invalidatesTags: ["PropertyListings", "PropertyDashboard"],
    }),
    updatePropertyListing: builder.mutation<
      PropertyListing,
      { id: number; patch: Partial<PropertyListingInput> & { isAvailable?: boolean } }
    >({
      query: ({ id, patch }) => {
        const formData = new FormData();
        if (patch.title !== undefined) formData.append("title", patch.title);
        if (patch.description !== undefined) formData.append("description", patch.description);
        if (patch.address !== undefined) formData.append("address", patch.address);
        if (patch.city !== undefined) formData.append("city", patch.city);
        if (patch.listingType !== undefined) formData.append("listing_type", patch.listingType);
        if (patch.propertyType !== undefined) formData.append("property_type", patch.propertyType);
        if (patch.price !== undefined) formData.append("price", patch.price);
        if (patch.currency !== undefined) formData.append("currency", patch.currency);
        if (patch.bedrooms !== undefined) formData.append("bedrooms", String(patch.bedrooms));
        if (patch.bathrooms !== undefined) formData.append("bathrooms", String(patch.bathrooms));
        if (patch.isAvailable !== undefined) formData.append("is_available", String(patch.isAvailable));
        for (const image of patch.images ?? []) {
          formData.append("images", image);
        }
        if (patch.video) {
          formData.append("video", patch.video);
        }
        return {
          url: `/me/listings/${id}/`,
          method: "PATCH",
          body: formData,
        };
      },
      transformResponse: (response: RawRecord) => mapPropertyListing(response),
      invalidatesTags: ["PropertyListings", "PropertyDashboard"],
    }),
    getPropertyEnquiries: builder.query<PropertyEnquiry[], { status?: string } | void>({
      query: (params) => {
        const status = params && "status" in params ? params.status : undefined;
        return status ? `/me/enquiries/?status=${encodeURIComponent(status)}` : "/me/enquiries/";
      },
      transformResponse: (response: RawRecord[]) => response.map((row) => mapPropertyEnquiry(row)),
      providesTags: ["PropertyEnquiries"],
    }),
    updatePropertyEnquiryStatus: builder.mutation<
      PropertyEnquiry,
      { id: number; status: PropertyEnquiryStatus }
    >({
      query: ({ id, status }) => ({
        url: `/me/enquiries/${id}/status/`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: RawRecord) => mapPropertyEnquiry(response),
      invalidatesTags: ["PropertyEnquiries", "PropertyDashboard"],
    }),
  }),
});

export const {
  useGetPropertyDashboardQuery,
  useGetPropertyListingsQuery,
  useCreatePropertyListingMutation,
  useUpdatePropertyListingMutation,
  useGetPropertyEnquiriesQuery,
  useUpdatePropertyEnquiryStatusMutation,
} = propertyApi;
