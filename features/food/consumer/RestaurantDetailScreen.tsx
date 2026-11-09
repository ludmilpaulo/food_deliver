'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BadgeCheck, Bike, Clock, MapPin, ShoppingBag, Star, Tag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { addItem, clearCart, selectCartItems } from '@/redux/slices/basketSlice';
import { resolveMediaUrl, resolveProductImageUrl } from '@/lib/resolveMediaUrl';
import {
  useGetFoodProductsQuery,
  useGetFoodStoreDealsQuery,
  useGetFoodStoreQuery,
  useGetFoodStoreReviewsQuery,
} from '../api/foodApi';
import FoodHeader from '../components/FoodHeader';
import FoodImage from '../components/FoodImage';
import ItemCustomiser, { type CustomisedItem } from '../components/ItemCustomiser';
import RestaurantMenu from '../components/RestaurantMenu';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../components/FoodStates';
import { foodCartItems } from '../lib/cartLines';
import { formatMoney, plainText } from '../lib/money';
import type { FoodProduct, FoodStore } from '../types';

type Tab = 'menu' | 'reviews' | 'info';

function InfoPanel({ store }: { store: FoodStore }) {
  const { t, languageCode } = useTranslation();
  const minimum = Number(store.minimum_order_amount);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h3 className="font-semibold text-slate-900">{t('foodOpeningHours', 'Opening hours')}</h3>
        {store.opening_hours.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t('foodHoursNotSet', 'Opening hours have not been published.')}</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {store.opening_hours.map((row, index) => (
              <li key={`${row.day}-${index}`} className="flex justify-between gap-3">
                <span>{row.day}</span>
                <span>{row.is_closed ? t('foodClosed', 'Closed') : `${row.from_hour} – ${row.to_hour}`}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-2 rounded-2xl bg-white p-5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
        <h3 className="font-semibold text-slate-900">{t('foodPolicies', 'Restaurant policies')}</h3>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          {store.address}
        </p>
        <p>
          {t('foodMinimumOrder', 'Minimum order')}:{' '}
          {minimum > 0 ? formatMoney(minimum, store.currency, languageCode) : t('foodNoMinimum', 'None')}
        </p>
        <p>{t('foodDeliveryRadius', 'Delivers within {km} km', { km: Number(store.delivery_radius_km) })}</p>
        <p>{t('foodPrepTime', 'Preparation time: about {minutes} min', { minutes: store.preparation_time_minutes })}</p>
        <p>
          {store.supports_pickup
            ? t('foodPickupOffered', 'Delivery and pickup available')
            : t('foodDeliveryOnly', 'Delivery only')}
        </p>
        <p className="text-xs text-slate-500">
          {t('foodRefundPolicy', 'Missing or incorrect items can be reported from your order after delivery.')}
        </p>
      </section>
    </div>
  );
}

function Reviews({ storeId }: { storeId: number }) {
  const { t, languageCode } = useTranslation();
  const reviews = useGetFoodStoreReviewsQuery(storeId);
  if (reviews.isLoading) return <FoodSkeletonGrid count={3} variant="row" />;
  if (reviews.isError) return <FoodError onRetry={reviews.refetch} />;
  if (!reviews.data?.length) return <FoodEmpty title={t('foodNoReviews', 'No reviews yet')} />;
  return (
    <ul className="space-y-3">
      {reviews.data.map((review) => (
        <li key={review.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900">{review.customer_name}</span>
            <span className="inline-flex items-center gap-1 text-sm text-amber-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              {review.rating}
            </span>
          </div>
          {review.comment ? <p className="mt-1 text-sm text-slate-700">{review.comment}</p> : null}
          {review.tags.length ? <p className="mt-1 text-xs text-slate-500">{review.tags.join(' · ')}</p> : null}
          <p className="mt-1 text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString(languageCode)}</p>
        </li>
      ))}
    </ul>
  );
}

export default function RestaurantDetailScreen({ storeId }: { storeId: number }) {
  const { t, languageCode } = useTranslation();
  const dispatch = useAppDispatch();
  const cart = foodCartItems(useAppSelector(selectCartItems));
  const [tab, setTab] = useState<Tab>('menu');
  const [selected, setSelected] = useState<FoodProduct | null>(null);
  const [pending, setPending] = useState<{ product: FoodProduct; item: CustomisedItem } | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const store = useGetFoodStoreQuery(storeId);
  const products = useGetFoodProductsQuery({ store: storeId });
  const deals = useGetFoodStoreDealsQuery(storeId);

  const otherStoreInCart = cart.find((item) => item.store !== storeId);
  const mine = cart.filter((item) => item.store === storeId);
  const mineCount = mine.reduce((sum, item) => sum + item.quantity, 0);
  const mineTotal = mine.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (store.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <FoodHeader backHref="/food/restaurants" />
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />
          <div className="mt-6">
            <FoodSkeletonGrid count={4} variant="row" />
          </div>
        </div>
      </div>
    );
  }
  if (store.isError || !store.data) {
    const notFound = (store.error as { status?: number } | undefined)?.status === 404;
    return (
      <div className="min-h-screen bg-slate-50">
        <FoodHeader backHref="/food/restaurants" />
        <div className="mx-auto max-w-3xl px-4 py-12">
          {notFound ? (
            <FoodEmpty
              title={t('foodRestaurantNotFound', 'This restaurant is not available')}
              action={
                <Link href="/food/restaurants" className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white">
                  {t('foodBrowseRestaurants', 'Browse restaurants')}
                </Link>
              }
            />
          ) : (
            <FoodError onRetry={store.refetch} />
          )}
        </div>
      </div>
    );
  }

  const data = store.data;
  const canOrder = data.is_open && data.accepting_orders;

  const commit = (product: FoodProduct, item: CustomisedItem) => {
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: item.unit_price,
        image: product.image_url?.length ? resolveProductImageUrl(product.image_url) : undefined,
        size: '',
        color: '',
        store: data.id,
        store_name: data.name,
        vertical: 'food',
        addon_ids: item.addon_ids,
        addon_names: item.addon_names,
        special_instructions: item.special_instructions,
        quantity: item.quantity,
      }),
    );
    setAdded(product.name);
    window.setTimeout(() => setAdded(null), 2500);
  };

  const onAdd = (item: CustomisedItem) => {
    if (!selected) return;
    const product = selected;
    setSelected(null);
    if (otherStoreInCart) {
      setPending({ product, item });
      return;
    }
    commit(product, item);
  };

  const cover = data.cover_image || data.logo;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <FoodHeader backHref="/food/restaurants" title={data.name} />
      <div className="relative h-56 md:h-72">
        <FoodImage src={cover ? resolveMediaUrl(cover) : null} alt={data.name} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" aria-hidden />
      </div>
      <main className="mx-auto -mt-20 max-w-6xl space-y-6 px-4">
        <section className="relative rounded-3xl bg-white p-5 shadow-lg ring-1 ring-slate-100 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow">
              <FoodImage src={data.logo ? resolveMediaUrl(data.logo) : null} alt="" className="h-full w-full" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 md:text-3xl">
                {data.name}
                {data.is_verified ? (
                  <BadgeCheck className="h-6 w-6 text-kudya" aria-label={t('foodVerified', 'Verified')} />
                ) : null}
              </h1>
              {plainText(data.description) ? <p className="text-sm text-slate-600">{plainText(data.description)}</p> : null}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  {data.rating !== null
                    ? t('foodRatingCount', '{rating} ({count} ratings)', { rating: data.rating.toFixed(1), count: data.rating_count })
                    : t('foodNew', 'New')}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden />
                  {t('foodMinutesRange', '{min}-{max} min', { min: data.delivery_time_min, max: data.delivery_time_max })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Bike className="h-4 w-4" aria-hidden />
                  {Number(data.delivery_fee) > 0
                    ? formatMoney(data.delivery_fee, data.currency, languageCode)
                    : t('foodFreeDelivery', 'Free delivery')}
                </span>
                {data.supports_pickup ? (
                  <span className="inline-flex items-center gap-1">
                    <ShoppingBag className="h-4 w-4" aria-hidden />
                    {t('foodPickup', 'Pickup')}
                  </span>
                ) : null}
                {data.cuisine ? <span>{data.cuisine.name}</span> : null}
              </div>
            </div>
            <span
              className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${
                canOrder ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {canOrder ? t('foodOpenNow', 'Open now') : t('foodClosed', 'Closed')}
            </span>
          </div>
          {!canOrder ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">
              {t('foodClosedBrowse', 'This restaurant is not taking orders right now. You can still browse the menu.')}
            </p>
          ) : null}
          {(deals.data ?? []).length || data.promo_text ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.promo_text ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-food-soft px-3 py-1 text-sm font-medium text-orange-800">
                  <Tag className="h-4 w-4" aria-hidden />
                  {data.promo_text}
                </span>
              ) : null}
              {(deals.data ?? []).map((deal) => (
                <span key={deal.id} className="inline-flex items-center gap-1 rounded-full bg-food-soft px-3 py-1 text-sm font-medium text-orange-800">
                  <Tag className="h-4 w-4" aria-hidden />
                  {deal.title}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <div className="flex gap-2 border-b border-slate-200" role="tablist">
          {(['menu', 'reviews', 'info'] as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
                tab === key ? 'border-food text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {key === 'menu' ? t('foodMenu', 'Menu') : key === 'reviews' ? t('foodReviews', 'Reviews') : t('foodInfo', 'Info')}
            </button>
          ))}
        </div>

        {tab === 'menu' ? (
          products.isLoading ? (
            <FoodSkeletonGrid count={4} variant="row" />
          ) : products.isError ? (
            <FoodError onRetry={products.refetch} />
          ) : (
            <RestaurantMenu
              products={products.data ?? []}
              currency={data.currency}
              ordering={canOrder}
              onSelect={setSelected}
            />
          )
        ) : null}
        {tab === 'reviews' ? <Reviews storeId={data.id} /> : null}
        {tab === 'info' ? <InfoPanel store={data} /> : null}
      </main>

      {added ? (
        <div className="fixed left-1/2 top-20 z-30 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg" role="status">
          {t('foodAddedToCart', '{name} added to your cart', { name: added })}
        </div>
      ) : null}

      {mineCount > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white/95 p-3 backdrop-blur">
          <Link
            href="/food/cart"
            className="mx-auto flex max-w-3xl items-center justify-between rounded-full bg-kudya px-5 py-3 font-semibold text-white shadow-lg hover:bg-kudya-secondary"
          >
            <span className="rounded-full bg-food px-2 py-0.5 text-sm">{mineCount}</span>
            <span>{t('foodViewCart', 'View cart')}</span>
            <span>{formatMoney(mineTotal, data.currency, languageCode)}</span>
          </Link>
        </div>
      ) : null}

      {selected ? (
        <ItemCustomiser product={selected} currency={data.currency} onClose={() => setSelected(null)} onAdd={onAdd} />
      ) : null}

      {pending ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">{t('foodStartNewCart', 'Start a new cart?')}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {t('foodStartNewCartHint', 'Your cart has items from {store}. Food orders are placed with one restaurant at a time.', {
                store: otherStoreInCart?.store_name || t('foodAnotherRestaurant', 'another restaurant'),
              })}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="flex-1 rounded-full border border-slate-200 py-2 font-semibold text-slate-700"
              >
                {t('foodKeepCart', 'Keep cart')}
              </button>
              <button
                type="button"
                onClick={() => {
                  for (const storeIdInCart of new Set(cart.map((item) => item.store))) dispatch(clearCart(storeIdInCart));
                  commit(pending.product, pending.item);
                  setPending(null);
                }}
                className="flex-1 rounded-full bg-kudya py-2 font-semibold text-white"
              >
                {t('foodReplaceCart', 'Start new cart')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
