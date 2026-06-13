'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Globe, ChevronDown, Stethoscope, Shield, X } from 'lucide-react';
import {
  useGetCitiesQuery,
  useGetCountriesQuery,
  useGetDoctorSpecialtiesQuery,
  useGetHealthcareDoctorsQuery,
} from '@/redux/slices/healthcareApi';
import type { Country, DoctorConsultationType } from '@/types/healthcare';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useHealthcareTranslation } from '@/hooks/useHealthcareTranslation';
import { useLocationFilter } from '@/contexts/LocationContext';
import { getFavoriteDoctorIds, toggleDoctorFavorite } from '@/lib/doctorFavorites';
import DoctorCard from './DoctorCard';
import DoctorSkeletonList from './DoctorSkeletonList';
import DoctorFiltersSidebar, { type SidebarFilterState } from './DoctorFiltersSidebar';

const DEFAULT_SIDEBAR: SidebarFilterState = {
  specialtySlug: undefined,
  consultationType: undefined,
  minRating: 0,
  priceMin: 0,
  priceMax: 0,
  verifiedOnly: false,
  availableToday: false,
  language: '',
  yearsExperienceMin: 0,
};

export default function FindDoctorsPage() {
  const { ht } = useHealthcareTranslation();
  const { country: locationCountry } = useLocationFilter();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryManual, setCountryManual] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>();
  const [sidebar, setSidebar] = useState<SidebarFilterState>(DEFAULT_SIDEBAR);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const { data: countries = [], isLoading: countriesLoading } = useGetCountriesQuery();
  const { data: specialties = [] } = useGetDoctorSpecialtiesQuery();
  const { data: cities = [] } = useGetCitiesQuery(
    { countryId: selectedCountry?.id ?? 0 },
    { skip: !selectedCountry?.id },
  );

  useEffect(() => {
    if (countryManual || !countries.length || selectedCountry) return;
    const preferred =
      countries.find((item) => item.code === locationCountry?.code) ??
      countries.find((item) => item.code === 'AO') ??
      countries[0];
    setSelectedCountry(preferred);
  }, [countries, countryManual, locationCountry?.code, selectedCountry]);

  useEffect(() => {
    setFavoriteIds(getFavoriteDoctorIds());
  }, []);

  const doctorFilters = useMemo(
    () => ({
      search: debouncedSearch,
      country: selectedCountry?.code,
      city: selectedCityId ? String(selectedCityId) : undefined,
      specialty_slug: sidebar.specialtySlug,
      consultation_type: sidebar.consultationType,
      min_rating: sidebar.minRating || undefined,
      price_min: sidebar.priceMin || undefined,
      price_max: sidebar.priceMax || undefined,
      verified: sidebar.verifiedOnly || undefined,
      available_today: sidebar.availableToday || undefined,
      language: sidebar.language || undefined,
      years_experience_min: sidebar.yearsExperienceMin || undefined,
    }),
    [debouncedSearch, selectedCountry?.code, selectedCityId, sidebar],
  );

  const {
    data: doctors = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetHealthcareDoctorsQuery(doctorFilters);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q),
    );
  }, [countries, countryQuery]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedCityId(undefined);
    setSidebar(DEFAULT_SIDEBAR);
  }, []);

  const onToggleFavorite = useCallback((doctorId: number) => {
    toggleDoctorFavorite(doctorId);
    setFavoriteIds(getFavoriteDoctorIds());
  }, []);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(sidebar.specialtySlug) ||
    Boolean(sidebar.consultationType) ||
    Boolean(selectedCityId) ||
    sidebar.minRating > 0 ||
    sidebar.priceMin > 0 ||
    sidebar.priceMax > 0 ||
    sidebar.verifiedOnly ||
    sidebar.availableToday ||
    Boolean(sidebar.language) ||
    sidebar.yearsExperienceMin > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden rounded-b-[40px] bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-4 pb-8 pt-6 shadow-lg sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 0%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{ht('findDoctor')}</h1>
              <p className="mt-2 max-w-2xl text-sky-100">{ht('subtitle')}</p>
            </div>
            <div className="hidden rounded-full bg-white/15 p-3 text-white sm:block">
              <Stethoscope className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="flex items-center rounded-2xl bg-white px-4 py-3 shadow-lg">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={ht('searchPlaceholder')}
                className="ml-3 flex-1 bg-transparent text-slate-800 outline-none"
              />
              {isFetching ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
              ) : null}
              {search ? (
                <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setCountryModalOpen(true)}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-left shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-sky-600" />
                <span className="font-semibold text-slate-800">
                  {countriesLoading ? ht('loading') : selectedCountry?.name ?? ht('selectCountry')}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          <div className="mt-3 lg:hidden">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sky-100">
              {ht('city')}
            </label>
            <select
              value={selectedCityId ?? ''}
              onChange={(e) => setSelectedCityId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-xl border-0 px-3 py-2.5 text-sm text-slate-800 shadow"
            >
              <option value="">{ht('allCities')}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {specialties.slice(0, 8).map((item) => {
              const selected = sidebar.specialtySlug === item.slug;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSidebar((s) => ({
                      ...s,
                      specialtySlug: selected ? undefined : item.slug,
                    }))
                  }
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selected ? 'bg-white text-sky-700' : 'bg-white/20 text-white'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2 lg:hidden">
            {(['online', 'physical'] as const).map((type) => {
              const selected = sidebar.consultationType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setSidebar((s) => ({
                      ...s,
                      consultationType: selected ? undefined : (type as DoctorConsultationType),
                    }))
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    selected ? 'bg-white text-sky-700' : 'bg-white/20 text-white'
                  }`}
                >
                  {type === 'online' ? ht('online') : ht('inPerson')}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            {isLoading || isFetching
              ? ht('searching')
              : `${doctors.length} ${doctors.length === 1 ? ht('doctorFound') : ht('doctorsFound')}`}
          </p>
          {hasActiveFilters ? (
            <button type="button" onClick={clearFilters} className="text-sm font-semibold text-sky-600">
              {ht('clearFilters')}
            </button>
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr_260px]">
          <div className="hidden lg:block">
            <DoctorFiltersSidebar
              specialties={specialties}
              filters={sidebar}
              onChange={(patch) => setSidebar((s) => ({ ...s, ...patch }))}
              onClear={clearFilters}
            />
            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                {ht('city')}
              </label>
              <select
                value={selectedCityId ?? ''}
                onChange={(e) => setSelectedCityId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">{ht('allCities')}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            {isError ? (
              <div className="rounded-2xl border border-rose-100 bg-white p-10 text-center">
                <p className="text-lg font-bold text-slate-800">{ht('doctorsLoadFailed')}</p>
                <p className="mt-2 text-sm text-slate-500">{ht('doctorsLoadFailedHint')}</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-5 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  {ht('retry')}
                </button>
              </div>
            ) : isLoading ? (
              <DoctorSkeletonList />
            ) : doctors.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <p className="text-lg font-bold text-slate-800">{ht('noDoctorsFound')}</p>
                <p className="mt-2 text-sm text-slate-500">{ht('noDoctorsHint')}</p>
                {selectedCountry?.code !== 'AO' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const angola = countries.find((item) => item.code === 'AO');
                      if (angola) {
                        setCountryManual(true);
                        setSelectedCountry(angola);
                        setSelectedCityId(undefined);
                      }
                    }}
                    className="mt-4 text-sm font-semibold text-sky-600"
                  >
                    {ht('viewAllDoctors', 'View doctors in Angola')}
                  </button>
                ) : null}
                {hasActiveFilters ? (
                  <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-sky-600">
                    {ht('clearFilters')}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isFavorite={favoriteIds.includes(doctor.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{ht('trustTitle')}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{ht('trustSubtitle')}</p>
            </div>
          </aside>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMobileFiltersOpen(true)}
        className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg lg:hidden"
      >
        {ht('mobileFilters')}
      </button>

      {countryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{ht('selectCountry')}</h3>
                <button type="button" onClick={() => setCountryModalOpen(false)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <input
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                placeholder={ht('searchCountry')}
                className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => {
                    setCountryManual(true);
                    setSelectedCountry(country);
                    setSelectedCityId(undefined);
                    setCountryModalOpen(false);
                    setCountryQuery('');
                  }}
                  className={`flex w-full items-center justify-between border-b border-slate-50 px-4 py-3.5 text-left hover:bg-sky-50 ${
                    selectedCountry?.id === country.id ? 'bg-sky-50' : ''
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-900">{country.name}</p>
                    <p className="text-xs text-slate-500">
                      {country.code} · {country.currency}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{ht('filters')}</h3>
              <button type="button" onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <DoctorFiltersSidebar
              specialties={specialties}
              filters={sidebar}
              onChange={(patch) => setSidebar((s) => ({ ...s, ...patch }))}
              onClear={clearFilters}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white"
            >
              {ht('applyFilters')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
