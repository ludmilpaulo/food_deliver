import v1Client from '@/shared/lib/api/v1Client';

export type GroceryStore = {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
  category: { id: number; name: string; image?: string } | null;
  is_approved: boolean;
};

export async function fetchGroceryStores(params?: { search?: string }): Promise<GroceryStore[]> {
  const { data } = await v1Client.get<GroceryStore[] | { results: GroceryStore[] }>(
    '/groceries/stores/',
    { params },
  );
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchGroceryCategories() {
  const { data } = await v1Client.get('/groceries/categories/');
  return data;
}

export async function fetchGroceryProducts(params?: { store?: number; category?: number }) {
  const { data } = await v1Client.get('/groceries/products/', { params });
  return Array.isArray(data) ? data : data.results ?? [];
}
