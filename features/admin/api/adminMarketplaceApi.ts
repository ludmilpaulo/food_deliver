import api from '@/services/api';
import { API_V1_PREFIX } from '@/shared/lib/api/endpoints';
import { Product, Store as StoreType } from '@/services/types';

function unwrapList<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchAdminStores(): Promise<StoreType[]> {
  const { data } = await api.get<StoreType[] | { results: StoreType[] }>(
    `${API_V1_PREFIX}/admin/marketplace/stores/`,
  );
  return unwrapList(data);
}

export async function activateAdminStore(id: number) {
  const { data } = await api.post(`${API_V1_PREFIX}/admin/marketplace/stores/${id}/activate/`);
  return data;
}

export async function deactivateAdminStore(id: number) {
  const { data } = await api.post(`${API_V1_PREFIX}/admin/marketplace/stores/${id}/deactivate/`);
  return data;
}

export async function updateAdminStore(id: number, payload: Partial<StoreType>) {
  const { data } = await api.put(`${API_V1_PREFIX}/admin/marketplace/stores/${id}/`, payload);
  return data;
}

export async function deleteAdminStore(id: number) {
  const { data } = await api.delete(`${API_V1_PREFIX}/admin/marketplace/stores/${id}/`);
  return data;
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data } = await api.get<{ products: Product[] }>(
    `${API_V1_PREFIX}/admin/marketplace/products/`,
  );
  return (data.products ?? []).map((product) => ({
    ...product,
    original_price: Number(product.original_price),
    price_with_markup: Number(product.price_with_markup),
  }));
}
