import v1Client from '@/shared/lib/api/v1Client';

export type Business = {
  id: number;
  name: string;
  slug: string;
  category: number;
  category_slug: string;
  category_name: string;
  dashboard_route: string;
  status: 'draft' | 'pending' | 'approved' | 'suspended' | 'rejected';
  is_active: boolean;
  country: number | null;
  city: number | null;
  owner: number;
  owner_email: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BusinessCreatePayload = {
  name: string;
  category: number;
  country?: number;
  city?: number;
  metadata?: Record<string, unknown>;
};

export async function fetchMyBusinesses(): Promise<Business[]> {
  const { data } = await v1Client.get<Business[]>('/businesses/me/');
  return data;
}

export async function createBusiness(payload: BusinessCreatePayload): Promise<Business> {
  const { data } = await v1Client.post<Business>('/businesses/', payload);
  return data;
}

export async function fetchBusiness(id: number): Promise<Business> {
  const { data } = await v1Client.get<Business>(`/businesses/${id}/`);
  return data;
}
