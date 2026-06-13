'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import LocationFilterBar from '@/components/location/LocationFilterBar';
import { useLocationFilter } from '@/contexts/LocationContext';
import {
  useGetRentalVehiclesQuery,
} from '@/redux/slices/marketplaceApi';

export default function CarRentalExperience() {
  const { t } = useTranslation();
  const { country, city } = useLocationFilter();
  const { data: vehicles = [], isLoading, isError, refetch } = useGetRentalVehiclesQuery({
    country: country?.code,
    city: city?.id,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <LocationFilterBar className="mb-6" />
      <h1 className="text-3xl font-bold text-teal-900">{t('carRental', 'Car Rental')}</h1>
      <p className="mt-2 text-slate-600">
        {t('carRentalSubtitle', 'Browse vehicles, book daily rentals, and manage deposits through Kudya.')}
      </p>

      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
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

      {!isLoading && !isError && vehicles.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          {t('noResultsFound', 'No results found')}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={`/car-rental/${vehicle.id}`}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-teal-200"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {vehicle.seats} {t('seats', 'seats')} · {vehicle.transmission} · {vehicle.fuel_type}
            </p>
            <p className="mt-4 text-xl font-bold text-teal-700">
              {vehicle.daily_price} {vehicle.currency}/{t('day', 'day')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
