import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { type AxiosRequestConfig } from 'axios';
import api from '@/services/api';
import { API_V1_PREFIX } from '@/shared/lib/api/endpoints';

export type FoodApiError = { status: number | 'FETCH_ERROR'; data: unknown };

export type AxiosArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: AxiosRequestConfig['params'];
  headers?: Record<string, string>;
};

/** Goes through services/api so 401s refresh the session exactly like the rest of the app. */
export const axiosBaseQuery: BaseQueryFn<AxiosArgs, unknown, FoodApiError> = async ({ url, method = 'GET', data, params, headers }) => {
  try {
    const multipart = typeof FormData !== 'undefined' && data instanceof FormData;
    const result = await api.request({
      url: `${API_V1_PREFIX}${url}`,
      method,
      data,
      params,
      headers: multipart ? { ...headers, 'Content-Type': 'multipart/form-data' } : headers,
    });
    return { data: result.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { error: { status: error.response?.status ?? 'FETCH_ERROR', data: error.response?.data } };
    }
    return { error: { status: 'FETCH_ERROR', data: null } };
  }
};

export function asList<T>(data: T[] | { results?: T[] }): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
}

/** Download a file (CSV/PDF export) through the authenticated client. */
export async function downloadV1File(url: string, params: Record<string, string>, filename: string): Promise<void> {
  const response = await api.get<Blob>(`${API_V1_PREFIX}${url}`, { params, responseType: 'blob' });
  const href = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}
