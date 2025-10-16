import api from "./api";
import { baseAPI } from "./types";

export type ServiceCategory = {
  id: number;
  name: string;
  name_pt?: string;
  slug: string;
  category_type: string;
  icon?: string;
  image?: string | null;
  requires_license?: boolean;
  requires_region_verification?: boolean;
  is_active?: boolean;
  service_count?: number;
};

export type ServiceListItem = {
  id: number;
  title: string;
  title_pt?: string;
  description?: string;
  description_pt?: string;
  price: number;
  currency: string;
  duration_minutes: number;
  delivery_type: "in_person" | "at_customer" | "online" | "hybrid";
  image?: string | null;
  parceiro_name: string;
  parceiro_logo?: string | null;
  category_name: string;
  average_rating: number;
  total_bookings: number;
  is_active: boolean;
  is_featured: boolean;
  instant_booking: boolean;
  is_verified?: boolean;
};

export type ServiceDetail = ServiceListItem & {
  parceiro_phone?: string;
  parceiro_address?: string;
  tags?: string;
  video_url?: string | null;
  allowed_countries?: Array<{ id: number; name: string; code: string }>;
  allowed_provinces?: Array<{ id: number; name: string; code?: string }>;
};

export type AvailabilitySlotsByDate = Record<string, Array<{ time: string; available: boolean }>>;

export type CreateBookingPayload = {
  service: number;
  customer: number;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:mm (24h)
  duration_minutes: number;
  customer_location?: string;
  customer_latitude?: number;
  customer_longitude?: number;
  customer_notes?: string;
  payment_method?: string;
};

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const { data } = await api.get(`${baseAPI}/services/categories/`);
  return data;
};

export const getServices = async (params?: {
  category?: number | string;
  q?: string;
  min_price?: number;
  max_price?: number;
  delivery_type?: string;
  verified_only?: boolean;
  ordering?: string;
}): Promise<ServiceListItem[]> => {
  const { data } = await api.get(`${baseAPI}/services/services/`, {
    params: {
      ...params,
      verified_only: params?.verified_only ? "true" : undefined,
    },
  });
  return data;
};

export const getServiceById = async (id: number): Promise<ServiceDetail> => {
  const { data } = await api.get(`${baseAPI}/services/services/${id}/`);
  return data;
};

export const getServiceAvailability = async (
  id: number,
  start_date?: string,
  end_date?: string
): Promise<{ service_id: number; start_date: string; end_date: string; available_slots: AvailabilitySlotsByDate }> => {
  const { data } = await api.get(`${baseAPI}/services/services/${id}/availability`, {
    params: { start_date, end_date },
  });
  return data;
};

export const createBooking = async (payload: CreateBookingPayload) => {
  const { data } = await api.post(`${baseAPI}/services/bookings/`, payload);
  return data;
};


