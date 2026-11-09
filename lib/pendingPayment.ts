const KEY = 'kudya_pending_payment_reference';

export function rememberPendingPayment(reference: string | null | undefined): void {
  if (!reference || typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(KEY, reference);
  } catch {
    /* storage unavailable */
  }
}

export function readPendingPayment(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function redirectToCheckout(url: string, reference?: string | null): void {
  rememberPendingPayment(reference);
  window.location.assign(url);
}
