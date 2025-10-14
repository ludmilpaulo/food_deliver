import api from "./api";
import { baseAPI } from "./types";

export type AdminKYC = {
  id: number;
  parceiro: number;
  parceiro_name?: string;
  full_legal_name: string;
  id_document_type: string;
  id_document_number: string;
  status: string;
  is_verified: boolean;
  submitted_at: string;
};

export const fetchAllKYC = async (): Promise<AdminKYC[]> => {
  const { data } = await api.get(`${baseAPI}/services/kyc/`);
  return data;
};

export const approveKYC = async (id: number) => {
  const { data } = await api.post(`${baseAPI}/services/kyc/${id}/approve/`);
  return data;
};

export const rejectKYC = async (id: number, reason: string) => {
  const { data } = await api.post(`${baseAPI}/services/kyc/${id}/reject/`, { reason });
  return data;
};

export type AdminPayout = { id: number; parceiro: number; amount: number; currency: string; status: string; requested_at: string };

export const fetchAllPayouts = async (status?: string): Promise<AdminPayout[]> => {
  const { data } = await api.get(`${baseAPI}/services/payouts/`, { params: { status } });
  return data;
};

export const markPayoutCompleted = async (id: number) => {
  const { data } = await api.post(`${baseAPI}/services/payouts/${id}/mark_completed/`);
  return data;
};

export const markPayoutProcessing = async (id: number) => {
  const { data } = await api.post(`${baseAPI}/services/payouts/${id}/mark_processing/`);
  return data;
};


