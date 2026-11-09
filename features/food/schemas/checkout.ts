import type { FulfilmentType } from '../types';

export type CheckoutForm = {
  fulfilment: FulfilmentType;
  address: string;
  useCurrentLocation: boolean;
  coords: { latitude: number; longitude: number } | null;
  paymentMethod: string;
  termsAccepted: boolean;
  deliveryNotes: string;
};

export type CheckoutFormError =
  | 'foodAddressRequired'
  | 'foodLocationUnavailable'
  | 'foodPaymentMethodRequired'
  | 'foodAcceptTerms'
  | 'foodNotesTooLong';

export const MAX_DELIVERY_NOTES = 500;

/** Client-side checks only; the server re-validates everything and owns pricing. */
export function validateCheckoutForm(form: CheckoutForm): CheckoutFormError | null {
  if (form.fulfilment === 'delivery') {
    if (form.useCurrentLocation) {
      if (!form.coords && !form.address.trim()) return 'foodLocationUnavailable';
    } else if (!form.address.trim()) {
      return 'foodAddressRequired';
    }
  }
  if (!form.paymentMethod) return 'foodPaymentMethodRequired';
  if (form.deliveryNotes.length > MAX_DELIVERY_NOTES) return 'foodNotesTooLong';
  if (!form.termsAccepted) return 'foodAcceptTerms';
  return null;
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
