'use client';

import type { ReactNode } from 'react';
import { BarChart3, ClipboardList, LayoutDashboard, ReceiptText, Settings2, Store } from 'lucide-react';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { useTranslation } from '@/hooks/useTranslation';
import WorkspaceShell from '../components/WorkspaceShell';

export default function AdminFoodWorkspace({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <AdminRouteGuard>
      <WorkspaceShell
        title={t('faTitle', 'Food administration')}
        subtitle={t('faSubtitle', 'Restaurants, orders, refunds and finance')}
        nav={[
          { href: '/admin/food', label: t('faOverview', 'Overview'), icon: LayoutDashboard },
          { href: '/admin/food/restaurants', label: t('faRestaurants', 'Restaurants'), icon: Store },
          { href: '/admin/food/orders', label: t('faOrders', 'Orders'), icon: ClipboardList },
          { href: '/admin/food/refunds', label: t('faRefunds', 'Refunds'), icon: ReceiptText },
          { href: '/admin/food/config', label: t('faConfig', 'Configuration'), icon: Settings2 },
          { href: '/admin/food/reports', label: t('faReports', 'Financial reports'), icon: BarChart3 },
        ]}
      >
        {children}
      </WorkspaceShell>
    </AdminRouteGuard>
  );
}
