'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks/useTranslation';

const TrackOrders = dynamic(() => import('@/app/UserDashboard/TrackOrders'), { ssr: false });
const Bookings = dynamic(() => import('@/app/UserDashboard/Bookings'), { ssr: false });
const OrderHistory = dynamic(() => import('@/app/UserDashboard/OrderHistory'), { ssr: false });

const tabs = [
  { id: 'active', labelKey: 'orders.trackOrder', fallback: 'Active orders' },
  { id: 'bookings', labelKey: 'bookings', fallback: 'Bookings' },
  { id: 'history', labelKey: 'orderHistory', fallback: 'Order history' },
] as const;

export default function OrdersHub() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('active');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('myOrders', 'My Orders & Bookings')}</h1>
          <p className="mt-2 text-slate-600">
            {t(
              'ordersHubSubtitle',
              'Track food orders, product purchases, service bookings, stays, rentals, and courier deliveries.',
            )}
          </p>
        </div>
        <Link href="/profile" className="text-sm font-semibold text-sky-700">
          {t('profile', 'Profile')}
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === tab.id ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            {t(tab.labelKey, tab.fallback)}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-6">
        {activeTab === 'active' ? <TrackOrders /> : null}
        {activeTab === 'bookings' ? <Bookings /> : null}
        {activeTab === 'history' ? <OrderHistory /> : null}
      </div>
    </div>
  );
}
