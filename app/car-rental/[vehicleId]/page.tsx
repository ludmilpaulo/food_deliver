'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/hooks/useTranslation';
import { useBookRentalMutation, useGetRentalVehiclesQuery } from '@/redux/slices/marketplaceApi';
import type { RootState } from '@/redux/store';
import PaymentDetails from '@/app/Checkout/PaymentDetails';
import {
  useCreatePaymentMutation,
  useUploadPaymentProofMutation,
} from '@/redux/slices/paymentsApi';
import { followUpPayment } from '@/lib/followUpPayment';

export default function CarRentalDetailPage() {
  const params = useParams<{ vehicleId: string }>();
  const vehicleId = Number(params.vehicleId);
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: vehicles = [], isLoading } = useGetRentalVehiclesQuery({});
  const [bookRental, { isLoading: booking, isSuccess }] = useBookRentalMutation();
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [createPayment] = useCreatePaymentMutation();
  const [uploadProof] = useUploadPaymentProofMutation();

  const handleBook = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError(t('loginRequired', 'Please sign in to continue.'));
      return;
    }
    setError(null);
    try {
      const booking = await bookRental({
        vehicle: vehicleId,
        start_date: startDate,
        end_date: endDate,
        pickup_location: pickup,
        return_location: dropoff || pickup,
      }).unwrap();
      const bookingId = typeof booking.id === 'number' ? booking.id : Number(booking.id);
      const amount =
        typeof booking.total_amount === 'number' || typeof booking.total_amount === 'string'
          ? booking.total_amount
          : vehicle?.daily_price ?? 0;
      const currency = typeof booking.currency === 'string' ? booking.currency : vehicle?.currency;
      await followUpPayment({
        createPayment,
        uploadProof,
        amount,
        method: paymentMethod,
        phone: paymentPhone,
        proofFile,
        serviceType: 'car_rental',
        objectId: Number.isFinite(bookingId) ? bookingId : undefined,
        currency,
      });
    } catch {
      setError(t('bookingFailed', 'Could not complete request'));
    }
  };

  if (isLoading) {
    return <div className="px-4 py-10 text-slate-500">{t('loading', 'Loading...')}</div>;
  }

  if (!vehicle) {
    return (
      <div className="px-4 py-10">
        <p className="text-slate-600">{t('noResultsFound', 'No results found')}</p>
        <Link href="/car-rental" className="mt-4 inline-block text-teal-700 underline">
          {t('backToCarRental', 'Back to car rental')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/car-rental" className="text-sm text-teal-700 underline">
        {t('backToCarRental', 'Back to car rental')}
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">
        {vehicle.make} {vehicle.model} ({vehicle.year})
      </h1>
      <p className="mt-2 text-slate-500">
        {vehicle.seats} {t('seats', 'seats')} · {vehicle.transmission} · {vehicle.fuel_type}
      </p>
      <p className="mt-6 text-2xl font-bold text-teal-700">
        {vehicle.daily_price} {vehicle.currency}/{t('day', 'day')}
      </p>

      <form onSubmit={handleBook} className="mt-8 space-y-3 rounded-2xl border border-slate-100 bg-white p-6">
        <input
          type="date"
          required
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
        <input
          type="date"
          required
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
        <input
          required
          value={pickup}
          onChange={(event) => setPickup(event.target.value)}
          placeholder={t('pickupLocation', 'Pickup location')}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
        <input
          value={dropoff}
          onChange={(event) => setDropoff(event.target.value)}
          placeholder={t('returnLocation', 'Return location')}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
        <PaymentDetails
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          phone={paymentPhone}
          setPhone={setPaymentPhone}
          proofFile={proofFile}
          setProofFile={setProofFile}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {isSuccess ? (
          <p className="text-sm text-emerald-700">{t('requestSubmitted', 'Request submitted successfully.')}</p>
        ) : null}
        <button
          type="submit"
          disabled={booking}
          className="rounded-xl bg-teal-700 px-4 py-2 font-semibold text-white"
        >
          {t('bookVehicle', 'Request rental')}
        </button>
        {!token ? (
          <Link href="/LoginScreenUser" className="ml-3 text-sm text-slate-600 underline">
            {t('login', 'Login')}
          </Link>
        ) : null}
      </form>
    </div>
  );
}
