'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { selectUser, selectAuthHydrated } from '@/redux/slices/authSlice';
import { clearAllCart, clearCart, selectBasketHydrated } from '@/redux/slices/basketSlice';
import { readAuthToken } from '@/lib/authToken';
import { redirectToCheckout } from '@/lib/pendingPayment';
import { baseAPI } from '@/services/types';
import type { CartItem } from '@/services/types';
import AddressInput from '@/app/Checkout/AddressInput';
import PaymentDetails from '@/app/Checkout/PaymentDetails';
import { validateCouponRequest } from '@/services/checkoutService';
import { useTranslation } from '@/hooks/useTranslation';
import { useGroceryCartQuote } from '@/hooks/useGroceryCartQuote';
import { useCreatePaymentMutation, useUploadPaymentProofMutation } from '@/redux/slices/paymentsApi';
import type { PaymentInitializeResponse } from '@/types/payments';

type StoreGroup = {
  storeId: number;
  items: CartItem[];
  subtotal: number;
};

type CheckoutResult = {
  status?: string;
  error?: string;
  errors?: Array<{ error: string; store_id?: number }>;
  created_orders?: number[];
  order_totals?: Array<{ order_id: number; store_id: number; total: string }>;
};

type MultipleOrderPayload = {
  access_token: string;
  coupon_code?: string;
  orders: Array<{
    store_id: number;
    address: string;
    location: string;
    use_current_location: boolean;
    delivery_fee: string;
    payment_method: string;
    delivery_notes: string;
    order_details: Array<{ product_id: number; quantity: number; addons?: number[]; special_instructions?: string }>;
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
  const authHydrated = useAppSelector(selectAuthHydrated);
  const token = useAppSelector((state) => state.auth.token);
  const items = useAppSelector((state) => state.basket.items);
  const basketHydrated = useAppSelector(selectBasketHydrated);

  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotedFees, setQuotedFees] = useState<Record<number, number>>({});
  const [quoteFailed, setQuoteFailed] = useState(false);
  const [createPayment] = useCreatePaymentMutation();
  const [uploadProof] = useUploadPaymentProofMutation();
  const orderPlacedRef = useRef(false);

  const storeGroups = useMemo(() => groupItemsByStore(items), [items]);
  const { subtotal } = useGroceryCartQuote(items);
  const deliveryFee = useMemo(
    () => storeGroups.reduce((sum, group) => sum + (quotedFees[group.storeId] ?? 0), 0),
    [storeGroups, quotedFees],
  );
  const total = Math.max(subtotal + deliveryFee - couponDiscount, 0);

  useEffect(() => {
    if (!authHydrated) return;
    if (!user && !token) {
      router.replace('/LoginScreenUser?next=/Checkout');
    }
  }, [authHydrated, user, token, router]);

  useEffect(() => {
    if (!useCurrentLocation || coords || typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: false, timeout: 15000 },
    );
  }, [useCurrentLocation, coords]);

  useEffect(() => {
    if (!storeGroups.length) return;
    let cancelled = false;
    const loadQuotes = async () => {
      const next: Record<number, number> = {};
      let failed = false;
      await Promise.all(
        storeGroups.map(async (group) => {
          try {
            const response = await fetch(
              `${baseAPI}/api/v1/marketplace/checkout/quote/?store_id=${group.storeId}`,
            );
            if (!response.ok) {
              failed = true;
              return;
            }
            const data = (await response.json()) as { delivery_fee?: string };
            next[group.storeId] = Number(data.delivery_fee) || 0;
          } catch {
            failed = true;
          }
        }),
      );
      if (!cancelled) {
        setQuotedFees(next);
        setQuoteFailed(failed);
      }
    };
    void loadQuotes();
    return () => {
      cancelled = true;
    };
  }, [storeGroups]);

  useEffect(() => {
    if (!authHydrated || !basketHydrated) return;
    // After a successful order the cart is cleared on purpose; let the /orders redirect win.
    if (orderPlacedRef.current) return;
    if (items.length === 0 && !loading) {
      router.replace('/CartPage');
    }
  }, [authHydrated, basketHydrated, items.length, loading, router]);

  const handleApplyCoupon = async () => {
    setCouponMessage(null);
    if (!couponCode.trim()) return;
    try {
      // The server applies a coupon to the first store's order only.
      const result = await validateCouponRequest(couponCode.trim(), storeGroups[0]?.subtotal ?? subtotal);
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
    const hasCoords = useCurrentLocation && coords !== null;
    if (!hasCoords && !userAddress.trim()) {
      setError(
        useCurrentLocation
          ? t('locationUnavailableEnterAddress', 'We could not get your location. Enter a delivery address.')
          : t('addressRequired', 'Delivery address is required.'),
      );
      return;
    }

    setLoading(true);
    setError(null);

    const payload: MultipleOrderPayload = {
      access_token: token,
      ...(couponDiscount > 0 && couponCode.trim() ? { coupon_code: couponCode.trim() } : {}),
      orders: storeGroups.map((group) => ({
        store_id: group.storeId,
        address: userAddress.trim(),
        location: hasCoords && coords ? `${coords.latitude},${coords.longitude}` : '',
        use_current_location: hasCoords,
        delivery_fee: String(quotedFees[group.storeId] ?? 0),
        payment_method: paymentMethod,
        delivery_notes: deliveryNotes,
        order_details: group.items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          ...(item.addon_ids?.length ? { addons: item.addon_ids } : {}),
          ...(item.special_instructions ? { special_instructions: item.special_instructions } : {}),
        })),
      })),
    };

    try {
      const response = await fetch(`${baseAPI}/api/v1/marketplace/checkout/multiple/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as CheckoutResult;
      const orderIds = data.created_orders ?? [];
      const firstError = data.errors?.[0]?.error || data.error || t('checkoutFailed', 'Checkout failed.');
      // The backend answers "partial_success" even when every store failed; only treat it as
      // placed when at least one order was actually created.
      if ((data.status === 'success' || data.status === 'partial_success') && orderIds.length > 0) {
        const failedStoreIds = new Set(
          (data.errors ?? [])
            .map((entry) => entry.store_id)
            .filter((id): id is number => typeof id === 'number'),
        );
        const placedGroups = storeGroups.filter((group) => !failedStoreIds.has(group.storeId));
        const isPartial = failedStoreIds.size > 0;
        const clearPlacedItems = () => {
          if (isPartial) {
            placedGroups.forEach((group) => dispatch(clearCart(group.storeId)));
          } else {
            dispatch(clearAllCart());
          }
        };
        const finish = (notice: string | null) => {
          clearPlacedItems();
          if (isPartial) {
            // Stay on checkout so the customer sees which store failed; its items remain in the cart.
            setError(
              `${t('checkoutPartialSuccess', 'Some orders were placed, but not all.')} ${firstError}`,
            );
            return;
          }
          orderPlacedRef.current = true;
          router.push('/orders');
          if (notice) setError(notice);
        };
        if (paymentMethod && paymentMethod !== 'cash') {
          try {
            let redirectUrl: string | null = null;
            let redirectReference: string | null = null;
            let notice: string | null = null;
            const serverTotals = new Map(
              (data.order_totals ?? []).map((entry) => [entry.order_id, Number(entry.total)]),
            );
            for (const orderId of orderIds) {
              const amount = serverTotals.get(orderId);
              if (amount === undefined || !Number.isFinite(amount)) {
                throw new Error('missing_order_total');
              }
              const pay: PaymentInitializeResponse = await createPayment({
                amount,
                method: paymentMethod,
                phone: paymentPhone || undefined,
                service_type: 'order',
                object_id: orderId,
              }).unwrap();
              if (proofFile && pay.requires_action === 'upload_proof') {
                await uploadProof({ paymentId: pay.payment_id, file: proofFile }).unwrap();
              }
              if (pay.authorization_url) {
                redirectUrl = pay.authorization_url;
                redirectReference = pay.kudya_reference;
              }
              if (pay.customer_message) notice = pay.customer_message;
            }
            if (redirectUrl) {
              clearPlacedItems();
              orderPlacedRef.current = true;
              redirectToCheckout(redirectUrl, redirectReference);
              return;
            }
            finish(notice);
            return;
          } catch {
            clearPlacedItems();
            orderPlacedRef.current = true;
            setError(t('paymentFollowUpFailed', 'Order placed. Complete payment from your orders if prompted.'));
            router.push('/orders');
            return;
          }
        }
        finish(null);
        return;
      }
      setError(firstError);
    } catch {
      setError(t('checkoutFailed', 'Checkout failed.'));
    } finally {
      setLoading(false);
    }
  };

  if (!authHydrated || !user || items.length === 0) {
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
          <PaymentDetails
            serviceType="order"
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            phone={paymentPhone}
            setPhone={setPaymentPhone}
            proofFile={proofFile}
            setProofFile={setProofFile}
          />
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
            {quoteFailed ? (
              <p className="text-xs text-amber-700">
                {t('deliveryFeeQuoteFailed', 'Delivery fee could not be loaded; the final total is confirmed when you place the order.')}
              </p>
            ) : null}
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
