'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useGetAccommodationListingsQuery } from '@/redux/slices/marketplaceApi';

export default function StayDetailPage() {
  const params = useParams<{ stayId: string }>();
  const stayId = Number(params.stayId);
  const { t } = useTranslation();
  const { data: listings = [], isLoading } = useGetAccommodationListingsQuery({});
  const listing = listings.find((item) => item.id === stayId);

  if (isLoading) {
    return <div className="px-4 py-10 text-slate-500">{t('loading', 'Loading...')}</div>;
  }

  if (!listing) {
    return (
      <div className="px-4 py-10">
        <p className="text-slate-600">{t('noResultsFound', 'No results found')}</p>
        <Link href="/stay" className="mt-4 inline-block text-sky-700 underline">
          {t('backToStay', 'Back to stays')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/stay" className="text-sm text-sky-700 underline">
        {t('backToStay', 'Back to stays')}
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">{listing.title}</h1>
      <p className="mt-2 text-slate-500">
        {[listing.city_name, listing.country_name].filter(Boolean).join(', ')}
      </p>
      <p className="mt-6 text-slate-700">{listing.description}</p>
      <p className="mt-6 text-2xl font-bold text-sky-700">
        {listing.price_per_night} {listing.currency}/{t('night', 'night')}
      </p>
      <p className="mt-6 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900">
        {t('stayBookingComingSoon', 'Online stay booking checkout is coming next. Contact the host through Kudya support for now.')}
      </p>
    </div>
  );
}
