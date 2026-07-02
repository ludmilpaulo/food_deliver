'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useGetCitiesQuery, useGetCountriesQuery } from '@/redux/slices/marketplaceApi';
import type { AdminDriverFilters } from '@/features/admin/api/adminOrdersApi';

const VEHICLE_TYPES = ['motorcycle', 'car', 'van', 'truck', 'bicycle', 'on_foot'] as const;

const VERIFICATION_STATUSES = [
  'draft',
  'pending_verification',
  'approved',
  'rejected',
  'suspended',
  'expired_documents',
] as const;

type Props = {
  filters: AdminDriverFilters;
  onChange: (next: AdminDriverFilters) => void;
};

export default function DriverAdminFilters({ filters, onChange }: Props) {
  const { t } = useTranslation();
  const { data: countries = [], isLoading: countriesLoading } = useGetCountriesQuery();
  const countryId = filters.country ?? 0;
  const { data: cities = [], isLoading: citiesLoading } = useGetCitiesQuery(countryId, {
    skip: !countryId,
  });

  const set = (patch: Partial<AdminDriverFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-slate-800">{t('filters', 'Filters')}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          {t('country', 'Country')}
          <select
            value={filters.country ?? ''}
            disabled={countriesLoading}
            onChange={(e) => {
              const value = e.target.value;
              set({
                country: value ? Number(value) : undefined,
                city: undefined,
              });
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">{t('allCountries', 'All countries')}</option>
            {countries.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          {t('city', 'City')}
          <select
            value={filters.city ?? ''}
            disabled={!countryId || citiesLoading}
            onChange={(e) => {
              const value = e.target.value;
              set({ city: value ? Number(value) : undefined });
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">{t('allCities', 'All cities')}</option>
            {cities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          {t('status', 'Status')}
          <select
            value={
              filters.isOnline === true
                ? 'online'
                : filters.isOnline === false
                  ? 'offline'
                  : ''
            }
            onChange={(e) => {
              const value = e.target.value;
              set({
                isOnline: value === 'online' ? true : value === 'offline' ? false : undefined,
              });
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">{t('allStatuses', 'All statuses')}</option>
            <option value="online">{t('online', 'Online')}</option>
            <option value="offline">{t('offline', 'Offline')}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          {t('verification', 'Verification')}
          <select
            value={filters.verificationStatus ?? ''}
            onChange={(e) =>
              set({ verificationStatus: e.target.value || undefined })
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">{t('allVerification', 'All verification')}</option>
            {VERIFICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          {t('vehicleType', 'Vehicle type')}
          <select
            value={filters.vehicleType ?? ''}
            onChange={(e) => set({ vehicleType: e.target.value || undefined })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">{t('allVehicleTypes', 'All vehicle types')}</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:col-span-2 lg:col-span-1 xl:col-span-2">
          {t('search', 'Search')}
          <input
            type="search"
            value={filters.q ?? ''}
            placeholder={t('searchDriversPlaceholder', 'Name, phone, plate…')}
            onChange={(e) => set({ q: e.target.value || undefined })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={Boolean(filters.hasOrders)}
            onChange={(e) => set({ hasOrders: e.target.checked || undefined })}
            className="rounded border-slate-300"
          />
          {t('driversWithOrdersOnly', 'Drivers with completed orders only')}
        </label>
        <button
          type="button"
          onClick={() => onChange({})}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          {t('clearFilters', 'Clear filters')}
        </button>
      </div>
    </div>
  );
}
