import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '@/services/types';

export interface FinancialAccountResponse {
  account: {
    id: number;
    status: string;
    kyc_level: number;
    kyc_status: string;
    risk_level: string;
    is_frozen: boolean;
    country_code: string;
  };
  primary_wallet: {
    id: number;
    currency: string;
    available_balance: string;
    pending_balance: string;
    reserved_balance: string;
    status: string;
  };
  wallets: Array<{
    id: number;
    currency: string;
    available_balance: string;
    pending_balance: string;
    reserved_balance: string;
  }>;
}

export interface RemittanceCorridor {
  id: number;
  origin_country: string;
  destination_country: string;
  source_currency: string;
  destination_currency: string;
  payout_method: string;
  min_amount: string;
  max_amount: string;
  status: string;
}

export interface RemittanceQuote {
  corridor_id: number;
  send_amount: string;
  send_currency: string;
  receive_amount: string;
  receive_currency: string;
  fx_rate: string;
  provider_fee: string;
  kudya_fee: string;
  total_debit: string;
  estimated_delivery_hours: number;
}

const financialBaseQuery = fetchBaseQuery({
  baseUrl: baseAPI,
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    const token = readAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    headers.set('Accept-Language', language);
    return headers;
  },
});

export const financialApi = createApi({
  reducerPath: 'financialApi',
  baseQuery: financialBaseQuery,
  tagTypes: ['FinancialAccount', 'RemittanceCorridors', 'RemittanceHistory'],
  endpoints: (builder) => ({
    getFinancialAccount: builder.query<FinancialAccountResponse, string | void>({
      query: (currency) => ({
        url: '/api/v1/financial/accounts/me/',
        params: currency ? { currency } : undefined,
      }),
      providesTags: ['FinancialAccount'],
    }),
    getFinancialHistory: builder.query<{ transactions: unknown[]; journals: unknown[] }, void>({
      query: () => '/api/v1/financial/accounts/history/',
    }),
    createDeposit: builder.mutation<Record<string, unknown>, {
      amount: number;
      currency: string;
      method?: string;
      idempotency_key?: string;
    }>({
      query: (body) => ({
        url: '/api/v1/financial/deposits/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FinancialAccount'],
    }),
    createWithdrawal: builder.mutation<Record<string, unknown>, {
      amount: number;
      currency: string;
      method: string;
      payout_details: Record<string, unknown>;
      pin: string;
      idempotency_key?: string;
    }>({
      query: (body) => ({
        url: '/api/v1/financial/withdrawals/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FinancialAccount'],
    }),
    createTransfer: builder.mutation<Record<string, unknown>, {
      amount: number;
      currency: string;
      recipient_phone?: string;
      recipient_user_id?: number;
      pin?: string;
      idempotency_key?: string;
    }>({
      query: (body) => ({
        url: '/api/v1/financial/transfers/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FinancialAccount'],
    }),
    getRemittanceCorridors: builder.query<RemittanceCorridor[], void>({
      query: () => '/api/v1/financial/remittances/corridors/',
      providesTags: ['RemittanceCorridors'],
    }),
    getRemittanceQuote: builder.mutation<RemittanceQuote, { corridor_id: number; amount: number }>({
      query: (body) => ({
        url: '/api/v1/financial/remittances/quote/',
        method: 'POST',
        body,
      }),
    }),
    createRemittance: builder.mutation<Record<string, unknown>, {
      corridor_id: number;
      recipient_id: number;
      amount: number;
      pin: string;
      idempotency_key?: string;
    }>({
      query: (body) => ({
        url: '/api/v1/financial/remittances/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FinancialAccount', 'RemittanceHistory'],
    }),
    createVasPurchase: builder.mutation<Record<string, unknown>, {
      service_type: string;
      amount: number;
      currency: string;
      country_code: string;
      recipient?: string;
      product_code?: string;
      pin?: string;
    }>({
      query: (body) => ({
        url: '/api/v1/financial/vas/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FinancialAccount'],
    }),
    setWalletPin: builder.mutation<{ status: string }, { pin: string }>({
      query: (body) => ({
        url: '/api/v1/financial/pin/set/',
        method: 'POST',
        body,
      }),
    }),
    getFinancialAdminOverview: builder.query<Record<string, unknown>, void>({
      query: () => '/api/v1/financial/admin/overview/',
    }),
  }),
});

export const {
  useGetFinancialAccountQuery,
  useGetFinancialHistoryQuery,
  useCreateDepositMutation,
  useCreateWithdrawalMutation,
  useCreateTransferMutation,
  useGetRemittanceCorridorsQuery,
  useGetRemittanceQuoteMutation,
  useCreateRemittanceMutation,
  useCreateVasPurchaseMutation,
  useSetWalletPinMutation,
  useGetFinancialAdminOverviewQuery,
} = financialApi;
