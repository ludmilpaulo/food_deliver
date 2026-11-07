'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useLocationFilter } from '@/contexts/LocationContext';

export default function LocationFilterBar({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const {
    countries,
    provinces,
    cities,
    country,
    province,
    city,
    setCountryCode,
    setProvinceId,
    setCityId,
    gpsStatus,
    discoveryMode,
    requestGps,
    loading,
  } = useLocationFilter();

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={requestGps}
        className={`rounded-xl px-3 py-2 text-sm font-semibold border ${
          discoveryMode === 'nearby'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-slate-700 border-slate-200'
        }`}
      >
        {gpsStatus === 'prompting'
          ? t('locating', 'Locating…')
          : t('nearMe', 'Near me')}
      </button>
      {(gpsStatus === 'denied' || gpsStatus === 'unavailable') && (
        <p className="text-xs text-amber-700">
          {t('locationDeniedHint', 'Location is unavailable. Choose a country, region, and city instead.')}
        </p>
      )}
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span>{t('country', 'Country')}</span>
        <select
          value={country?.code ?? ''}
          disabled={loading}
          onChange={(event) => setCountryCode(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900"
        >
          <option value="">{t('selectCountry', 'Select country')}</option>
          {countries.map((item) => (
            <option key={item.id} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span>{t('province', 'Province / State')}</span>
        <select
          value={province?.id ?? ''}
          disabled={loading || provinces.length === 0}
          onChange={(event) => {
            const next = event.target.value;
            setProvinceId(next ? Number(next) : null);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900"
        >
          <option value="">{t('allProvinces', 'All regions')}</option>
          {provinces.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span>{t('city', 'City')}</span>
        <select
          value={city?.id ?? ''}
          disabled={loading || cities.length === 0}
          onChange={(event) => {
            const next = event.target.value;
            setCityId(next ? Number(next) : null);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900"
        >
          <option value="">{t('allCities', 'All cities')}</option>
          {cities.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
