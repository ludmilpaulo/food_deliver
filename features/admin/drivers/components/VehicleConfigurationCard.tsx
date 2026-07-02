'use client';

import React, { useEffect, useMemo, useState } from 'react';

import type { DriverVehicleFormState } from '@/features/admin/drivers/vehicleTypes';
import { readAuthToken } from '@/lib/authToken';
import { selectAuthHydrated } from '@/redux/slices/authSlice';
import { useAppSelector } from '@/redux/store';
import {
  useApproveDriverVehicleMutation,
  useGetCountryVehicleRulesQuery,
  useGetDriverVehicleQuery,
  useGetTaxiCategoriesQuery,
  useGetVehicleServiceTypesQuery,
  useGetVehicleTypesQuery,
  useRejectDriverVehicleMutation,
  useUpdateDriverVehicleMutation,
} from '@/redux/slices/adminVehicleApi';

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-800',
  pending_review: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-800',
};

type VehicleConfigurationCardProps = {
  driverId: number;
  driverName: string;
  countryId?: number;
  canEdit?: boolean;
  onSaved?: () => void;
};

function emptyForm(): DriverVehicleFormState {
  return {
    vehicle_type: 'car',
    make: '',
    model: '',
    year: '',
    color: '',
    plate_number: '',
    passenger_capacity: 1,
    cargo_capacity_kg: '',
    service_usages: [],
    taxi_category: '',
    is_active: false,
  };
}

