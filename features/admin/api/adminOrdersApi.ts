import api from '@/services/api';
import { API_V1_PREFIX } from '@/shared/lib/api/endpoints';

export type AdminOrder = {
  id: number;
  customer: string;
  store: string;
  status: string;
  total: number;
  created_at: string;
  invoice_pdf: string | null;
  payment_status_store: string;
  payment_status_driver: string;
  original_price: number;
  driver_commission: number;
};

export type AdminMarketplaceReport = {
  revenue: number[];
  orders: number[];
  by_status: Record<string, number>;
  stores: { labels: string[]; data: number[] };
  orders_today: number;
  orders_week: number;
  delivered_week: number;
  unpaid_store_total: number;
  unpaid_driver_total: number;
};

export async function fetchAdminOrders(filterBy = 'all'): Promise<AdminOrder[]> {
  const { data } = await api.get<{ orders: AdminOrder[] }>(
    `${API_V1_PREFIX}/admin/marketplace/orders/`,
    { params: { filter_by: filterBy } },
  );
  return data.orders ?? [];
}

export async function markAdminOrderPaid(orderId: number, party: 'store' | 'driver') {
  const { data } = await api.post(
    `${API_V1_PREFIX}/admin/marketplace/orders/${orderId}/mark-paid/`,
    { party },
  );
  return data;
}

export async function uploadAdminOrderProof(
  orderId: number,
  party: 'store' | 'driver',
  file: File,
) {
  const formData = new FormData();
  formData.append('proof_of_payment', file);
  const { data } = await api.post(
    `${API_V1_PREFIX}/admin/marketplace/orders/${orderId}/proof/${party}/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function fetchAdminMarketplaceReport(timeframe = 'week'): Promise<AdminMarketplaceReport> {
  const { data } = await api.get<AdminMarketplaceReport>(
    `${API_V1_PREFIX}/admin/marketplace/reports/`,
    { params: { timeframe } },
  );
  return data;
}

export type AdminPerson = {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  address: string;
  total_orders: number;
};

export type AdminDriverFilters = {
  country?: number;
  city?: number;
  isOnline?: boolean;
  verificationStatus?: string;
  vehicleType?: string;
  q?: string;
  hasOrders?: boolean;
};

function driverFilterParams(filters: AdminDriverFilters = {}): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.country) params.country = String(filters.country);
  if (filters.city) params.city = String(filters.city);
  if (filters.isOnline === true) params.is_online = '1';
  if (filters.isOnline === false) params.is_online = '0';
  if (filters.verificationStatus) params.verification_status = filters.verificationStatus;
  if (filters.vehicleType) params.vehicle_type = filters.vehicleType;
  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.hasOrders) params.has_orders = '1';
  return params;
}

export type AdminDriver = AdminPerson & {
  is_online?: boolean;
  plate?: string;
  vehicle_type?: string;
  verification_status?: string;
  country_id?: number | null;
  country_name?: string;
  country_code?: string;
  city_id?: number | null;
  city_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  last_location_update?: string | null;
};

export type AdminLiveDriver = {
  id: number;
  name: string;
  phone: string;
  plate?: string;
  vehicle_type?: string;
  verification_status?: string;
  country_id?: number | null;
  country_name?: string;
  country_code?: string;
  city_id?: number | null;
  city_name?: string;
  is_online: boolean;
  latitude: number | null;
  longitude: number | null;
  last_location_update: string | null;
};

export async function fetchAdminCustomers(): Promise<AdminPerson[]> {
  const { data } = await api.get<AdminPerson[]>(`${API_V1_PREFIX}/admin/marketplace/customers/`);
  return Array.isArray(data) ? data : [];
}

export async function fetchAdminDrivers(filters: AdminDriverFilters = {}): Promise<AdminDriver[]> {
  const { data } = await api.get<AdminDriver[]>(`${API_V1_PREFIX}/admin/marketplace/drivers/`, {
    params: driverFilterParams(filters),
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchOnlineDriverLocations(
  filters: AdminDriverFilters = {},
): Promise<AdminLiveDriver[]> {
  const { data } = await api.get<AdminLiveDriver[]>(
    `${API_V1_PREFIX}/admin/marketplace/drivers/live-locations/`,
    { params: driverFilterParams(filters) },
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchAdminDashboardV1() {
  const { data } = await api.get<{
    orders_today: number;
    orders_week: number;
    rides_today: number;
    rides_active: number;
    deliveries_today: number;
    active_drivers: number;
    total_users: number;
  }>(`${API_V1_PREFIX}/admin/dashboard/`);
  return data;
}
