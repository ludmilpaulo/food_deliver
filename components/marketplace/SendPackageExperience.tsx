'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import LocationFilterBar from '@/components/location/LocationFilterBar';
import {
  useEstimatePackageMutation,
  useRequestPackageMutation,
} from '@/redux/slices/marketplaceApi';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

const PACKAGE_TYPES = ['small', 'medium', 'large', 'fragile', 'document', 'envelope'] as const;
const URGENCY_OPTIONS = ['standard', 'express', 'same_day'] as const;

export default function SendPackageExperience() {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const [estimatePackage, { data: estimate, isLoading: estimating }] = useEstimatePackageMutation();
  const [requestPackage, { isLoading: submitting, isSuccess }] = useRequestPackageMutation();

  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [packageType, setPackageType] = useState<(typeof PACKAGE_TYPES)[number]>('small');
  const [urgency, setUrgency] = useState<(typeof URGENCY_OPTIONS)[number]>('standard');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await estimatePackage({
        pickup_lat: -8.8383,
        pickup_lng: 13.2344,
        dropoff_lat: -8.85,
        dropoff_lng: 13.25,
        package_type: packageType,
        urgency,
      }).unwrap();
    } catch {
      setError(t('unableToLoadData', 'Unable to load data'));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError(t('loginRequired', 'Please sign in to continue.'));
      return;
    }
    setError(null);
    try {
      await requestPackage({
        pickup_address: pickupAddress,
        pickup_lat: -8.8383,
        pickup_lng: 13.2344,
        dropoff_address: dropoffAddress,
        dropoff_lat: -8.85,
        dropoff_lng: 13.25,
        package_type: packageType,
        urgency,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        package_notes: notes,
      }).unwrap();
    } catch {
      setError(t('bookingFailed', 'Could not complete request'));
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <LocationFilterBar className="mb-6" />
      <h1 className="text-3xl font-bold text-violet-900">{t('sendPackage', 'Send a Package')}</h1>
      <p className="mt-2 text-slate-600">
        {t('sendPackageSubtitle', 'Courier delivery with upfront pricing and live tracking.')}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <input
          value={pickupAddress}
          onChange={(event) => setPickupAddress(event.target.value)}
          placeholder={t('pickupAddress', 'Pickup address')}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          required
        />
        <input
          value={dropoffAddress}
          onChange={(event) => setDropoffAddress(event.target.value)}
          placeholder={t('dropoffAddress', 'Drop-off address')}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={packageType}
            onChange={(event) => setPackageType(event.target.value as (typeof PACKAGE_TYPES)[number])}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            {PACKAGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={urgency}
            onChange={(event) => setUrgency(event.target.value as (typeof URGENCY_OPTIONS)[number])}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            {URGENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <input
          value={recipientName}
          onChange={(event) => setRecipientName(event.target.value)}
          placeholder={t('recipientName', 'Recipient name')}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          required
        />
        <input
          value={recipientPhone}
          onChange={(event) => setRecipientPhone(event.target.value)}
          placeholder={t('recipientPhone', 'Recipient phone')}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          required
        />
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t('packageNotes', 'Package description')}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          rows={3}
        />

        {estimate ? (
          <div className="rounded-xl bg-violet-50 px-4 py-3 text-violet-900">
            {t('estimatedPrice', 'Estimated price')}: {estimate.estimated_price} {estimate.currency}
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {isSuccess ? (
          <p className="text-sm text-emerald-700">{t('requestSubmitted', 'Request submitted successfully.')}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleEstimate}
            disabled={estimating}
            className="rounded-xl border border-violet-200 px-4 py-2 font-semibold text-violet-700"
          >
            {t('getEstimate', 'Get estimate')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white"
          >
            {t('requestCourier', 'Request courier')}
          </button>
          {!token ? (
            <Link href="/LoginScreenUser" className="rounded-xl px-4 py-2 text-sm text-slate-600 underline">
              {t('login', 'Login')}
            </Link>
          ) : null}
        </div>
      </form>
    </div>
  );
}
