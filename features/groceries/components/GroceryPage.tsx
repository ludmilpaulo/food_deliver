'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  useGetGroceryFavouritesQuery,
  useGetGroceryHomeQuery,
  useGetGroceryProductsQuery,
} from '@/redux/slices/groceriesApi';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocationFilter } from '@/contexts/LocationContext';
import { selectUser } from '@/redux/slices/authSlice';
import { useAppSelector } from '@/redux/store';

import '../grocery.css';
import GroceryHeader from './GroceryHeader';
import GroceryHero from './GroceryHero';
import GroceryBenefits from './GroceryBenefits';
import CategorySection from './CategorySection';
import CategoryCard from './CategoryCard';
import PopularProducts from './PopularProducts';
import PromotionalBanners from './PromotionalBanners';
import DealsSection from './DealsSection';
import GroceryBottomNav from './GroceryBottomNav';
import GroceryProductCard from './GroceryProductCard';
import GroceryErrorBoundary from './GroceryErrorBoundary';
import { GroceryEmptyState, GroceryErrorState } from './GroceryStates';
import { HeroSkeleton, ProductGridSkeleton } from './GrocerySkeletons';

export default function GroceryPage({
  categorySlug,
}: {
  categorySlug?: string;
}) {
  const { t } = useTranslation();
  const params = useSearchParams();
  const section = params.get('section');
  const queryFromUrl = params.get('q') ?? '';
  const user = useAppSelector(selectUser);
  const { city, country } = useLocationFilter();
  const [search, setSearch] = useState(queryFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(queryFromUrl);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    setSearch(queryFromUrl);
    setDebouncedSearch(queryFromUrl.trim());
  }, [queryFromUrl]);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [search]);

  const homeQuery = useGetGroceryHomeQuery(undefined, {
    skip: !clientReady,
    refetchOnMountOrArgChange: true,
  });
  const listingQuery = useGetGroceryProductsQuery(
    {
      search: debouncedSearch || undefined,
      category_slug: categorySlug,
      featured: section === 'popular' && !debouncedSearch && !categorySlug ? true : undefined,
      on_sale: section === 'deals' && !debouncedSearch && !categorySlug ? true : undefined,
      page_size: 24,
    },
    { skip: !clientReady || (!debouncedSearch && !categorySlug && section !== 'popular' && section !== 'deals') },
  );
  const favouritesQuery = useGetGroceryFavouritesQuery(undefined, {
    skip: !clientReady || section !== 'favourites' || !user,
  });

  const locationLabel = city?.name
    ? `${city.name}${country?.name ? `, ${country.name}` : ''}`
    : country?.name || t('deliverToYou', 'Delivering to you');

  const home = homeQuery.data;
  const selectedCategory = useMemo(
    () => home?.categories.find((category) => category.slug === categorySlug) ?? null,
    [home?.categories, categorySlug],
  );

  const listingProducts = listingQuery.data?.results ?? [];
  const listingLoading =
    Boolean(categorySlug || debouncedSearch || section === 'popular' || section === 'deals') &&
    !listingQuery.data &&
    !listingQuery.isError;

  const showHome = !categorySlug && !debouncedSearch && !section;
  const showCategories = section === 'categories';
  const showFavourites = section === 'favourites';
  const showListing = Boolean(categorySlug || debouncedSearch || section === 'popular' || section === 'deals');
  const homeLoading = !homeQuery.data && !homeQuery.isError;

  if (homeQuery.isError) {
    return (
      <div className="grocery-shell">
        <GroceryHeader
          categories={[]}
          search={search}
          onSearchChange={setSearch}
          locationLabel={locationLabel}
        />
        <main className="mx-auto max-w-7xl px-4 py-8 pb-28 lg:px-6">
          <GroceryErrorState
            title={t('somethingWentWrong', 'Something went wrong.')}
            description={t(
              'couldNotLoadGroceries',
              "We couldn't load the groceries right now. Please try again.",
            )}
            retryLabel={t('tryAgain', 'Try Again')}
            onRetry={() => {
              void homeQuery.refetch();
            }}
          />
        </main>
        <GroceryBottomNav />
      </div>
    );
  }

  const errorFallback = (
    <GroceryErrorState
      title={t('somethingWentWrong', 'Something went wrong.')}
      description={t(
        'couldNotLoadGroceries',
        "We couldn't load the groceries right now. Please try again.",
      )}
      retryLabel={t('tryAgain', 'Try Again')}
      onRetry={() => {
        void homeQuery.refetch();
      }}
    />
  );

  return (
    <div className="grocery-shell" aria-busy={homeLoading}>
      <GroceryHeader
        categories={home?.nav_categories.length ? home.nav_categories : home?.categories ?? []}
        search={search}
        onSearchChange={setSearch}
        locationLabel={locationLabel}
      />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-5 pb-28 md:py-8 lg:px-6">
        {showHome ? (
          <GroceryErrorBoundary fallback={errorFallback}>
            {homeLoading ? <HeroSkeleton /> : <GroceryHero banners={home?.hero ?? []} />}
            <GroceryBenefits benefits={home?.benefits ?? []} />
            <CategorySection categories={home?.categories ?? []} loading={homeLoading} />
            <PopularProducts
              products={home?.popular_products ?? []}
              categories={home?.categories ?? []}
              loading={homeLoading}
            />
            {homeLoading ? null : <PromotionalBanners banners={home?.promotions ?? []} />}
            <DealsSection
              products={home?.deals ?? []}
              endsAt={home?.deals_end_at ?? null}
              title={home?.deals_title ?? ''}
              loading={homeLoading}
            />
          </GroceryErrorBoundary>
        ) : null}

        {showCategories ? (
          <section>
            <h1 className="mb-5 text-2xl font-bold text-[#111827]">{t('shopByCategory', 'Shop by Category')}</h1>
            {homeLoading ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-8">
                {(home?.categories ?? []).map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {showFavourites ? (
          <section>
            <h1 className="mb-5 text-2xl font-bold text-[#111827]">{t('favourites', 'Favourites')}</h1>
            {!user ? (
              <GroceryEmptyState
                title={t('loginToSeeFavourites', 'Sign in to see your favourites')}
                description={t('tryAnotherSearch', 'Try another search or category.')}
              />
            ) : favouritesQuery.isLoading ? (
              <ProductGridSkeleton />
            ) : (favouritesQuery.data ?? []).length === 0 ? (
              <GroceryEmptyState
                title={t('noFavourites', "You haven't added any favourites yet.")}
                description={t('tryAnotherSearch', 'Try another search or category.')}
              />
            ) : (
              <div className="grocery-product-grid">
                {(favouritesQuery.data ?? []).map((product) => (
                  <GroceryProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {showListing ? (
          <section>
            <h1 className="mb-5 text-2xl font-bold text-[#111827]">
              {selectedCategory?.name ||
                (debouncedSearch
                  ? t('searchResults', 'Search results')
                  : section === 'deals'
                    ? t('dealsOfTheWeek', 'Deals of the Week')
                    : categorySlug
                      ? categorySlug.replace(/-/g, ' ')
                      : t('popularProducts', 'Popular Products'))}
            </h1>
            {listingLoading ? <ProductGridSkeleton /> : null}
            {!listingLoading && listingProducts.length === 0 ? (
              <GroceryEmptyState
                title={
                  section === 'deals'
                    ? t('noDeals', 'No deals available right now.')
                    : t('noProducts', 'No products found')
                }
                description={t('tryAnotherSearch', 'Try another search or category.')}
              />
            ) : null}
            {!listingLoading && listingProducts.length > 0 ? (
              <div className="grocery-product-grid">
                {listingProducts.map((product) => (
                  <GroceryProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
      <GroceryBottomNav />
    </div>
  );
}
