import api from '@/services/api';
import { API_V1_PREFIX } from './endpoints';

/**
 * Axios instance scoped to /api/v1 (inherits auth + language interceptors from services/api).
 */
export const v1Client = {
  get: <T = unknown>(path: string, config?: Parameters<typeof api.get>[1]) =>
    api.get<T>(`${API_V1_PREFIX}${path}`, config),
  post: <T = unknown>(path: string, data?: unknown, config?: Parameters<typeof api.post>[2]) =>
    api.post<T>(`${API_V1_PREFIX}${path}`, data, config),
  patch: <T = unknown>(path: string, data?: unknown, config?: Parameters<typeof api.patch>[2]) =>
    api.patch<T>(`${API_V1_PREFIX}${path}`, data, config),
  put: <T = unknown>(path: string, data?: unknown, config?: Parameters<typeof api.put>[2]) =>
    api.put<T>(`${API_V1_PREFIX}${path}`, data, config),
  delete: <T = unknown>(path: string, config?: Parameters<typeof api.delete>[1]) =>
    api.delete<T>(`${API_V1_PREFIX}${path}`, config),
};

export default v1Client;
