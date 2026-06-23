import api from '@/services/api';
import { API_V1_PREFIX } from '@/shared/lib/api/endpoints';

type MultipartConfig = {
  headers?: Record<string, string>;
};

function multipartConfig(): MultipartConfig {
  return { headers: { 'Content-Type': 'multipart/form-data' } };
}

export async function fetchPartnerStore() {
  const { data } = await api.get(`${API_V1_PREFIX}/partner/store/`);
  return data;
}

export async function updatePartnerStore(data: FormData) {
  const response = await api.patch(`${API_V1_PREFIX}/partner/store/`, data, multipartConfig());
  return response.data;
}

export async function fetchPartnerProducts() {
  const { data } = await api.get(`${API_V1_PREFIX}/partner/products/`);
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function createPartnerProduct(formData: FormData) {
  const response = await api.post(`${API_V1_PREFIX}/partner/products/`, formData, multipartConfig());
  return response.data;
}

export async function updatePartnerProduct(productId: number, formData: FormData) {
  const response = await api.patch(
    `${API_V1_PREFIX}/partner/products/${productId}/`,
    formData,
    multipartConfig(),
  );
  return response.data;
}

export async function deletePartnerProduct(productId: number) {
  await api.delete(`${API_V1_PREFIX}/partner/products/${productId}/`);
}

export async function fetchPartnerOrders() {
  const { data } = await api.get(`${API_V1_PREFIX}/partner/orders/`);
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function advancePartnerOrderStatus(orderId: number) {
  const { data } = await api.patch(`${API_V1_PREFIX}/partner/orders/${orderId}/status/`);
  return data;
}

export async function fetchPartnerProductCategories() {
  const { data } = await api.get(`${API_V1_PREFIX}/partner/product-categories/`);
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchPartnerOpeningHours() {
  const { data } = await api.get(`${API_V1_PREFIX}/partner/opening-hours/`);
  return data;
}

export async function createPartnerOpeningHour(payload: Record<string, unknown>) {
  const { data } = await api.post(`${API_V1_PREFIX}/partner/opening-hours/`, payload);
  return data;
}

export async function updatePartnerLocation(location: string) {
  const { data } = await api.post(`${API_V1_PREFIX}/partner/location/`, { location });
  return data;
}
