'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { BarChart3, ClipboardList, LayoutDashboard, Settings, UtensilsCrossed, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import WorkspaceShell, { type WorkspaceNavItem } from '../components/WorkspaceShell';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../components/FoodStates';
import { useGetPartnerMeQuery } from './partnerApi';
import type { PartnerCapability, PartnerMe } from './types';

const PartnerContext = createContext<PartnerMe | null>(null);

export function usePartner(): PartnerMe {
  const value = useContext(PartnerContext);
  if (!value) throw new Error('usePartner must be used inside PartnerWorkspace');
  return value;
}

export function useCan(capability: PartnerCapability): boolean {
  return usePartner().capabilities.includes(capability);
}

export default function PartnerWorkspace({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const me = useGetPartnerMeQuery(undefined, { pollingInterval: 60_000 });

  if (me.isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <FoodSkeletonGrid count={3} />
      </div>
    );
  }
  if (me.isError || !me.data) {
    const status = (me.error as { status?: number } | undefined)?.status;
    return (
      <div className="mx-auto max-w-xl p-10">
        {status === 403 || status === 404 ? (
          <FoodEmpty
            title={t('fpNoAccess', 'No restaurant workspace')}
            message={t('fpNoAccessHint', 'This account is not the owner or a team member of a restaurant on Kudya.')}
          />
        ) : (
          <FoodError onRetry={me.refetch} />
        )}
      </div>
    );
  }

  const caps = new Set(me.data.capabilities);
  const nav: WorkspaceNavItem[] = [
    { href: '/partner/food', label: t('fpDashboard', 'Dashboard'), icon: LayoutDashboard },
    ...(caps.has('view_orders') ? [{ href: '/partner/food/orders', label: t('fpOrders', 'Orders'), icon: ClipboardList }] : []),
    ...(caps.has('manage_menu') ? [{ href: '/partner/food/menu', label: t('fpMenu', 'Menu'), icon: UtensilsCrossed }] : []),
    ...(caps.has('view_reports') ? [{ href: '/partner/food/analytics', label: t('fpReports', 'Reports'), icon: BarChart3 }] : []),
    ...(caps.has('manage_team') ? [{ href: '/partner/food/team', label: t('fpTeam', 'Team'), icon: Users }] : []),
    ...(caps.has('manage_store') || caps.has('manage_hours')
      ? [{ href: '/partner/food/settings', label: t('fpSettings', 'Restaurant settings'), icon: Settings }]
      : []),
  ];
  const store = me.data.store;

  return (
    <PartnerContext.Provider value={me.data}>
      <WorkspaceShell
        title={store.name}
        subtitle={t(`fpRole_${me.data.role}`, me.data.role)}
        nav={nav}
        actions={
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              !store.is_approved
                ? 'bg-amber-100 text-amber-800'
                : store.accepting_orders
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
            }`}
          >
            {!store.is_approved
              ? t('fpPendingVerification', 'Pending verification')
              : store.accepting_orders
                ? t('fpAcceptingOrders', 'Accepting orders')
                : t('fpPaused', 'Orders paused')}
          </span>
        }
      >
        {!store.is_approved ? (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t('fpVerificationNotice', 'Kudya is reviewing your restaurant. Customers will see it once it is approved.')}
          </p>
        ) : null}
        {children}
      </WorkspaceShell>
    </PartnerContext.Provider>
  );
}
