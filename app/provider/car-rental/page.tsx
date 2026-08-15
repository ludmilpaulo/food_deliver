'use client';

import { FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useCreateRentalVehicleMutation,
  useGetCountriesQuery,
  useGetMyRentalVehiclesQuery,
  useGetPartnerRentalBookingsQuery,
} from '@/redux/slices/marketplaceApi';
import type { RootState } from '@/redux/store';
import withPartnerAuth from '@/components/PartnerRouteGuard';

function PartnerCarRentalPage() {
  const { t } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: vehicles = [], isLoading, refetch } = useGetMyRentalVehiclesQuery(undefined, { skip: !token });
  const { data: bookings = [] } = useGetPartnerRentalBookingsQuery(undefined, { skip: !token });
  const { data: countries = [] } = useGetCountriesQuery();
  const [createVehicle, { isLoading: creating }] = useCreateRentalVehicleMutation();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2020');
  const [plate, setPlate] = useState('');
  const [dailyPrice, setDailyPrice] = useState('400');
  const [countryId, setCountryId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createVehicle({
        make,
        model,
        year: Number(year),
        plate_number: plate,
        country: Number(countryId),
        daily_price: dailyPrice,
        deposit_amount: '0',
      }).unwrap();
      setMake('');
      setModel('');
      setPlate('');
      refetch();
    } catch {
      setError(t('saveFailed', 'Could not save vehicle. Select a country and try again.'));
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{t('carRental', 'Car Rental')}</h1>
      <p className="mt-2 text-slate-600">
        {t('partnerFleetHint', 'Vehicles you add stay pending until a platform admin approves them.')}
      </p>

      <form onSubmit={handleCreate} className="mt-6 grid gap-3 rounded-2xl border border-slate-100 bg-white p-6 sm:grid-cols-2">
        <input required value={make} onChange={(e) => setMake(e.target.value)} placeholder="Make" className="rounded-xl border px-3 py-2" />
        <input required value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" className="rounded-xl border px-3 py-2" />
        <input required value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" className="rounded-xl border px-3 py-2" />
        <input required value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="Plate" className="rounded-xl border px-3 py-2" />
        <input required value={dailyPrice} onChange={(e) => setDailyPrice(e.target.value)} placeholder="Daily price" className="rounded-xl border px-3 py-2" />
        <select required value={countryId} onChange={(e) => setCountryId(e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">{t('country', 'Country')}</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={creating} className="rounded-xl bg-teal-700 px-4 py-2 font-semibold text-white">
          {t('add', 'Add')}
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{t('myVehicles', 'My vehicles')}</h2>
        {isLoading ? <p className="mt-3 text-slate-500">{t('loading', 'Loading...')}</p> : null}
        <ul className="mt-3 space-y-2">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="rounded-xl border bg-white px-4 py-3">
              {vehicle.make} {vehicle.model} · {vehicle.daily_price} {vehicle.currency}/day
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{t('bookings', 'Bookings')}</h2>
        <ul className="mt-3 space-y-2">
          {bookings.map((row) => (
            <li key={String(row.id)} className="rounded-xl border bg-white px-4 py-3 text-sm">
              {String(row.booking_number ?? row.id)} · {String(row.status ?? '')} · {String(row.start_date ?? '')}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default withPartnerAuth(PartnerCarRentalPage);
