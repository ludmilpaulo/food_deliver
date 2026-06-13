'use client';

import type { DoctorConsultationType, DoctorSpecialty } from '@/types/healthcare';
import { useHealthcareTranslation } from '@/hooks/useHealthcareTranslation';

export type SidebarFilterState = {
  specialtySlug?: string;
  consultationType?: DoctorConsultationType;
  minRating: number;
  priceMin: number;
  priceMax: number;
  verifiedOnly: boolean;
  availableToday: boolean;
  language: string;
  yearsExperienceMin: number;
};

type Props = {
  specialties: DoctorSpecialty[];
  filters: SidebarFilterState;
  onChange: (patch: Partial<SidebarFilterState>) => void;
  onClear: () => void;
  className?: string;
};

export default function DoctorFiltersSidebar({
  specialties,
  filters,
  onChange,
  onClear,
  className = '',
}: Props) {
  const { ht } = useHealthcareTranslation();

  return (
    <aside className={`space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">{ht('filters')}</h2>
        <button type="button" onClick={onClear} className="text-xs font-semibold text-sky-600 hover:text-sky-800">
          {ht('clearFilters')}
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {ht('browseBySpecialty')}
        </p>
        <div className="max-h-48 space-y-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => onChange({ specialtySlug: undefined })}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
              !filters.specialtySlug ? 'bg-sky-50 font-semibold text-sky-800' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {ht('allSpecialties')}
          </button>
          {specialties.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onChange({
                  specialtySlug: filters.specialtySlug === item.slug ? undefined : item.slug,
                })
              }
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                filters.specialtySlug === item.slug
                  ? 'bg-sky-50 font-semibold text-sky-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {ht('consultationType')}
        </p>
        <div className="flex flex-wrap gap-2">
          {(['online', 'physical'] as const).map((type) => {
            const selected = filters.consultationType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() =>
                  onChange({
                    consultationType: selected ? undefined : type,
                  })
                }
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  selected
                    ? 'bg-sky-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:border-sky-200'
                }`}
              >
                {type === 'online' ? ht('online') : ht('inPerson')}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {ht('minRating')}
        </label>
        <select
          value={filters.minRating}
          onChange={(e) => onChange({ minRating: Number(e.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value={0}>Any</option>
          <option value={3}>3+</option>
          <option value={4}>4+</option>
          <option value={4.5}>4.5+</option>
        </select>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {ht('priceRange')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={(e) => onChange({ priceMin: Number(e.target.value) || 0 })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={(e) => onChange({ priceMax: Number(e.target.value) || 0 })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={filters.verifiedOnly}
          onChange={(e) => onChange({ verifiedOnly: e.target.checked })}
          className="rounded border-slate-300 text-sky-600"
        />
        {ht('verifiedOnly')}
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={filters.availableToday}
          onChange={(e) => onChange({ availableToday: e.target.checked })}
          className="rounded border-slate-300 text-sky-600"
        />
        {ht('availableToday')}
      </label>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {ht('languages')}
        </label>
        <input
          type="text"
          value={filters.language}
          onChange={(e) => onChange({ language: e.target.value })}
          placeholder="e.g. Portuguese"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {ht('experience')}
        </label>
        <select
          value={filters.yearsExperienceMin}
          onChange={(e) => onChange({ yearsExperienceMin: Number(e.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value={0}>Any</option>
          <option value={3}>3+ years</option>
          <option value={5}>5+ years</option>
          <option value={10}>10+ years</option>
        </select>
      </div>
    </aside>
  );
}
