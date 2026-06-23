import v1Client from '@/shared/lib/api/v1Client';

export type FoodStore = {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
  category: { id: number; name: string; image?: string } | null;
  is_approved: boolean;
};

export async function fetchFoodStores(params?: { search?: string }): Promise<FoodStore[]> {
  const { data } = await v1Client.get<FoodStore[] | { results: FoodStore[] }>('/food/stores/', {
    params,
  });
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchFoodCategories() {
  const { data } = await v1Client.get('/food/categories/');
  return data;
}

export async function fetchFoodProducts(params?: { store?: number; category?: number }) {
  const { data } = await v1Client.get('/food/products/', { params });
  return Array.isArray(data) ? data : data.results ?? [];
}
