'use client';

import React, { useState } from 'react';
import { MdNotifications, MdChat, MdSearch, MdTune, MdExpandMore, MdExpandLess } from 'react-icons/md';

import type { DriverRegion } from '@/features/admin/drivers/types';
import { supportedLocales } from '@/configs/translations';
import { useTranslation } from '@/hooks/useTranslation';

const REGIONS: { value: DriverRegion; label: string }[] = [
  { value: 'all', label: 'All Regions' },
  { value: 'africa', label: 'Africa' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'north_america', label: 'North America' },
  { value: 'south_america', label: 'South America' },
  { value: 'oceania', label: 'Oceania' },
];

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  pt: 'Portuguese',
  fr: 'French',
  es: 'Spanish',
};

type AdminDriversHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  region: DriverRegion;
  onRegionChange: (value: DriverRegion) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
};

export default function AdminDriversHeader({
  search,
  onSearchChange,
  region,
  onRegionChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: AdminDriversHeaderProps) {
  const { t, languageCode, changeLanguage } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterControls = (
    <>
      <select
        value={region}
        onChange={(e) => onRegionChange(e.target.value as DriverRegion)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm sm:w-auto"
        aria-label="Region"
      >
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      <select
        value={languageCode}
        onChange={(e) => changeLanguage(e.target.value as typeof languageCode)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm sm:w-auto"
        aria-label="Language"
      >
        {supportedLocales.map((loc) => (
          <option key={loc} value={loc}>{LANG_LABELS[loc] ?? loc.toUpperCase()}</option>
        ))}
      </select>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-2 py-2 text-sm sm:w-auto"
        aria-label="Date from"
      />
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-2 py-2 text-sm sm:w-auto"
        aria-label="Date to"
      />
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="space-y-3 px-3 py-3 sm:px-4 md:px-6 md:py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 pr-2">
            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
              {t('driverOpsTitle', 'Global Driver Operations')}
            </h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              {t('driverOpsSubtitle', 'Real-time fleet monitoring across all Kudya services')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <MdNotifications className="text-xl" />
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Messages"
            >
              <MdChat className="text-xl" />
            </button>
            <div className="hidden rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white sm:block">
              {t('administrator', 'Admin')}
            </div>
          </div>
        </div>

        <div className="relative w-full">
          <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('driverOpsSearchPlaceholder', 'Search drivers, orders, plates, phones...')}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Desktop / tablet filters */}
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {filterControls}
        </div>

        {/* Mobile collapsible filters */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700"
          >
            <span className="flex items-center gap-2">
              <MdTune />
              {t('filtersAndRegion', 'Filters & region')}
            </span>
            {filtersOpen ? <MdExpandLess className="text-lg" /> : <MdExpandMore className="text-lg" />}
          </button>
          {filtersOpen && (
            <div className="mt-2 grid grid-cols-1 gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:grid-cols-2">
              {filterControls}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
