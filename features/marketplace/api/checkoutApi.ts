import v1Client from '@/shared/lib/api/v1Client';
import type { MarketplaceVertical } from '@/features/marketplace/lib/normalizeStores';

export type CheckoutOrderPayload = {
  access_token: string;
  store_id: number;
  address?: string;
  location?: string;
  use_current_location?: boolean;
  delivery_fee: string;
  payment_method: string;
  delivery_notes?: string;
  coupon_code?: string;
  order_details: Array<{ product_id: number; quantity: number }>;
};

export type MultipleCheckoutPayload = {
  access_token: string;
  orders: Array<Omit<CheckoutOrderPayload, 'access_token'>>;
};

export async function fetchStoreForCheckout(storeId: number, vertical?: MarketplaceVertical) {
  const path = vertical
    ? `/${vertical}/stores/${storeId}/`
    : `/marketplace/stores/${storeId}/`;
  const { data } = await v1Client.get(path);
  return data;
}

export async function completeCheckout(payload: CheckoutOrderPayload, vertical?: MarketplaceVertical) {
  const path = vertical ? `/${vertical}/checkout/` : '/marketplace/checkout/';
  const { data } = await v1Client.post(path, payload);
  return data;
}

export async function completeMultipleCheckout(
  payload: MultipleCheckoutPayload,
  vertical?: MarketplaceVertical,
) {
  const path = vertical
    ? `/${vertical}/checkout/multiple/`
    : '/marketplace/checkout/multiple/';
  const { data } = await v1Client.post(path, payload);
  return data;
}

export async function validateCouponV1(couponCode: string, subtotal = 0, vertical?: MarketplaceVertical) {
  const path = vertical
    ? `/${vertical}/coupons/validate/`
    : '/marketplace/coupons/validate/';
  const { data } = await v1Client.post(path, {
    coupon_code: couponCode,
    subtotal,
  });
  return data as {
    valid: boolean;
    code?: string;
    discount_amount?: number;
    message?: string;
  };
}

export async function fetchProductsByStore(storeId: number, vertical: MarketplaceVertical) {
  const { data } = await v1Client.get<unknown[] | { results: unknown[] }>(`/${vertical}/products/`, {
    params: { store: storeId },
  });
  return Array.isArray(data) ? data : data.results ?? [];
}
