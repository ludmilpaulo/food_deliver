import type { CreatePaymentRequest } from '@/redux/slices/paymentsApi';
import type { PaymentInitializeResponse } from '@/types/payments';
import { redirectToCheckout } from '@/lib/pendingPayment';

export function isImmediateCaptureMethod(method: string): boolean {
  return Boolean(method) && method !== 'cash' && method !== 'pay_at_clinic';
}

type FollowUpArgs = {
  createPayment: (body: CreatePaymentRequest) => { unwrap: () => Promise<PaymentInitializeResponse> };
  uploadProof?: (args: { paymentId: number; file: File }) => { unwrap: () => Promise<unknown> };
  amount: number | string;
  method: string;
  phone?: string;
  proofFile?: File | null;
  serviceType: string;
  objectId?: number;
  currency?: string;
};

export async function followUpPayment(args: FollowUpArgs): Promise<{
  payment: PaymentInitializeResponse | null;
  redirected: boolean;
}> {
  if (!isImmediateCaptureMethod(args.method)) {
    return { payment: null, redirected: false };
  }
  const payment = await args.createPayment({
    amount: args.amount,
    method: args.method,
    phone: args.phone || undefined,
    service_type: args.serviceType,
    object_id: args.objectId,
    currency: args.currency,
  }).unwrap();
  if (args.proofFile && payment.requires_action === 'upload_proof' && args.uploadProof) {
    await args.uploadProof({ paymentId: payment.payment_id, file: args.proofFile }).unwrap();
  }
  if (payment.authorization_url) {
    redirectToCheckout(payment.authorization_url, payment.kudya_reference);
    return { payment, redirected: true };
  }
  return { payment, redirected: false };
}
