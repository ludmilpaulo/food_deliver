'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { selectUser } from '@/redux/slices/authSlice';
import { clearAllCart } from '@/redux/slices/basketSlice';
import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '@/services/types';
import type { CartItem } from '@/services/types';
import AddressInput from '@/app/Checkout/AddressInput';
import PaymentDetails from '@/app/Checkout/PaymentDetails';
import { validateCouponRequest } from '@/services/checkoutService';
import { useTranslation } from '@/hooks/useTranslation';

type StoreGroup = {
  storeId: number;
  items: CartItem[];
  subtotal: number;
};

type MultipleOrderPayload = {
  access_token: string;
  orders: Array<{
    store_id: number;
    address: string;
    location: string;
    use_current_location: boolean;
    delivery_fee: string;
    payment_method: string;
    delivery_notes: string;
    order_details: Array<{ product_id: number; quantity: number }>;
  }>;
};

function groupItemsByStore(items: CartItem[]): StoreGroup[] {
  const map = new Map<number, StoreGroup>();
  for (const item of items) {
    const existing = map.get(item.store);
    if (existing) {
      existing.items.push(item);
      existing.subtotal += item.price * item.quantity;
    } else {
      map.set(item.store, {
        storeId: item.store,
        items: [item],
        subtotal: item.price * item.quantity,
      });
    }
  }
  return Array.from(map.values());
}

export default function CheckoutExperience() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const token = useAppSelector((state) => state.auth.token);
  const items = useAppSelector((state) => state.basket.items);

  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [userAddress, setUserAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Entrega');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeGroups = useMemo(() => groupItemsByStore(items), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const deliveryFee = storeGroups.length * 100;
  const total = Math.max(subtotal + deliveryFee - couponDiscount, 0);

  useEffect(() => {
    if (!user && !token) {
      router.replace('/LoginScreenUser?next=/Checkout');
    }
  }, [user, token, router]);

  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.replace('/CartPage');
    }
  }, [items.length, loading, router]);

  const handleApplyCoupon = async () => {
    setCouponMessage(null);
    if (!couponCode.trim()) return;
    try {
      const result = await validateCouponRequest(couponCode.trim(), subtotal);
      if (result.valid) {
        setCouponDiscount(Number(result.discount_amount) || 0);
        setCouponMessage(result.message || t('couponApplied', 'Coupon applied'));
      } else {
        setCouponDiscount(0);
        setCouponMessage(result.message || t('invalidCoupon', 'Invalid coupon'));
      }
    } catch {
      setCouponDiscount(0);
      setCouponMessage(t('invalidCoupon', 'Invalid coupon'));
    }
  };

  const handlePlaceOrder = async () => {
    const token = readAuthToken() || user?.token;
    if (!token) {
      router.push('/LoginScreenUser?next=/Checkout');
      return;
    }
    if (!useCurrentLocation && !userAddress.trim()) {
      setError(t('addressRequired', 'Delivery address is required.'));
      return;
    }

    setLoading(true);
    setError(null);

    const payload: MultipleOrderPayload = {
      access_token: token,
      orders: storeGroups.map((group) => ({
        store_id: group.storeId,
        address: useCurrentLocation ? '' : userAddress.trim(),
        location: '',
        use_current_location: useCurrentLocation,
        delivery_fee: '100',
        payment_method: paymentMethod,
        delivery_notes: deliveryNotes,
        order_details: group.items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      })),
    };

    try {
      const response = await fetch(`${baseAPI}/order/orders/add-multiple/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { status?: string; error?: string; errors?: Array<{ error: string }> };
      if (data.status === 'success' || data.status === 'partial_success') {
        dispatch(clearAllCart());
        router.push('/orders');
        return;
      }
      const firstError = data.errors?.[0]?.error || data.error || t('checkoutFailed', 'Checkout failed.');
      setError(firstError);
    } catch {
      setError(t('checkoutFailed', 'Checkout failed.'));
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">
        {t('loadingCheckout', 'Loading checkout…')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{t('checkout', 'Checkout')}</h1>
      <p className="mt-2 text-slate-600">
        {t('checkoutSubtitle', 'Review your items, delivery details, and payment method.')}
      </p>

      <div className="mt-8 space-y-6">
        {storeGroups.map((group) => (
          <section key={group.storeId} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('storeOrder', 'Store')} #{group.storeId}
            </h2>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => (
                <li key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between text-sm text-slate-700">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <AddressInput
            useCurrentLocation={useCurrentLocation}
            setUseCurrentLocation={setUseCurrentLocation}
            userAddress={userAddress}
            setUserAddress={setUserAddress}
          />
          <PaymentDetails paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          <label className="mb-2 block text-gray-700">{t('deliveryNotes', 'Delivery notes')}</label>
          <textarea
            className="mb-4 w-full rounded border border-gray-300 p-2"
            rows={3}
            value={deliveryNotes}
            onChange={(event) => setDeliveryNotes(event.target.value)}
          />
          <div className="mb-4 flex gap-2">
            <input
              className="flex-1 rounded border border-gray-300 p-2"
              placeholder={t('couponCode', 'Coupon code')}
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-white"
            >
              {t('applyCoupon', 'Apply')}
            </button>
          </div>
          {couponMessage ? <p className="mb-4 text-sm text-slate-600">{couponMessage}</p> : null}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="space-y-2 text-slate-700">
            <div className="flex justify-between">
              <span>{t('subtotal', 'Subtotal')}</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('deliveryFee', 'Delivery fee')}</span>
              <span>{deliveryFee.toFixed(2)}</span>
            </div>
            {couponDiscount > 0 ? (
              <div className="flex justify-between text-green-700">
                <span>{t('discount', 'Discount')}</span>
                <span>-{couponDiscount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-slate-900">
              <span>{t('total', 'Total')}</span>
              <span>{total.toFixed(2)}</span>
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            disabled={loading}
            onClick={handlePlaceOrder}
            className="mt-6 w-full rounded-xl bg-sky-600 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? t('processing', 'Processing…') : t('confirmOrder', 'Confirm order')}
          </button>
          <Link href="/CartPage" className="mt-3 block text-center text-sm text-sky-700">
            {t('backToCart', 'Back to cart')}
          </Link>
        </section>
      </div>
    </div>
  );
}
