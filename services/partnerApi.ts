import api from "./api";
import { baseAPI } from "./types";

export type MyStore = { id: number; name: string };
export type ServiceCategory = { id: number; name: string };
export type PartnerService = {
  id: number;
  parceiro: number;
  category: number;
  title: string;
  price: number;
  currency: string;
  duration_minutes: number;
  delivery_type: string;
  is_active: boolean;
};

export const fetchServiceCategories = async (): Promise<ServiceCategory[]> => {
  const { data } = await api.get(`${baseAPI}/services/categories/`);
  return data;
};

export const fetchMyServices = async (parceiroId: number): Promise<PartnerService[]> => {
  const { data } = await api.get(`${baseAPI}/services/services/`, {
    params: { parceiro: parceiroId },
  });
  return data;
};

export const createService = async (payload: Partial<PartnerService>) => {
  const { data } = await api.post(`${baseAPI}/services/services/`, payload);
  return data;
};

export const updateService = async (id: number, payload: Partial<PartnerService>) => {
  const { data } = await api.patch(`${baseAPI}/services/services/${id}/`, payload);
  return data;
};

export type Availability = {
  id: number;
  service: number;
  is_recurring: boolean;
  day_of_week?: number | null;
  specific_date?: string | null; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  is_active: boolean;
};

export const fetchAvailability = async (serviceId: number): Promise<Availability[]> => {
  const { data } = await api.get(`${baseAPI}/services/availability/`, { params: { service: serviceId } });
  return data;
};

export const createAvailability = async (payload: Partial<Availability>) => {
  const { data } = await api.post(`${baseAPI}/services/availability/`, payload);
  return data;
};

export const deleteAvailability = async (id: number) => {
  await api.delete(`${baseAPI}/services/availability/${id}/`);
};

export type Blackout = { id: number; service: number; start_date: string; end_date: string; reason?: string };

export const fetchBlackouts = async (serviceId: number): Promise<Blackout[]> => {
  const { data } = await api.get(`${baseAPI}/services/blackouts/`, { params: { service: serviceId } });
  return data;
};

export const createBlackout = async (payload: Partial<Blackout>) => {
  const { data } = await api.post(`${baseAPI}/services/blackouts/`, payload);
  return data;
};

export type KYC = {
  id: number;
  parceiro: number;
  full_legal_name: string;
  id_document_type: string;
  id_document_number: string;
  status: string;
  is_verified: boolean;
};

export const fetchMyKYC = async (): Promise<KYC[]> => {
  const { data } = await api.get(`${baseAPI}/services/kyc/`);
  return data;
};

export const submitKYC = async (payload: FormData) => {
  const { data } = await api.post(`${baseAPI}/services/kyc/`, payload, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
};

export type Payout = { id: number; parceiro: number; amount: number; currency: string; status: string };

export const fetchPayouts = async (): Promise<Payout[]> => {
  const { data } = await api.get(`${baseAPI}/services/payouts/`);
  return data;
};

export const requestPayout = async (payload: Partial<Payout>) => {
  const { data } = await api.post(`${baseAPI}/services/payouts/`, payload);
  return data;
};

export const getAvailableBalance = async (): Promise<{ available_balance: number; currency: string }> => {
  const { data } = await api.get(`${baseAPI}/services/payouts/available_balance/`);
  return data;
};


