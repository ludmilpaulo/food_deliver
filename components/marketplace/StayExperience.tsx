'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import LocationFilterBar from '@/components/location/LocationFilterBar';
import { useLocationFilter } from '@/contexts/LocationContext';
import { useGetStayPropertiesQuery } from '@/redux/slices/marketplaceApi';

export default function StayExperience() {
  const { t } = useTranslation();
  const { country, province, city, coords, discoveryMode } = useLocationFilter();
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [rating, setRating] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const locationReady =
    discoveryMode === 'nearby' ? Boolean(coords) : Boolean(country || province || city);

  const { data: listings = [], isLoading, isError, refetch } = useGetStayPropertiesQuery(
    {
      country: country?.id,
      province: province?.id ?? undefined,
      city: city?.id ?? undefined,
      search: search.trim() || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      property_type: propertyType || undefined,
      guests: guests ? Number(guests) : undefined,
      check_in: checkIn || undefined,
      check_out: checkOut || undefined,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    },
    { skip: !locationReady && !search.trim() },
  );

  const filteredByRating = rating
    ? listings.filter((listing) => {
        const value = Number(listing.rating ?? listing.average_rating);
        if (!Number.isFinite(value) || value <= 0) return true;
        return value >= Number(rating);
      })
    : listings;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-sky-900">{t('stay', 'Stay')}</h1>
      <p className="mt-2 text-slate-600">
        {t('staySubtitle', 'Book hotels, guest houses, and short-term accommodation.')}
      </p>

      <LocationFilterBar className="mt-6 mb-4" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('search', 'Search')}
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
        <input
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          placeholder={t('minPrice', 'Min price')}
          type="number"
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
        <input
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          placeholder={t('maxPrice', 'Max price')}
          type="number"
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
        <select
          value={propertyType}
          onChange={(event) => setPropertyType(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="">{t('accommodationType', 'Accommodation type')}</option>
          <option value="apartment">{t('apartment', 'Apartment')}</option>
          <option value="house">{t('house', 'House')}</option>
          <option value="room">{t('room', 'Room')}</option>
          <option value="guesthouse">{t('guesthouse', 'Guesthouse')}</option>
          <option value="hotel">{t('hotel', 'Hotel')}</option>
        </select>
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="">{t('rating', 'Rating')}</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
        </select>
        <input
          value={guests}
          onChange={(event) => setGuests(event.target.value)}
          placeholder={t('guests', 'Guests')}
          type="number"
          min={1}
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
        <input
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
          type="date"
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
        <input
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
          type="date"
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
      </div>

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

      {!isLoading && !isError && filteredByRating.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          {t('noResultsFound', 'No results found')}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredByRating.map((listing) => {
          const id = Number(listing.id);
          const title = String(listing.title ?? '');
          const price = String(listing.price ?? listing.price_per_night ?? '');
          const currency = String(listing.currency ?? '');
          const cityName =
            typeof listing.city === 'object' && listing.city && 'name' in listing.city
              ? String((listing.city as { name?: string }).name ?? '')
              : String(listing.city_name ?? listing.city ?? '');
          const distance =
            typeof listing.distance_km === 'number' ? listing.distance_km : null;
          return (
            <Link
              key={id}
              href={`/properties/${id}`}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-sky-200"
            >
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{cityName}</p>
              {distance != null ? (
                <p className="mt-1 text-xs text-slate-400">{distance} km</p>
              ) : null}
              <p className="mt-4 text-xl font-bold text-sky-700">
                {price} {currency}/{t('night', 'night')}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
