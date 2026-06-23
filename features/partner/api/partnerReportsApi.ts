import v1Client from '@/shared/lib/api/v1Client';

export type PartnerReportData = {
  revenue: number[];
  orders: number[];
  products?: { labels: string[]; data: number[] };
  drivers?: { labels: string[]; data: number[] };
  customers?: { labels: string[]; data: number[] };
  total_store_amount?: number;
  total_paid_amount?: number;
  proof_of_payment?: string;
};

export async function fetchPartnerReport(params?: {
  timeframe?: string;
  start_date?: string;
  end_date?: string;
}): Promise<PartnerReportData> {
  const { data } = await v1Client.get<PartnerReportData>('/partner/reports/', { params });
  return data;
}

export async function fetchPartnerReportCustomers() {
  const { data } = await v1Client.get('/partner/reports/customers/');
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchPartnerReportDrivers() {
  const { data } = await v1Client.get('/partner/reports/drivers/');
  return Array.isArray(data) ? data : data.results ?? [];
}
