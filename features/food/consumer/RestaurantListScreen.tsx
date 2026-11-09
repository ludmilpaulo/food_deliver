'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { LocateFixed, Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { foodErrorMessage, useGetFoodCuisinesQuery, useGetFoodStoresQuery } from '../api/foodApi';
import FoodHeader from '../components/FoodHeader';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantFilters from '../components/RestaurantFilters';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../components/FoodStates';
import { useBrowserLocation } from '../hooks/useBrowserLocation';
import { activeFilterCount, filtersFromParams, filtersToParams } from '../lib/filters';
import type { FoodStoreFilters } from '../types';

const PAGE_SIZE = 12;

export default function RestaurantListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const [search, setSearch] = useState(filters.search ?? '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { coords, status, locate } = useBrowserLocation();

  const hasLocation = filters.lat !== undefined && filters.lng !== undefined;
  const stores = useGetFoodStoresQuery(filters);
  const cuisines = useGetFoodCuisinesQuery();

  const apply = (next: FoodStoreFilters) => {
    const query = new URLSearchParams(filtersToParams(next)).toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    setVisible(PAGE_SIZE);
    setSearch(filters.search ?? '');
  }, [filters]);

  useEffect(() => {
    if (coords && !hasLocation) {
      apply({ ...filters, lat: coords.latitude, lng: coords.longitude });
    }
    // only react to a newly obtained position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    apply({ ...filters, search: search.trim() || undefined });
  };

  const rows = stores.data ?? [];
  const count = activeFilterCount(filters);
  const filterPanel = (
    <RestaurantFilters filters={filters} onChange={apply} cuisines={cuisines.data ?? []} hasLocation={hasLocation} />
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <FoodHeader backHref="/food" title={t('foodRestaurants', 'Restaurants')} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <form onSubmit={onSearch} className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
            <Search className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('foodSearchPlaceholder', 'Search restaurants or cuisines')}
              aria-label={t('foodSearchPlaceholder', 'Search restaurants or cuisines')}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button type="submit" className="rounded-full bg-kudya px-4 py-1.5 text-sm font-semibold text-white">
              {t('foodSearch', 'Search')}
            </button>
          </form>
          <div className="flex gap-2">
            {!hasLocation ? (
              <button
                type="button"
                onClick={locate}
                disabled={status === 'locating'}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
              >
                <LocateFixed className="h-4 w-4" aria-hidden />
                {status === 'locating' ? t('foodLocating', 'Locating…') : t('foodUseMyLocation', 'Use my location')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              {t('foodFilters', 'Filters')}
              {count ? <span className="rounded-full bg-food px-1.5 text-xs font-bold text-white">{count}</span> : null}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 lg:block">{filterPanel}</aside>
          <section aria-live="polite">
            {stores.isFetching && !stores.isLoading ? (
              <p className="mb-3 text-xs text-slate-400">{t('foodUpdating', 'Updating results…')}</p>
            ) : null}
            {stores.isLoading ? (
              <FoodSkeletonGrid />
            ) : stores.isError ? (
              <FoodError
                message={foodErrorMessage(stores.error, t('foodLoadFailed', 'We could not load this right now.'))}
                onRetry={stores.refetch}
              />
            ) : rows.length === 0 ? (
              <FoodEmpty
                title={t('foodNoResults', 'No restaurants match your filters')}
                message={t('foodNoResultsHint', 'Try removing a filter or searching for something else.')}
                action={
                  count ? (
                    <button
                      type="button"
                      onClick={() => apply({ search: filters.search, lat: filters.lat, lng: filters.lng })}
                      className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white"
                    >
                      {t('foodResetFilters', 'Reset')}
                    </button>
                  ) : null
                }
              />
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-500">
                  {t('foodResultsCount', '{count} restaurants', { count: rows.length })}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {rows.slice(0, visible).map((store) => (
                    <RestaurantCard key={store.id} store={store} />
                  ))}
                </div>
                {visible < rows.length ? (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setVisible((value) => value + PAGE_SIZE)}
                      className="rounded-full border border-kudya px-6 py-2 text-sm font-semibold text-kudya hover:bg-violet-50"
                    >
                      {t('foodShowMore', 'Show more')}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </main>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('foodFilters', 'Filters')}
            className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label={t('foodClose', 'Close')}
              className="mb-3 ml-auto block rounded-full p-2 hover:bg-slate-100"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            {filterPanel}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full rounded-full bg-kudya py-3 font-semibold text-white"
            >
              {t('foodShowResults', 'Show {count} results', { count: rows.length })}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
