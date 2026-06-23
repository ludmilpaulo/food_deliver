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

export type AdminDriver = AdminPerson & {
  is_online?: boolean;
  plate?: string;
};

export async function fetchAdminCustomers(): Promise<AdminPerson[]> {
  const { data } = await api.get<AdminPerson[]>(`${API_V1_PREFIX}/admin/marketplace/customers/`);
  return Array.isArray(data) ? data : [];
}

export async function fetchAdminDrivers(): Promise<AdminDriver[]> {
  const { data } = await api.get<AdminDriver[]>(`${API_V1_PREFIX}/admin/marketplace/drivers/`);
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