export default function VehicleConfigurationCard({
  driverId,
  driverName,
  countryId,
  canEdit = true,
  onSaved,
}: VehicleConfigurationCardProps) {
  const authHydrated = useAppSelector(selectAuthHydrated);
  const authReady = authHydrated && Boolean(readAuthToken());
  const skipQueries = !authReady;

  const { data: vehicle, isLoading, error } = useGetDriverVehicleQuery(driverId, {
    skip: skipQueries,
  });
  const { data: vehicleTypes = [] } = useGetVehicleTypesQuery({ countryId }, { skip: skipQueries });
  const { data: serviceTypes = [] } = useGetVehicleServiceTypesQuery(undefined, { skip: skipQueries });
  const [form, setForm] = useState<DriverVehicleFormState>(emptyForm());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [updateVehicle, { isLoading: saving }] = useUpdateDriverVehicleMutation();
  const [approveVehicle, { isLoading: approving }] = useApproveDriverVehicleMutation();
  const [rejectVehicle, { isLoading: rejecting }] = useRejectDriverVehicleMutation();
  const { data: countryRules = [] } = useGetCountryVehicleRulesQuery(
    countryId ? { countryId } : {},
    { skip: skipQueries },
  );

  const showTaxi = form.service_usages.includes('taxi');
  const { data: taxiCategories = [] } = useGetTaxiCategoriesQuery(
    { vehicleType: form.vehicle_type },
    { skip: skipQueries || !showTaxi },
  );

  const selectedTypeMeta = useMemo(
    () => vehicleTypes.find((t) => t.value === form.vehicle_type),
    [vehicleTypes, form.vehicle_type],
  );

  const allowedUsages = useMemo(() => {
    if (selectedTypeMeta?.allowed_service_usages?.length) {
      return selectedTypeMeta.allowed_service_usages;
    }
    if (vehicle?.allowed_service_usages?.length) {
      return vehicle.allowed_service_usages;
    }
    return serviceTypes.map((s) => s.value);
  }, [selectedTypeMeta, vehicle, serviceTypes]);

  const visibleServiceTypes = serviceTypes.filter((s) => allowedUsages.includes(s.value));

  useEffect(() => {
    if (!vehicle) return;
    setForm({
      vehicle_type: vehicle.vehicle_type || 'car',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year ? String(vehicle.year) : '',
      color: vehicle.color || '',
      plate_number: vehicle.plate_number || '',
      passenger_capacity: vehicle.passenger_capacity || 1,
      cargo_capacity_kg: vehicle.cargo_capacity_kg != null ? String(vehicle.cargo_capacity_kg) : '',
      service_usages: vehicle.service_usages || [],
      taxi_category: vehicle.taxi_category || '',
      is_active: vehicle.is_active,
    });
  }, [vehicle]);

  function toggleUsage(value: string) {
    setForm((prev) => {
      const has = prev.service_usages.includes(value);
      const next = has
        ? prev.service_usages.filter((u) => u !== value)
        : [...prev.service_usages, value];
      return {
        ...prev,
        service_usages: next,
        taxi_category: next.includes('taxi') ? prev.taxi_category : '',
      };
    });
  }

  function formatActionError(err: unknown, fallback: string): string {
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 401) {
      return 'Session expired. Please sign in again as a platform admin.';
    }
    if (err && typeof err === 'object' && 'data' in err) {
      return JSON.stringify((err as { data: unknown }).data);
    }
    return fallback;
  }

  async function handleSave(notify = true) {
    setSaveError(null);
    try {
      await updateVehicle({
        driverId,
        body: {
          vehicle_type: form.vehicle_type,
          make: form.make,
          model: form.model,
          year: form.year ? Number(form.year) : null,
          color: form.color,
          plate_number: form.plate_number,
          passenger_capacity: form.passenger_capacity,
          cargo_capacity_kg: form.cargo_capacity_kg ? Number(form.cargo_capacity_kg) : null,
          service_usages: form.service_usages,
          taxi_category: showTaxi ? form.taxi_category || null : null,
          is_active: form.is_active,
        },
      }).unwrap();
      if (notify) onSaved?.();
    } catch (err: unknown) {
      setSaveError(formatActionError(err, 'Failed to save vehicle configuration.'));
      throw err;
    }
  }

  async function handleApprove() {
    setSaveError(null);
    try {
      await handleSave(false);
      await approveVehicle(driverId).unwrap();
      onSaved?.();
    } catch (err: unknown) {
      setSaveError(formatActionError(err, 'Failed to approve vehicle.'));
    }
  }

  async function handleReject() {
    const reason = window.prompt('Rejection reason:');
    if (!reason?.trim()) return;
    setSaveError(null);
    try {
      await rejectVehicle({ driverId, reason: reason.trim() }).unwrap();
      onSaved?.();
    } catch (err: unknown) {
      setSaveError(formatActionError(err, 'Failed to reject vehicle.'));
    }
  }

  if (!authReady) {
    return <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
        Failed to load vehicle configuration.
      </div>
    );
  }

  const countryRule = countryRules[0];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Vehicle Configuration</h3>
          <p className="text-sm text-slate-500">{driverName}</p>
        </div>
        {vehicle && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              STATUS_STYLES[vehicle.verification_status] ?? STATUS_STYLES.pending_review
            }`}
          >
            {vehicle.verification_status.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {countryRule && (
        <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Country rules ({countryRule.country_name}): motorcycle taxi{' '}
          {countryRule.allow_motorcycle_taxi ? 'allowed' : 'not allowed'} · bicycle delivery{' '}
          {countryRule.allow_bicycle_delivery ? 'on' : 'off'}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Vehicle type</span>
          <select
            disabled={!canEdit}
            value={form.vehicle_type}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                vehicle_type: e.target.value,
                service_usages: [],
                taxi_category: '',
              }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2"
          >
            {vehicleTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Plate number</span>
          <input
            disabled={!canEdit}
            value={form.plate_number}
            onChange={(e) => setForm((p) => ({ ...p, plate_number: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Make</span>
          <input
            disabled={!canEdit}
            value={form.make}
            onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Model</span>
          <input
            disabled={!canEdit}
            value={form.model}
            onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Year</span>
          <input
            disabled={!canEdit}
            type="number"
            value={form.year}
            onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Color</span>
          <input
            disabled={!canEdit}
            value={form.color}
            onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Passenger capacity</span>
          <input
            disabled={!canEdit}
            type="number"
            min={1}
            value={form.passenger_capacity}
            onChange={(e) =>
              setForm((p) => ({ ...p, passenger_capacity: Number(e.target.value) || 1 }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Cargo capacity (kg)</span>
          <input
            disabled={!canEdit}
            type="number"
            min={0}
            value={form.cargo_capacity_kg}
            onChange={(e) => setForm((p) => ({ ...p, cargo_capacity_kg: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">Service usage</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visibleServiceTypes.map((s) => (
            <label key={s.value} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={form.service_usages.includes(s.value)}
                onChange={() => toggleUsage(s.value)}
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      {showTaxi && (
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Taxi category</span>
          <select
            disabled={!canEdit}
            value={form.taxi_category}
            onChange={(e) => setForm((p) => ({ ...p, taxi_category: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="">Select category</option>
            {taxiCategories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
      )}

      {saveError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{saveError}</p>
      )}

      {canEdit && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save configuration'}
          </button>
          <button
            type="button"
            disabled={approving}
            onClick={() => void handleApprove()}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Approve vehicle
          </button>
          <button
            type="button"
            disabled={rejecting}
            onClick={() => void handleReject()}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Reject vehicle
          </button>
        </div>
      )}
    </div>
  );
}
