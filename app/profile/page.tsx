'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const UserDashboard = dynamic(() => import('@/app/UserDashboard/page'), { ssr: false });

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('profile', 'Profile')}</h1>
            <p className="text-sm text-slate-600">{t('profileSubtitle', 'Manage your account details and preferences.')}</p>
          </div>
          <Link href="/orders" className="text-sm font-semibold text-sky-700">
            {t('myOrders', 'My orders')}
          </Link>
        </div>
      </div>
      <UserDashboard />
    </div>
  );
}
