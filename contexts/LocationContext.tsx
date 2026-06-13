'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { City, Country } from '@/types/marketplace';
import { useGetCitiesQuery, useGetCountriesQuery } from '@/redux/slices/marketplaceApi';

type LocationContextValue = {
  countries: Country[];
  cities: City[];
  country: Country | null;
  city: City | null;
  setCountryCode: (code: string) => void;
  setCityId: (id: number | null) => void;
  loading: boolean;
};

const LocationContext = createContext<LocationContextValue | null>(null);

const STORAGE_KEY = 'kudya_marketplace_location';

type StoredLocation = {
  countryCode: string;
  cityId: number | null;
};

function readStoredLocation(): StoredLocation {
  if (typeof window === 'undefined') {
    return { countryCode: 'AO', cityId: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { countryCode: 'AO', cityId: null };
    return JSON.parse(raw) as StoredLocation;
  } catch {
    return { countryCode: 'AO', cityId: null };
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<StoredLocation>(() => readStoredLocation());
  const { data: countries = [], isLoading: countriesLoading } = useGetCountriesQuery();

  const countryIdForQuery = useMemo(() => {
    const match = countries.find((item) => item.code === stored.countryCode);
    return match?.id ?? countries[0]?.id ?? 0;
  }, [countries, stored.countryCode]);

  const { data: cities = [], isLoading: citiesLoading } = useGetCitiesQuery(countryIdForQuery, {
    skip: countryIdForQuery === 0,
  });

  const country = useMemo(
    () => countries.find((item) => item.code === stored.countryCode) ?? countries[0] ?? null,
    [countries, stored.countryCode],
  );

  const city = useMemo(
    () => cities.find((item) => item.id === stored.cityId) ?? null,
    [cities, stored.cityId],
  );

  useEffect(() => {
    if (!country && countries[0]) {
      setStored((prev) => ({ ...prev, countryCode: countries[0].code }));
    }
  }, [country, countries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // ignore storage failures
    }
  }, [stored]);

  const setCountryCode = useCallback((code: string) => {
    setStored({ countryCode: code, cityId: null });
  }, []);

  const setCityId = useCallback((id: number | null) => {
    setStored((prev) => ({ ...prev, cityId: id }));
  }, []);

  const value = useMemo<LocationContextValue>(
    () => ({
      countries,
      cities,
      country,
      city,
      setCountryCode,
      setCityId,
      loading: countriesLoading || citiesLoading,
    }),
    [countries, cities, country, city, setCountryCode, setCityId, countriesLoading, citiesLoading],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationFilter(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationFilter must be used within LocationProvider');
  }
  return ctx;
}
