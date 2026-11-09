import api from '@/services/api';
import type {
  MoneyTransferRow,
  TransferDestination,
  TransferQuote,
  TransferVerification,
} from '@/types/payments';

type Beneficiary = Record<string, Record<string, string>>;

export async function fetchTransferDestinations(): Promise<TransferDestination[]> {
  const { data } = await api.get<{ destinations: TransferDestination[] }>('/api/payments/transfers/destinations/');
  return data.destinations;
}

export async function fetchTransfers(): Promise<MoneyTransferRow[]> {
  const { data } = await api.get<{ transfers: MoneyTransferRow[] }>('/api/payments/transfers/');
  return data.transfers;
}

export async function fetchTransfer(id: number): Promise<MoneyTransferRow> {
  const { data } = await api.get<MoneyTransferRow>(`/api/payments/transfers/${id}/`);
  return data;
}

export async function requestTransferQuote(body: {
  payer_id: string;
  amount: string;
  currency: string;
  destination_currency: string;
}): Promise<TransferQuote> {
  const { data } = await api.post<TransferQuote>('/api/payments/transfers/quotes/', body);
  return data;
}

export async function verifyTransferBeneficiary(payerId: string, beneficiary: Beneficiary): Promise<TransferVerification> {
  const { data } = await api.post<TransferVerification>('/api/payments/transfers/verify/', {
    payer_id: payerId,
    beneficiary,
  });
  return data;
}

export async function sendMoneyTransfer(
  body: { quote_id: number; beneficiary: Beneficiary; pin: string; confirmed: true },
  idempotencyKey: string,
): Promise<MoneyTransferRow> {
  const { data } = await api.post<MoneyTransferRow>('/api/payments/transfers/', body, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return data;
}
