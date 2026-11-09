'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { Bike, ShoppingBag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/redux/store';
import { selectBasketHydrated, selectCartItems } from '@/redux/slices/basketSlice';
import { selectUser } from '@/redux/slices/authSlice';
import { useGetFoodStoreQuery } from '../api/foodApi';
import CheckoutSummary from '../components/CheckoutSummary';
import FoodCart from '../components/FoodCart';
import FoodHeader from '../components/FoodHeader';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../components/FoodStates';
import { useFoodCartQuote } from '../hooks/useFoodCartQuote';
import { foodCartItems, groupByStore } from '../lib/cartLines';
import { restaurantHref } from '../lib/slug';
import type { FulfilmentType } from '../types';

export function FulfilmentToggle({
  value,
  onChange,
  pickupAvailable,
}: {
  value: FulfilmentType;
  onChange: (value: FulfilmentType) => void;
  pickupAvailable: boolean;
}) {
  const { t } = useTranslation();
  const option = (key: FulfilmentType, label: string, Icon: typeof Bike, disabled = false) => (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={value === key}
      onClick={() => onChange(key)}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        value === key ? 'border-kudya bg-violet-50 text-kudya' : 'border-slate-200 bg-white text-slate-700'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
  return (
    <div className="space-y-1">
      <div className="flex gap-3">
        {option('delivery', t('foodDelivery', 'Delivery'), Bike)}
        {option('pickup', t('foodPickup', 'Pickup'), ShoppingBag, !pickupAvailable)}
      </div>
      {!pickupAvailable ? (
        <p className="text-xs text-slate-500">{t('foodPickupNotOffered', 'This restaurant only offers delivery.')}</p>
      ) : null}
    </div>
  );
}

export default function FoodCartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const hydrated = useAppSelector(selectBasketHydrated);
  const user = useAppSelector(selectUser);
  const items = foodCartItems(useAppSelector(selectCartItems));
  const groups = useMemo(() => Array.from(groupByStore(items).entries()), [items]);
  const storeId = groups[0]?.[0];
  const store = useGetFoodStoreQuery(storeId ?? 0, { skip: !storeId });

  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [fulfilment, setFulfilment] = useState<FulfilmentType>('delivery');
  const pickupAvailable = Boolean(store.data?.supports_pickup);
  const effectiveFulfilment = pickupAvailable ? fulfilment : 'delivery';
  const { quote, linesByKey, loading, error, refresh } = useFoodCartQuote(items, {
    couponCode: user ? couponCode : undefined,
    fulfilment: effectiveFulfilment,
  });

  const currency = quote?.currency || store.data?.currency || 'ZAR';
  const storeQuote = quote?.stores.find((entry) => entry.store_id === storeId);
  const blocked = loading || Boolean(error) || !quote || quote.has_errors;

  const applyCoupon = (event: FormEvent) => {
    event.preventDefault();
    setCouponCode(couponInput.trim());
  };

  const goToCheckout = () => {
    const params = new URLSearchParams({ fulfilment: effectiveFulfilment });
    if (quote?.coupon_code) params.set('coupon', quote.coupon_code);
    const target = `/food/checkout?${params.toString()}`;
    router.push(user ? target : `/LoginScreenUser?next=${encodeURIComponent(target)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <FoodHeader backHref={store.data ? restaurantHref(store.data) : '/food'} title={t('foodYourCart', 'Your cart')} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('foodYourCart', 'Your cart')}</h1>
        {!hydrated ? (
          <div className="mt-6">
            <FoodSkeletonGrid count={2} variant="row" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6">
            <FoodEmpty
              title={t('foodCartEmpty', 'Your cart is empty')}
              message={t('foodCartEmptyHint', 'Add dishes from a restaurant to get started.')}
              action={
                <Link href="/food/restaurants" className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white">
                  {t('foodBrowseRestaurants', 'Browse restaurants')}
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {groups.length > 1 ? (
                <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">
                  {t('foodMultipleRestaurants', 'Your cart has dishes from several restaurants. Checkout places one order per restaurant, starting with the first.')}
                </p>
              ) : null}
              {groups.map(([id, lines]) => (
                <FoodCart
                  key={id}
                  storeName={lines[0]?.store_name || quote?.stores.find((entry) => entry.store_id === id)?.store_name || ''}
                  items={lines}
                  linesByKey={linesByKey}
                  storeQuote={quote?.stores.find((entry) => entry.store_id === id)}
                  currency={currency}
                />
              ))}
              {quote?.unavailable_product_ids.length ? (
                <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
                  {t('foodItemsUnavailable', 'Some items are no longer available. Remove them to continue.')}
                </p>
              ) : null}
            </div>
            <aside className="h-fit space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-20">
              <FulfilmentToggle value={effectiveFulfilment} onChange={setFulfilment} pickupAvailable={pickupAvailable} />
              <form onSubmit={applyCoupon} className="space-y-1">
                <label htmlFor="food-coupon" className="text-sm font-semibold text-slate-900">
                  {t('foodPromoCode', 'Promo code')}
                </label>
                <div className="flex gap-2">
                  <input
                    id="food-coupon"
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                    disabled={!user}
                    placeholder={user ? 'FOOD10' : t('foodSignInForCoupons', 'Sign in to use a code')}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase disabled:bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={!user || !couponInput.trim()}
                    className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {t('foodApply', 'Apply')}
                  </button>
                </div>
                {couponCode && quote?.coupon_error ? (
                  <p className="text-xs text-red-600">{quote.coupon_error}</p>
                ) : couponCode && quote?.coupon_code ? (
                  <p className="text-xs text-emerald-700">{t('foodCouponApplied', 'Code {code} applied', { code: quote.coupon_code })}</p>
                ) : null}
              </form>
              {error ? (
                <FoodError message={t('foodQuoteFailed', 'We could not price your cart.')} onRetry={refresh} />
              ) : (
                <CheckoutSummary
                  currency={currency}
                  subtotal={quote?.subtotal ?? 0}
                  deliveryFee={quote?.delivery_fee ?? 0}
                  discount={quote?.discount_amount ?? 0}
                  promotionDiscount={storeQuote?.promotion_discount}
                  total={quote?.total ?? 0}
                  pickup={effectiveFulfilment === 'pickup'}
                  loading={loading}
                />
              )}
              <button
                type="button"
                disabled={blocked}
                onClick={goToCheckout}
                className="w-full rounded-full bg-food py-3 font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-50"
              >
                {user ? t('foodProceedToCheckout', 'Proceed to checkout') : t('foodSignInToCheckout', 'Sign in to check out')}
              </button>
              <p className="text-center text-xs text-slate-500">
                {t('foodServerPricedHint', 'Prices and fees are confirmed by Kudya before you pay.')}
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
