'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, LocateFixed, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { clearCart, selectBasketHydrated, selectCartItems } from '@/redux/slices/basketSlice';
import { useCreatePaymentMutation, useUploadPaymentProofMutation } from '@/redux/slices/paymentsApi';
import { redirectToCheckout } from '@/lib/pendingPayment';
import PaymentDetails from '@/app/Checkout/PaymentDetails';
import {
  foodErrorCode,
  foodErrorMessage,
  useCreateCustomerAddressMutation,
  useGetAvailableFoodCouponsQuery,
  useGetCustomerAddressesQuery,
  useGetFoodStoreQuery,
  usePlaceFoodOrderMutation,
} from '../api/foodApi';
import CheckoutSummary from '../components/CheckoutSummary';
import FoodCart from '../components/FoodCart';
import FoodHeader from '../components/FoodHeader';
import { FoodError, FoodSkeletonGrid } from '../components/FoodStates';
import { useBrowserLocation } from '../hooks/useBrowserLocation';
import { useFoodCartQuote } from '../hooks/useFoodCartQuote';
import { foodCartItems, groupByStore, toQuoteLines } from '../lib/cartLines';
import { MAX_DELIVERY_NOTES, newIdempotencyKey, validateCheckoutForm } from '../schemas/checkout';
import { FulfilmentToggle } from './FoodCartScreen';
import type { FulfilmentType } from '../types';

type AddressMode = 'saved' | 'current' | 'new';

const PAYMENT_SERVICE = 'food';

