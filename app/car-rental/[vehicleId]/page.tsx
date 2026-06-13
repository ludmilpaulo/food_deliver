'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useGetRentalVehiclesQuery } from '@/redux/slices/marketplaceApi';

export default function CarRentalDetailPage() {
  const params = useParams<{ vehicleId: string }>();
  const vehicleId = Number(params.vehicleId);
  const { t } = useTranslation();
  const { data: vehicles = [], isLoading } = useGetRentalVehiclesQuery({});
  const vehicle = vehicles.find((item) => item.id === vehicleId);

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
      <p className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm text-teal-900">
        {t('carRentalBookingComingSoon', 'Vehicle booking checkout is coming next. Contact Kudya support to reserve this vehicle.')}
      </p>
    </div>
  );
}
