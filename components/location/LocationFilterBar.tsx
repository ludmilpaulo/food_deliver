'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useLocationFilter } from '@/contexts/LocationContext';

export default function LocationFilterBar({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const { countries, cities, country, city, setCountryCode, setCityId, loading } = useLocationFilter();

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span>{t('country', 'Country')}</span>
        <select
          value={country?.code ?? ''}
          disabled={loading}
          onChange={(event) => setCountryCode(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900"
        >
          {countries.map((item) => (
            <option key={item.id} value={item.code}>
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
