'use client';

import { RotateCcw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Cuisine, FoodStoreFilters } from '../types';

type Props = {
  filters: FoodStoreFilters;
  onChange: (next: FoodStoreFilters) => void;
  cuisines: Cuisine[];
  hasLocation: boolean;
};

const RATINGS = [3.5, 4, 4.5];
const DELIVERY_TIMES = [30, 45, 60];
const RADII = [2, 5, 10, 25];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active ? 'border-kudya bg-kudya text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-kudya/50'
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function numberOrUndefined(raw: string): number | undefined {
  if (raw.trim() === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

export default function RestaurantFilters({ filters, onChange, cuisines, hasLocation }: Props) {
  const { t } = useTranslation();
  const set = (patch: Partial<FoodStoreFilters>) => onChange({ ...filters, ...patch });
  const toggle = (key: 'open_now' | 'has_promotion' | 'pickup') => set({ [key]: filters[key] ? undefined : true });
  const levels = filters.price_level ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{t('foodFilters', 'Filters')}</h2>
        <button
          type="button"
          onClick={() => onChange({ search: filters.search, lat: filters.lat, lng: filters.lng })}
          className="inline-flex items-center gap-1 text-sm font-medium text-kudya hover:underline"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {t('foodResetFilters', 'Reset')}
        </button>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('foodSortBy', 'Sort by')}</span>
        <select
          value={filters.ordering ?? ''}
          onChange={(event) =>
            set({ ordering: (event.target.value || undefined) as FoodStoreFilters['ordering'] })
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">{t('foodSortRecommended', 'Recommended')}</option>
          <option value="-rating">{t('foodSortRating', 'Top rated')}</option>
          <option value="delivery_time">{t('foodSortFastest', 'Fastest delivery')}</option>
          <option value="price_level">{t('foodSortPrice', 'Lowest price')}</option>
          {hasLocation ? <option value="distance">{t('foodSortDistance', 'Nearest')}</option> : null}
          <option value="-created">{t('foodSortNewest', 'Newest')}</option>
        </select>
      </label>

      <Section title={t('foodQuickFilters', 'Quick filters')}>
        <Chip active={Boolean(filters.open_now)} onClick={() => toggle('open_now')}>
          {t('foodOpenNow', 'Open now')}
        </Chip>
        <Chip active={Boolean(filters.has_promotion)} onClick={() => toggle('has_promotion')}>
          {t('foodPromotions', 'Promotions')}
        </Chip>
        <Chip active={Boolean(filters.pickup)} onClick={() => toggle('pickup')}>
          {t('foodPickupAvailable', 'Pickup available')}
        </Chip>
      </Section>

      {cuisines.length ? (
        <Section title={t('foodCuisine', 'Cuisine')}>
          {cuisines.map((cuisine) => (
            <Chip
              key={cuisine.id}
              active={filters.cuisine === cuisine.slug}
              onClick={() => set({ cuisine: filters.cuisine === cuisine.slug ? undefined : cuisine.slug })}
            >
              {cuisine.name}
            </Chip>
          ))}
        </Section>
      ) : null}

      <Section title={t('foodRating', 'Rating')}>
        {RATINGS.map((rating) => (
          <Chip
            key={rating}
            active={filters.min_rating === rating}
            onClick={() => set({ min_rating: filters.min_rating === rating ? undefined : rating })}
          >
            {t('foodRatingAtLeast', '{rating}+', { rating })}
          </Chip>
        ))}
      </Section>

      <Section title={t('foodDeliveryTime', 'Delivery time')}>
        {DELIVERY_TIMES.map((minutes) => (
          <Chip
            key={minutes}
            active={filters.max_delivery_min === minutes}
            onClick={() => set({ max_delivery_min: filters.max_delivery_min === minutes ? undefined : minutes })}
          >
            {t('foodUnderMinutes', 'Under {minutes} min', { minutes })}
          </Chip>
        ))}
      </Section>

      <Section title={t('foodPriceRange', 'Price range')}>
        {[1, 2, 3].map((level) => (
          <Chip
            key={level}
            active={levels.includes(level)}
            onClick={() =>
              set({
                price_level: levels.includes(level) ? levels.filter((value) => value !== level) : [...levels, level].sort(),
              })
            }
          >
            {'$'.repeat(level)}
          </Chip>
        ))}
      </Section>

      {hasLocation ? (
        <Section title={t('foodDistance', 'Distance')}>
          {RADII.map((radius) => (
            <Chip
              key={radius}
              active={filters.radius_km === radius}
              onClick={() => set({ radius_km: filters.radius_km === radius ? undefined : radius })}
            >
              {t('foodWithinKm', 'Within {km} km', { km: radius })}
            </Chip>
          ))}
        </Section>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('foodMaxDeliveryFee', 'Max delivery fee')}
          </span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={filters.max_delivery_fee ?? ''}
            onChange={(event) => set({ max_delivery_fee: numberOrUndefined(event.target.value) })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('foodMaxMinimumOrder', 'Max minimum order')}
          </span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={filters.max_min_order ?? ''}
            onChange={(event) => set({ max_min_order: numberOrUndefined(event.target.value) })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('foodCountry', 'Country')}</span>
          <input
            value={filters.country ?? ''}
            placeholder="ZA"
            onChange={(event) => set({ country: event.target.value || undefined })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('foodCity', 'City')}</span>
          <input
            value={filters.city ?? ''}
            onChange={(event) => set({ city: event.target.value || undefined })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>
    </div>
  );
}
