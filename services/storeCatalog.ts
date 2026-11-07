import { Store, Categoria, baseAPI } from '@/services/types';

export type StoreCatalogParams = {
  category?: number;
  storeType?: number;
  search?: string;
  country?: number | string;
  province?: number | string;
  city?: number | string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  pageSize?: number;
};

export type StoreCatalogResponse = {
  stores: Store[];
  count: number;
  page: number;
  pageSize: number;
};

function unwrapStores(data: unknown): Store[] {
  if (Array.isArray(data)) return data as Store[];
  if (data && typeof data === 'object') {
    const record = data as { stores?: unknown; results?: unknown };
    if (Array.isArray(record.stores)) return record.stores as Store[];
    if (Array.isArray(record.results)) return record.results as Store[];
  }
  return [];
}

export async function fetchStoreCategories(): Promise<Categoria[]> {
  const response = await fetch(`${baseAPI}/store/store-categories/`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to load categories (${response.status})`);
  }
  const data: unknown = await response.json();
  if (Array.isArray(data)) return data as Categoria[];
  if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: Categoria[] }).results;
  }
  return [];
}

export async function fetchStoreCatalog(params: StoreCatalogParams = {}): Promise<StoreCatalogResponse> {
  const query = new URLSearchParams();
  if (params.category) query.set('category', String(params.category));
  if (params.storeType) query.set('store_type', String(params.storeType));
  if (params.search) query.set('search', params.search);
  if (params.country !== undefined && params.country !== '') query.set('country', String(params.country));
  if (params.province !== undefined && params.province !== '') query.set('province', String(params.province));
  if (params.city !== undefined && params.city !== '') query.set('city', String(params.city));
  if (params.latitude !== undefined) query.set('latitude', String(params.latitude));
  if (params.longitude !== undefined) query.set('longitude', String(params.longitude));
  if (params.radius !== undefined) query.set('radius', String(params.radius));
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('page_size', String(params.pageSize));

  const response = await fetch(`${baseAPI}/customer/customer/stores/?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  const data: unknown = await response.json();
  if (!response.ok) {
    const detail =
      data && typeof data === 'object' && typeof (data as { detail?: unknown }).detail === 'string'
        ? (data as { detail: string }).detail
        : `Failed to load stores (${response.status})`;
    throw new Error(detail);
  }
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  return {
    stores: unwrapStores(data).filter((store) => store.is_approved !== false),
    count: typeof record.count === 'number' ? record.count : unwrapStores(data).length,
    page: typeof record.page === 'number' ? record.page : params.page ?? 1,
    pageSize: typeof record.page_size === 'number' ? record.page_size : params.pageSize ?? 24,
  };
}
