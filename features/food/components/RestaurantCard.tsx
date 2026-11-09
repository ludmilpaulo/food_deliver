'use client';

import Link from 'next/link';
import { BadgeCheck, Bike, Clock, MapPin, ShoppingBag, Star } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { resolveMediaUrl } from '@/lib/resolveMediaUrl';
import { formatMoney } from '../lib/money';
import { restaurantHref } from '../lib/slug';
import type { FoodStore } from '../types';
import FoodImage from './FoodImage';

export default function RestaurantCard({ store }: { store: FoodStore }) {
  const { t, languageCode } = useTranslation();
  const cover = store.cover_image || store.logo;
  const fee = Number(store.delivery_fee);
  return (
    <Link
      href={restaurantHref(store)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-kudya"
    >
      <div className="relative h-40">
        <FoodImage src={cover ? resolveMediaUrl(cover) : null} alt={store.name} className="h-full w-full" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              store.is_open ? 'bg-emerald-500 text-white' : 'bg-slate-800/80 text-white'
            }`}
          >
            {store.is_open ? t('foodOpenNow', 'Open now') : t('foodClosed', 'Closed')}
          </span>
          {store.promo_text ? (
            <span className="rounded-full bg-food px-2.5 py-1 text-xs font-semibold text-white">{store.promo_text}</span>
          ) : null}
        </div>
        {store.logo ? (
          <div className="absolute -bottom-6 left-4 h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-white shadow">
            <FoodImage src={resolveMediaUrl(store.logo)} alt="" className="h-full w-full" />
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-1 text-base font-semibold text-slate-900 group-hover:text-kudya">
            {store.name}
            {store.is_verified ? (
              <BadgeCheck className="h-4 w-4 text-kudya" aria-label={t('foodVerified', 'Verified')} />
            ) : null}
          </h3>
          {store.rating !== null ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
              {store.rating.toFixed(1)}
              <span className="font-normal text-amber-600">({store.rating_count})</span>
            </span>
          ) : (
            <span className="shrink-0 text-xs text-slate-400">{t('foodNew', 'New')}</span>
          )}
        </div>
        <p className="text-sm text-slate-500">
          {[store.cuisine?.name, '$'.repeat(store.price_level || 1)].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {t('foodMinutesRange', '{min}-{max} min', { min: store.delivery_time_min, max: store.delivery_time_max })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bike className="h-3.5 w-3.5" aria-hidden />
            {fee > 0 ? formatMoney(fee, store.currency, languageCode) : t('foodFreeDelivery', 'Free delivery')}
          </span>
          {store.supports_pickup ? (
            <span className="inline-flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
              {t('foodPickup', 'Pickup')}
            </span>
          ) : null}
          {store.distance_km !== null ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {t('foodDistanceKm', '{km} km', { km: store.distance_km.toFixed(1) })}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
