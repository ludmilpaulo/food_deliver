'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import LocationFilterBar from '@/components/location/LocationFilterBar';
import { useLocationFilter } from '@/contexts/LocationContext';
import { useGetAccommodationListingsQuery } from '@/redux/slices/marketplaceApi';

export default function StayExperience() {
  const { t } = useTranslation();
  const { country, city } = useLocationFilter();
  const { data: listings = [], isLoading, isError, refetch } = useGetAccommodationListingsQuery({
    country: country?.id,
    city: city?.id ?? undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <LocationFilterBar className="mb-6" />
      <h1 className="text-3xl font-bold text-sky-900">{t('stay', 'Stay')}</h1>
      <p className="mt-2 text-slate-600">
        {t('staySubtitle', 'Book hotels, guest houses, and short-term accommodation.')}
      </p>

      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
          <p>{t('unableToLoadData', 'Unable to load data')}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-white">
            {t('retry', 'Retry')}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && listings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          {t('noResultsFound', 'No results found')}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/stay/${listing.id}`}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-sky-200"
          >
            <h2 className="text-lg font-semibold text-slate-900">{listing.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {[listing.city_name, listing.country_name].filter(Boolean).join(', ')}
            </p>
            <p className="mt-3 text-sm text-slate-600 line-clamp-2">{listing.description}</p>
            <p className="mt-4 text-xl font-bold text-sky-700">
              {listing.price_per_night} {listing.currency}/{t('night', 'night')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
