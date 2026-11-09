'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { resolveProductImageUrl } from '@/lib/resolveMediaUrl';
import { useGetFoodCuisinesQuery, useGetFoodProductsQuery, useGetFoodStoresQuery } from '../api/foodApi';
import FoodHeader from '../components/FoodHeader';
import FoodImage from '../components/FoodImage';
import RestaurantCard from '../components/RestaurantCard';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../components/FoodStates';
import { useBrowserLocation } from '../hooks/useBrowserLocation';
import { displayUnitPrice, formatMoney } from '../lib/money';
import type { FoodStore, FoodStoreFilters } from '../types';

const RAIL_SIZE = 6;
const NEARBY_RADIUS_KM = 15;

function Rail({
  title,
  href,
  query,
  emptyTitle,
}: {
  title: string;
  href: string;
  query: { data?: FoodStore[]; isLoading: boolean; isError: boolean; refetch: () => void };
  emptyTitle: string;
}) {
  const { t } = useTranslation();
  const stores = query.data?.slice(0, RAIL_SIZE) ?? [];
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-kudya hover:underline">
          {t('foodSeeAll', 'See all')}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      {query.isLoading ? (
        <FoodSkeletonGrid count={3} />
      ) : query.isError ? (
        <FoodError onRetry={query.refetch} />
      ) : stores.length === 0 ? (
        <FoodEmpty title={emptyTitle} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <RestaurantCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </section>
  );
}

function listHref(filters: FoodStoreFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  const query = params.toString();
  return query ? `/food/restaurants?${query}` : '/food/restaurants';
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <FoodHeader />
      {children}
    </div>
  );
}

export default function FoodHomeScreen() {
  const { t, languageCode } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { coords, status, locate, setCoords } = useBrowserLocation();
  const location = coords ? { lat: coords.latitude, lng: coords.longitude } : {};

  const cuisines = useGetFoodCuisinesQuery();
  const popular = useGetFoodStoresQuery({ ordering: '-rating', ...location });
  const nearby = useGetFoodStoresQuery(
    { ...location, radius_km: NEARBY_RADIUS_KM, ordering: 'distance' },
    { skip: !coords },
  );
  const promotions = useGetFoodStoresQuery({ has_promotion: true, ...location });
  const meals = useGetFoodProductsQuery({});

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    router.push(listHref({ search: search.trim() || undefined, ...location }));
  };

  const recommended = (meals.data ?? []).filter((product) => product.is_purchasable).slice(0, 8);

  return (
    <Shell>
      <section className="relative overflow-hidden bg-gradient-to-br from-kudya via-kudya-secondary to-fuchsia-600 text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-food/40 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:py-16">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {t('foodHeroBadge', 'Kudya Food')}
            </span>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              {t('foodHeroTitle', 'Your favourite restaurants, delivered.')}
            </h1>
            <p className="max-w-lg text-white/85">
              {t('foodHeroSubtitle', 'Order from local restaurants, track your courier live and pay securely.')}
            </p>
            <form onSubmit={onSearch} className="flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-lg">
              <Search className="ml-3 h-5 w-5 text-slate-400" aria-hidden />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('foodSearchPlaceholder', 'Search restaurants or cuisines')}
                aria-label={t('foodSearchPlaceholder', 'Search restaurants or cuisines')}
                className="min-w-0 flex-1 bg-transparent py-2 text-slate-900 outline-none"
              />
              <button type="submit" className="rounded-full bg-food px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                {t('foodSearch', 'Search')}
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" aria-hidden />
              {coords ? (
                <>
                  <span>{t('foodUsingYourLocation', 'Showing restaurants near you')}</span>
                  <button
                    type="button"
                    onClick={() => setCoords(null)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 hover:bg-white/25"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    {t('foodClearLocation', 'Clear')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={locate}
                  disabled={status === 'locating'}
                  className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-medium hover:bg-white/25 disabled:opacity-60"
                >
                  <LocateFixed className="h-4 w-4" aria-hidden />
                  {status === 'locating' ? t('foodLocating', 'Locating…') : t('foodUseMyLocation', 'Use my location')}
                </button>
              )}
              {status === 'denied' ? (
                <span className="text-white/80">{t('foodLocationDenied', 'Location access was blocked.')}</span>
              ) : null}
            </div>
          </div>
          <div className="hidden grid-cols-2 gap-3 md:grid">
            {recommended.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className={`overflow-hidden rounded-3xl bg-white/10 shadow-xl ring-1 ring-white/20 ${index % 2 ? 'translate-y-6' : ''}`}
              >
                <FoodImage
                  src={product.image_url?.length ? resolveProductImageUrl(product.image_url) : null}
                  alt={product.name}
                  className="h-36 w-full"
                />
                <p className="truncate px-3 py-2 text-sm font-semibold">{product.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">{t('foodCategories', 'Food categories')}</h2>
          {cuisines.isLoading ? (
            <div className="flex gap-3" role="status">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-20 w-24 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : cuisines.isError ? (
            <FoodError onRetry={cuisines.refetch} />
          ) : (cuisines.data ?? []).length === 0 ? (
            <FoodEmpty title={t('foodNoCategories', 'No categories yet')} />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {(cuisines.data ?? []).map((cuisine) => (
                <Link
                  key={cuisine.id}
                  href={listHref({ cuisine: cuisine.slug, ...location })}
                  className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100 hover:ring-food"
                >
                  <FoodImage src={cuisine.image} alt="" className="h-12 w-12 rounded-full" />
                  <span className="line-clamp-2 text-xs font-medium text-slate-700">{cuisine.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {coords ? (
          <Rail
            title={t('foodNearby', 'Nearby restaurants')}
            href={listHref({ ...location, radius_km: NEARBY_RADIUS_KM, ordering: 'distance' })}
            query={nearby}
            emptyTitle={t('foodNoNearby', 'No restaurants deliver near you yet')}
          />
        ) : null}
        <Rail
          title={t('foodPopular', 'Popular restaurants')}
          href={listHref({ ordering: '-rating', ...location })}
          query={popular}
          emptyTitle={t('foodNoRestaurants', 'No restaurants are available yet')}
        />
        <Rail
          title={t('foodPromotions', 'Promotions')}
          href={listHref({ has_promotion: true, ...location })}
          query={promotions}
          emptyTitle={t('foodNoPromotions', 'No promotions right now')}
        />

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">{t('foodRecommendedMeals', 'Recommended meals')}</h2>
          {meals.isLoading ? (
            <FoodSkeletonGrid count={4} variant="row" />
          ) : meals.isError ? (
            <FoodError onRetry={meals.refetch} />
          ) : recommended.length === 0 ? (
            <FoodEmpty title={t('foodNoMeals', 'No meals to recommend yet')} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((product) => (
                <Link
                  key={product.id}
                  href={`/food/restaurants/${product.store}`}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 hover:ring-food"
                >
                  <FoodImage
                    src={product.image_url?.length ? resolveProductImageUrl(product.image_url) : null}
                    alt={product.name}
                    className="h-32 w-full"
                  />
                  <div className="p-3">
                    <p className="truncate font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-food">
                      {formatMoney(displayUnitPrice(product), product.currency, languageCode)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </Shell>
  );
}
