import v1Client from '@/shared/lib/api/v1Client';

export type PartnerReportData = {
  days?: number;
  timeframe?: string;
  labels?: string[];
  revenue: number[];
  orders: number[];
  products?: { labels: string[]; data: number[] };
  drivers?: { labels: string[]; data: number[] };
  customers?: { labels: string[]; data: number[] };
  summary?: {
    revenue_total?: number;
    orders_total?: number;
  };
  comparison?: {
    revenue?: Record<string, unknown>;
    orders?: Record<string, unknown>;
  };
  period_start?: string;
  period_end?: string;
  previous_period_start?: string;
  previous_period_end?: string;
  total_store_amount?: number;
  total_paid_amount?: number;
  proof_of_payment?: string;
};

export async function fetchPartnerReport(params?: {
  timeframe?: string;
  days?: number;
  start_date?: string;
  end_date?: string;
}): Promise<PartnerReportData> {
  const { data } = await v1Client.get<PartnerReportData>('/partner/reports/', { params });
  return data;
}

export async function fetchPartnerReportCustomers() {
  const { data } = await v1Client.get<unknown[] | { results: unknown[] }>('/partner/reports/customers/');
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchPartnerReportDrivers() {
  const { data } = await v1Client.get<unknown[] | { results: unknown[] }>('/partner/reports/drivers/');
  return Array.isArray(data) ? data : data.results ?? [];
}
