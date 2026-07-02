import { baseAPI } from '@/services/types';

/** Partner earnings are scoped to the authenticated user at GET /services/earnings/ */
const EARNINGS_URL = `${baseAPI}/services/earnings/`;

export interface EarningsRecord {
  id: number;
  earning_type: string;
  amount: string;
  is_paid_out: boolean;
  earned_at: string;
}

export const fetchPartnerEarnings = async (): Promise<EarningsRecord[]> => {
  const response = await fetch(EARNINGS_URL, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to load earnings (${response.status})`);
  }
  return response.json() as Promise<EarningsRecord[]>;
};

export const fetchPartnerEarningsStats = async (): Promise<Record<string, unknown>> => {
  const response = await fetch(`${EARNINGS_URL}stats/`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to load earnings stats (${response.status})`);
  }
  return response.json() as Promise<Record<string, unknown>>;
};