export default function FoodCheckoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector(selectBasketHydrated);
  const allFood = foodCartItems(useAppSelector(selectCartItems));
  const firstGroup = useMemo(() => Array.from(groupByStore(allFood).entries())[0], [allFood]);
  const storeId = firstGroup?.[0];
  const items = useMemo(() => firstGroup?.[1] ?? [], [firstGroup]);

  const store = useGetFoodStoreQuery(storeId ?? 0, { skip: !storeId });
  const addresses = useGetCustomerAddressesQuery();
  const [createAddress] = useCreateCustomerAddressMutation();
  const [placeOrder] = usePlaceFoodOrderMutation();
  const [createPayment] = useCreatePaymentMutation();
  const [uploadProof] = useUploadPaymentProofMutation();
  const { coords, status: locationStatus, locate } = useBrowserLocation();

  const [fulfilment, setFulfilment] = useState<FulfilmentType>(params.get('fulfilment') === 'pickup' ? 'pickup' : 'delivery');
  const [couponInput, setCouponInput] = useState(params.get('coupon') ?? '');
  const [couponCode, setCouponCode] = useState(params.get('coupon') ?? '');
  const [addressMode, setAddressMode] = useState<AddressMode>('saved');
  const [addressId, setAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const idempotencyKey = useRef<string>(newIdempotencyKey());
  const placedRef = useRef(false);

  const pickupAvailable = Boolean(store.data?.supports_pickup);
  const effectiveFulfilment: FulfilmentType = pickupAvailable ? fulfilment : 'delivery';
  const { quote, linesByKey, loading, error, refresh } = useFoodCartQuote(items, {
    couponCode,
    fulfilment: effectiveFulfilment,
  });
  const coupons = useGetAvailableFoodCouponsQuery(quote ? { subtotal: quote.subtotal } : undefined);
  const currency = quote?.currency || store.data?.currency || 'ZAR';
  const storeQuote = quote?.stores.find((entry) => entry.store_id === storeId);

  const cartSignature = JSON.stringify([toQuoteLines(items), couponCode, effectiveFulfilment]);
  useEffect(() => {
    // A changed cart is a new checkout attempt; an unchanged retry must reuse the key.
    idempotencyKey.current = newIdempotencyKey();
  }, [cartSignature]);

  useEffect(() => {
    const saved = addresses.data ?? [];
    if (addressId !== null || !saved.length) {
      if (addresses.isSuccess && !saved.length && addressMode === 'saved') setAddressMode('new');
      return;
    }
    setAddressId((saved.find((row) => row.is_default) ?? saved[0]).id);
  }, [addresses.data, addresses.isSuccess, addressId, addressMode]);

  useEffect(() => {
    if (hydrated && !placedRef.current && items.length === 0) router.replace('/food/cart');
  }, [hydrated, items.length, router]);

  const selectedAddress = (addresses.data ?? []).find((row) => row.id === addressId) ?? null;

  const resolveDelivery = () => {
    if (effectiveFulfilment === 'pickup') return { address: '', location: '', use_current_location: false };
    if (addressMode === 'saved' && selectedAddress) {
      const location =
        selectedAddress.latitude && selectedAddress.longitude ? `${selectedAddress.latitude},${selectedAddress.longitude}` : '';
      return { address: selectedAddress.address, location, use_current_location: false };
    }
    if (addressMode === 'current') {
      return {
        address: newAddress.trim(),
        location: coords ? `${coords.latitude},${coords.longitude}` : '',
        use_current_location: Boolean(coords),
      };
    }
    return { address: newAddress.trim(), location: '', use_current_location: false };
  };

  const startPayment = async (orderId: number, amount: number) => {
    const pay = await createPayment({
      amount,
      method: paymentMethod,
      phone: paymentPhone || undefined,
      service_type: PAYMENT_SERVICE,
      object_id: orderId,
    }).unwrap();
    if (proofFile && pay.requires_action === 'upload_proof') {
      await uploadProof({ paymentId: pay.payment_id, file: proofFile }).unwrap();
    }
    if (pay.authorization_url) {
      redirectToCheckout(pay.authorization_url, pay.kudya_reference);
      return true;
    }
    return false;
  };

  const submit = async () => {
    if (submitting || !storeId) return;
    const delivery = resolveDelivery();
    const validation = validateCheckoutForm({
      fulfilment: effectiveFulfilment,
      address: delivery.address,
      useCurrentLocation: addressMode === 'current',
      coords: addressMode === 'current' ? coords : null,
      paymentMethod,
      termsAccepted: terms,
      deliveryNotes: notes,
    });
    if (validation) {
      const messages: Record<string, string> = {
        foodAddressRequired: t('foodAddressRequired', 'Enter a delivery address.'),
        foodLocationUnavailable: t('foodLocationUnavailable', 'We could not get your location. Enter an address instead.'),
        foodPaymentMethodRequired: t('foodPaymentMethodRequired', 'Choose a payment method.'),
        foodAcceptTerms: t('foodAcceptTerms', 'Please accept the terms to place your order.'),
        foodNotesTooLong: t('foodNotesTooLong', 'Delivery instructions are too long.'),
      };
      setFormError(messages[validation]);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      if (effectiveFulfilment === 'delivery' && addressMode === 'new' && saveAddress) {
        const saved = await createAddress({ label: t('foodAddressLabel', 'Delivery'), address: delivery.address })
          .unwrap()
          .catch(() => null);
        if (saved) {
          setAddressMode('saved');
          setAddressId(saved.id);
        }
      }
      const order = await placeOrder({
        idempotencyKey: idempotencyKey.current,
        body: {
          store_id: storeId,
          fulfilment_type: effectiveFulfilment,
          ...delivery,
          payment_method: paymentMethod,
          delivery_notes: [notes.trim(), selectedAddress?.instructions].filter(Boolean).join(' · '),
          ...(quote?.coupon_code ? { coupon_code: quote.coupon_code } : {}),
          order_details: toQuoteLines(items),
        },
      }).unwrap();

      placedRef.current = true;
      dispatch(clearCart(storeId));
      const orderUrl = `/account/orders/${order.order_id}?confirmed=1`;
      if (paymentMethod !== 'cash') {
        try {
          const redirected = await startPayment(order.order_id, Number(order.total));
          if (redirected) return;
        } catch {
          router.push(`${orderUrl}&payment=failed`);
          return;
        }
      }
      router.push(orderUrl);
    } catch (err) {
      const code = foodErrorCode(err);
      if (code === 'open_order_exists' || code === 'store_closed' || code === 'store_unavailable') refresh();
      setFormError(foodErrorMessage(err, t('foodCheckoutFailed', 'We could not place your order. Please try again.')));
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated || (items.length === 0 && !placedRef.current)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <FoodHeader backHref="/food/cart" />
        <div className="mx-auto max-w-5xl px-4 py-6">
          <FoodSkeletonGrid count={3} variant="row" />
        </div>
      </div>
    );
  }

  const blocked = submitting || loading || Boolean(error) || !quote || quote.has_errors;
  const eligibleCoupons = (coupons.data ?? []).filter((coupon) => coupon.eligible);

  return (
    <div className="min-h-screen bg-slate-50">
      <FoodHeader backHref="/food/cart" title={t('foodCheckout', 'Checkout')} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('foodCheckout', 'Checkout')}</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{t('foodHowToReceive', 'How would you like to receive it?')}</h2>
              <FulfilmentToggle value={effectiveFulfilment} onChange={setFulfilment} pickupAvailable={pickupAvailable} />
              {store.data ? (
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" aria-hidden />
                  {effectiveFulfilment === 'pickup'
                    ? t('foodPickupEta', 'Ready for pickup in about {minutes} min at {address}', {
                        minutes: store.data.preparation_time_minutes,
                        address: store.data.address,
                      })
                    : t('foodDeliveryEta', 'Estimated delivery: {min}-{max} min', {
                        min: store.data.delivery_time_min,
                        max: store.data.delivery_time_max,
                      })}
                </p>
              ) : null}
            </section>

            {effectiveFulfilment === 'delivery' ? (
              <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">{t('foodDeliveryAddress', 'Delivery address')}</h2>
                {addresses.isLoading ? (
                  <FoodSkeletonGrid count={2} variant="row" />
                ) : addresses.isError ? (
                  <FoodError onRetry={addresses.refetch} />
                ) : (
                  <div className="space-y-2">
                    {(addresses.data ?? []).map((row) => (
                      <label
                        key={row.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
                          addressMode === 'saved' && addressId === row.id ? 'border-kudya bg-violet-50' : 'border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="food-address"
                          checked={addressMode === 'saved' && addressId === row.id}
                          onChange={() => {
                            setAddressMode('saved');
                            setAddressId(row.id);
                          }}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-semibold text-slate-900">{row.label}</span>
                          <span className="block text-slate-600">{row.address}</span>
                          {row.instructions ? <span className="block text-xs text-slate-500">{row.instructions}</span> : null}
                        </span>
                      </label>
                    ))}
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${
                        addressMode === 'current' ? 'border-kudya bg-violet-50' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="food-address"
                        checked={addressMode === 'current'}
                        onChange={() => {
                          setAddressMode('current');
                          if (!coords) locate();
                        }}
                      />
                      <LocateFixed className="h-4 w-4 text-kudya" aria-hidden />
                      <span>
                        {t('foodUseCurrentLocation', 'Use my current location')}
                        {addressMode === 'current' ? (
                          <span className="block text-xs text-slate-500">
                            {coords
                              ? t('foodLocationReady', 'Location found')
                              : locationStatus === 'locating'
                                ? t('foodLocating', 'Locating…')
                                : t('foodLocationAddHint', 'Add a street address too so the courier can find you.')}
                          </span>
                        ) : null}
                      </span>
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${
                        addressMode === 'new' ? 'border-kudya bg-violet-50' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="food-address"
                        checked={addressMode === 'new'}
                        onChange={() => setAddressMode('new')}
                      />
                      <MapPin className="h-4 w-4 text-kudya" aria-hidden />
                      {t('foodNewAddress', 'Enter a new address')}
                    </label>
                    {addressMode !== 'saved' ? (
                      <div className="space-y-2 pt-1">
                        <input
                          value={newAddress}
                          onChange={(event) => setNewAddress(event.target.value)}
                          placeholder={t('foodAddressPlaceholder', 'Street, number, suburb, city')}
                          aria-label={t('foodDeliveryAddress', 'Delivery address')}
                          maxLength={500}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                        {addressMode === 'new' ? (
                          <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />
                            {t('foodSaveAddress', 'Save this address for next time')}
                          </label>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )}
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-900">{t('foodDeliveryInstructions', 'Delivery instructions')}</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    maxLength={MAX_DELIVERY_NOTES}
                    rows={2}
                    placeholder={t('foodDeliveryInstructionsPlaceholder', 'Gate code, building, landmarks…')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </section>
            ) : null}

            <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">{t('foodPayment', 'Payment')}</h2>
              <PaymentDetails
                serviceType={PAYMENT_SERVICE}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                phone={paymentPhone}
                setPhone={setPaymentPhone}
                proofFile={proofFile}
                setProofFile={setProofFile}
              />
              <p className="text-xs text-slate-500">
                {t('foodPaymentCountryHint', 'Only payment methods available in your country are shown.')}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">{t('foodOrderReview', 'Review your order')}</h2>
              <FoodCart
                storeName={store.data?.name || items[0]?.store_name || ''}
                items={items}
                linesByKey={linesByKey}
                storeQuote={storeQuote}
                currency={currency}
                editable={false}
              />
              <Link href="/food/cart" className="text-sm font-medium text-kudya hover:underline">
                {t('foodEditCart', 'Edit cart')}
              </Link>
            </section>
          </div>

          <aside className="h-fit space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-20">
            <div className="space-y-2">
              <label htmlFor="checkout-coupon" className="text-sm font-semibold text-slate-900">
                {t('foodPromoCode', 'Promo code')}
              </label>
              <div className="flex gap-2">
                <input
                  id="checkout-coupon"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={() => setCouponCode(couponInput.trim())}
                  disabled={!couponInput.trim()}
                  className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {t('foodApply', 'Apply')}
                </button>
              </div>
              {couponCode && quote?.coupon_error ? <p className="text-xs text-red-600">{quote.coupon_error}</p> : null}
              {couponCode && quote?.coupon_code ? (
                <p className="text-xs text-emerald-700">{t('foodCouponApplied', 'Code {code} applied', { code: quote.coupon_code })}</p>
              ) : null}
              {eligibleCoupons.length ? (
                <div className="flex flex-wrap gap-2">
                  {eligibleCoupons.slice(0, 4).map((coupon) => (
                    <button
                      key={coupon.code}
                      type="button"
                      onClick={() => {
                        setCouponInput(coupon.code);
                        setCouponCode(coupon.code);
                      }}
                      title={coupon.description}
                      className="rounded-full border border-dashed border-food px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-food-soft"
                    >
                      {coupon.code} · {coupon.title}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {error ? (
              <FoodError message={t('foodQuoteFailed', 'We could not price your cart.')} onRetry={refresh} />
            ) : (
              <CheckoutSummary
                currency={currency}
                subtotal={storeQuote?.subtotal ?? quote?.subtotal ?? 0}
                deliveryFee={storeQuote?.delivery_fee ?? quote?.delivery_fee ?? 0}
                discount={storeQuote?.discount_amount ?? quote?.discount_amount ?? 0}
                promotionDiscount={storeQuote?.promotion_discount}
                total={storeQuote?.total ?? quote?.total ?? 0}
                pickup={effectiveFulfilment === 'pickup'}
                loading={loading}
              />
            )}
            {storeQuote?.error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {storeQuote.error}
              </p>
            ) : null}

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} className="mt-1" />
              <span>
                {t('foodTermsPrefix', 'I agree to the')}{' '}
                <Link href="/TermsOfService" className="font-medium text-kudya underline" target="_blank">
                  {t('foodTermsLink', 'Terms of Service')}
                </Link>
              </span>
            </label>

            {formError ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {formError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void submit()}
              disabled={blocked}
              aria-busy={submitting}
              className="w-full rounded-full bg-food py-3 font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? t('foodPlacingOrder', 'Placing your order…') : t('foodPlaceOrder', 'Place order')}
            </button>
            <p className="text-center text-xs text-slate-500">
              {t('foodPaidOnlyWhenVerified', 'Your order is marked paid only after Kudya confirms the payment with the provider.')}
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
