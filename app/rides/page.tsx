'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/hooks/useTranslation';
import type { RootState } from '@/redux/store';
import {
  useCancelRideMutation,
  useEstimateRidePriceMutation,
  useGetRideCategoriesQuery,
  useGetRideSearchStatusQuery,
  useRequestRideMutation,
} from '@/redux/slices/ridesApi';
import PaymentDetails from '@/app/Checkout/PaymentDetails';
import {
  useCreatePaymentMutation,
  useUploadPaymentProofMutation,
} from '@/redux/slices/paymentsApi';
import { followUpPayment } from '@/lib/followUpPayment';

type LatLng = { lat: number; lng: number };

export default function RidesPage() {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState<LatLng | null>(null);
  const [destCoords, setDestCoords] = useState<LatLng | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [rideId, setRideId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const countryCode = 'ZA';

  const { data: categories = [] } = useGetRideCategoriesQuery(countryCode);
  const [estimatePrice, { data: estimate, isLoading: estimating }] = useEstimateRidePriceMutation();
  const [requestRide, { isLoading: requesting }] = useRequestRideMutation();
  const [createPayment] = useCreatePaymentMutation();
  const [uploadProof] = useUploadPaymentProofMutation();
  const [cancelRide] = useCancelRideMutation();
  const { data: search } = useGetRideSearchStatusQuery(rideId ?? 0, {
    skip: !rideId,
    pollingInterval: rideId ? 4000 : 0,
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      setPickupCoords(coords);
      setPickup((current) => current || t('currentLocation', 'Current location'));
    });
  }, [t]);

  useEffect(() => {
    if (categories[0] && !categoryId) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  const selectedCategory = useMemo(
    () => categories.find((row) => row.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const geocode = async (query: string): Promise<LatLng | null> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
    );
    const rows = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!rows[0]) return null;
    return { lat: Number(rows[0].lat), lng: Number(rows[0].lon) };
  };

  const handleEstimate = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    let dest = destCoords;
    if (!dest && destination.trim()) {
      dest = await geocode(destination.trim());
      setDestCoords(dest);
    }
    if (!pickupCoords || !dest || !categoryId) {
      setError(t('ridesNeedLocations', 'Set pickup GPS and a destination to estimate a fare.'));
      return;
    }
    try {
      await estimatePrice({
        pickup_latitude: pickupCoords.lat,
        pickup_longitude: pickupCoords.lng,
        destination_latitude: dest.lat,
        destination_longitude: dest.lng,
        ride_category_id: categoryId,
        country_code: countryCode,
      }).unwrap();
    } catch {
      setError(t('estimateFailed', 'Could not estimate this ride.'));
    }
  };

  const handleRequest = async () => {
    setError(null);
    if (!token) return;
    if (!pickupCoords || !destCoords || !selectedCategory) {
      setError(t('ridesNeedLocations', 'Set pickup GPS and a destination to request a ride.'));
      return;
    }
    try {
      const ride = await requestRide({
        pickup_address: pickup || 'Pickup',
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        destination_address: destination || 'Destination',
        destination_lat: destCoords.lat,
        destination_lng: destCoords.lng,
        ride_type: selectedCategory.slug || 'economy',
        payment_method: paymentMethod || 'cash',
        country_code: countryCode,
      }).unwrap();
      await followUpPayment({
        createPayment,
        uploadProof,
        amount: ride.estimated_price || estimate?.default_fare || estimate?.estimated_min_price || 0,
        method: paymentMethod,
        phone: paymentPhone,
        proofFile,
        serviceType: 'ride',
        objectId: ride.id,
        currency: ride.currency,
      });
      setRideId(ride.id);
    } catch {
      setError(t('requestFailed', 'Could not request this ride.'));
    }
  };

  const ride = search?.ride;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-slate-900 p-6 text-white">
      <h1 className="text-2xl font-bold">{t('requestRide', 'Request a Ride')}</h1>
      <p className="mt-2 text-sm text-slate-400">
        {t('ridesWebHint', 'Live fares and tracking use the same Django ride APIs as the mobile app.')}
      </p>
      {!token ? (
        <Link href="/LoginScreenUser?next=/rides" className="mt-6 inline-block rounded-xl bg-white px-4 py-2 font-semibold text-slate-900">
          {t('login', 'Login')}
        </Link>
      ) : (
        <form onSubmit={(event) => void handleEstimate(event)} className="mt-6 space-y-3">
          <input
            value={pickup}
            onChange={(event) => setPickup(event.target.value)}
            placeholder={t('pickup', 'Pickup')}
            className="w-full rounded-xl bg-slate-800 px-3 py-2"
          />
          <input
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder={t('destination', 'Destination')}
            className="w-full rounded-xl bg-slate-800 px-3 py-2"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setCategoryId(category.id)}
                className={`rounded-full px-3 py-1 text-sm ${categoryId === category.id ? 'bg-blue-600' : 'bg-slate-800'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
          <button type="submit" className="w-full rounded-xl bg-slate-700 py-2 font-semibold">
            {estimating ? t('loading', 'Loading...') : t('estimate', 'Estimate')}
          </button>
        </form>
      )}
      {estimate ? (
        <p className="mt-4 text-slate-200">
          {estimate.currency} {Number(estimate.estimated_min_price).toFixed(2)} – {Number(estimate.estimated_max_price).toFixed(2)}
          {' · '}
          {estimate.distance_km} km
        </p>
      ) : null}
      {token && estimate ? (
        <>
          <div className="mt-4 rounded-xl bg-white p-3 text-slate-900">
            <PaymentDetails
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              phone={paymentPhone}
              setPhone={setPaymentPhone}
              proofFile={proofFile}
              setProofFile={setProofFile}
            />
          </div>
          <button onClick={() => void handleRequest()} className="mt-3 w-full rounded-xl bg-blue-600 py-2 font-semibold">
            {requesting ? t('loading', 'Loading...') : t('requestRide', 'Request a Ride')}
          </button>
        </>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {ride ? (
        <div className="mt-6 rounded-2xl bg-slate-800 p-4">
          <p className="font-semibold">{t('status', 'Status')}: {ride.status}</p>
          <p className="mt-1 text-sm text-slate-300">{ride.ride_number}</p>
          {ride.driver_name ? <p className="mt-1 text-sm">{ride.driver_name} · {ride.driver_phone}</p> : null}
          {['requested', 'searching', 'confirmed', 'accepted'].includes(ride.status) ? (
            <button
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold"
              onClick={() => void cancelRide({ rideId: ride.id })}
            >
              {t('cancel', 'Cancel')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
