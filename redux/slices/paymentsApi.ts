import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '../../services/types';
import type {
  PaymentConfiguration,
  PaymentInitializeResponse,
  PaymentTransaction,
  ProofOfPayment,
} from '@/types/payments';

export type CreatePaymentRequest = {
  amount: number | string;
  currency?: string;
  country?: string;
  email?: string;
  service_type?: string;
  object_id?: number;
  method?: string;
  phone?: string;
  bank_account_id?: number;
  provider?: string;
};

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}`,
    prepareHeaders: (headers) => {
      const token = readAuthToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['PaymentMethods', 'Payment'],
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentConfiguration, void>({
      query: () => '/api/payments/methods/',
      providesTags: ['PaymentMethods'],
    }),
    createPayment: builder.mutation<PaymentInitializeResponse, CreatePaymentRequest>({
      query: (body) => ({
        url: '/api/payments/initialize/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment'],
    }),
    verifyPayment: builder.mutation<PaymentTransaction, { reference?: string; kudya_reference?: string }>({
      query: (body) => ({
        url: '/api/payments/verify/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment'],
    }),
    uploadPaymentProof: builder.mutation<
      { payment: PaymentTransaction; proof: ProofOfPayment },
      { paymentId: number; file: File }
    >({
      query: ({ paymentId, file }) => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: `/api/payments/${paymentId}/proof/`,
          method: 'POST',
          body: form,
        };
      },
      invalidatesTags: ['Payment'],
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useUploadPaymentProofMutation,
} = paymentsApi;
