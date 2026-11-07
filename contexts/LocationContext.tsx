'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { City, Country, Province } from '@/types/marketplace';
import {
  useGetCitiesQuery,
  useGetCountriesQuery,
  useGetProvincesQuery,
} from '@/redux/slices/marketplaceApi';

export type GpsStatus = 'idle' | 'prompting' | 'granted' | 'denied' | 'unavailable';
export type DiscoveryMode = 'nearby' | 'manual';

type LocationContextValue = {
  countries: Country[];
  provinces: Province[];
  cities: City[];
  country: Country | null;
  province: Province | null;
  city: City | null;
  setCountryCode: (code: string) => void;
  setProvinceId: (id: number | null) => void;
  setCityId: (id: number | null) => void;
  coords: { latitude: number; longitude: number } | null;
  gpsStatus: GpsStatus;
  discoveryMode: DiscoveryMode;
  setDiscoveryMode: (mode: DiscoveryMode) => void;
  requestGps: () => void;
  loading: boolean;
};

const LocationContext = createContext<LocationContextValue | null>(null);

const STORAGE_KEY = 'kudya_marketplace_location';

type StoredLocation = {
  countryCode: string;
  provinceId: number | null;
  cityId: number | null;
  discoveryMode: DiscoveryMode;
};

function readStoredLocation(): StoredLocation {
  if (typeof window === 'undefined') {
    return { countryCode: '', provinceId: null, cityId: null, discoveryMode: 'manual' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { countryCode: '', provinceId: null, cityId: null, discoveryMode: 'manual' };
    const parsed = JSON.parse(raw) as Partial<StoredLocation>;
    return {
      countryCode: typeof parsed.countryCode === 'string' ? parsed.countryCode : '',
      provinceId: typeof parsed.provinceId === 'number' ? parsed.provinceId : null,
      cityId: typeof parsed.cityId === 'number' ? parsed.cityId : null,
      discoveryMode: parsed.discoveryMode === 'nearby' ? 'nearby' : 'manual',
    };
  } catch {
    return { countryCode: '', provinceId: null, cityId: null, discoveryMode: 'manual' };
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<StoredLocation>(() => readStoredLocation());
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const { data: countries = [], isLoading: countriesLoading } = useGetCountriesQuery();

  const countryIdForQuery = useMemo(() => {
    const match = countries.find((item) => item.code === stored.countryCode);
    return match?.id ?? 0;
  }, [countries, stored.countryCode]);

  const { data: provinces = [], isLoading: provincesLoading } = useGetProvincesQuery(countryIdForQuery, {
    skip: countryIdForQuery === 0,
  });

  const { data: cities = [], isLoading: citiesLoading } = useGetCitiesQuery(
    { countryId: countryIdForQuery, provinceId: stored.provinceId },
    { skip: countryIdForQuery === 0 },
  );

  const country = useMemo(
    () => countries.find((item) => item.code === stored.countryCode) ?? null,
    [countries, stored.countryCode],
  );

  const province = useMemo(
    () => provinces.find((item) => item.id === stored.provinceId) ?? null,
    [provinces, stored.provinceId],
  );

  const city = useMemo(
    () => cities.find((item) => item.id === stored.cityId) ?? null,
    [cities, stored.cityId],
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // ignore storage failures
    }
  }, [stored]);

  const setCountryCode = useCallback((code: string) => {
    setStored((prev) => ({
      ...prev,
      countryCode: code,
      provinceId: null,
      cityId: null,
      discoveryMode: 'manual',
    }));
  }, []);

  const setProvinceId = useCallback((id: number | null) => {
    setStored((prev) => ({ ...prev, provinceId: id, cityId: null, discoveryMode: 'manual' }));
  }, []);

  const setCityId = useCallback((id: number | null) => {
    setStored((prev) => ({ ...prev, cityId: id, discoveryMode: 'manual' }));
  }, []);

  const setDiscoveryMode = useCallback((mode: DiscoveryMode) => {
    setStored((prev) => ({ ...prev, discoveryMode: mode }));
  }, []);

  const requestGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unavailable');
      setDiscoveryMode('manual');
      return;
    }
    setGpsStatus('prompting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsStatus('granted');
        setDiscoveryMode('nearby');
      },
      () => {
        setCoords(null);
        setGpsStatus('denied');
        setDiscoveryMode('manual');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
    );
  }, [setDiscoveryMode]);

  const value = useMemo<LocationContextValue>(
    () => ({
      countries,
      provinces,
      cities,
      country,
      province,
      city,
      setCountryCode,
      setProvinceId,
      setCityId,
      coords,
      gpsStatus,
      discoveryMode: stored.discoveryMode,
      setDiscoveryMode,
      requestGps,
      loading: countriesLoading || provincesLoading || citiesLoading,
    }),
    [
      countries,
      provinces,
      cities,
      country,
      province,
      city,
      setCountryCode,
      setProvinceId,
      setCityId,
      coords,
      gpsStatus,
      stored.discoveryMode,
      setDiscoveryMode,
      requestGps,
      countriesLoading,
      provincesLoading,
      citiesLoading,
    ],
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
