'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  MdDashboard,
  MdApps,
  MdPeople,
  MdVerifiedUser,
  MdGpsFixed,
  MdReceipt,
  MdPayments,
  MdBarChart,
  MdSupport,
  MdSettings,
  MdAttachMoney,
  MdLogout,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';

import type { AdminPanelId } from '@/app/AdminDashboard/adminPanels';
import { adminPanelUrl } from '@/configs/adminNav';
import { useTranslation } from '@/hooks/useTranslation';
import { logoutUser } from '@/redux/slices/authSlice';

type NavItem =
  | { kind: 'panel'; panel: AdminPanelId; icon: React.ReactNode; labelKey: string; fallback: string }
  | { kind: 'drivers'; icon: React.ReactNode; labelKey: string; fallback: string }
  | { kind: 'anchor'; hash: string; icon: React.ReactNode; labelKey: string; fallback: string };

type DriversOpsSidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
  showCollapseToggle?: boolean;
};

export default function DriversOpsSidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
  showCollapseToggle = true,
}: DriversOpsSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onDriversPage = pathname?.toLowerCase().includes('/admin/drivers') ?? false;

  const items: NavItem[] = [
    { kind: 'panel', panel: 'superApp', icon: <MdDashboard />, labelKey: 'dashboard', fallback: 'Dashboard' },
    { kind: 'panel', panel: 'superApp', icon: <MdApps />, labelKey: 'superApp', fallback: 'Super App' },
    { kind: 'drivers', icon: <MdPeople />, labelKey: 'drivers', fallback: 'Drivers' },
    { kind: 'anchor', hash: 'live-driver-map', icon: <MdGpsFixed />, labelKey: 'liveTracking', fallback: 'Live Tracking' },
    { kind: 'panel', panel: 'driverVerification', icon: <MdVerifiedUser />, labelKey: 'driverVerification', fallback: 'Verification' },
    { kind: 'panel', panel: 'orders', icon: <MdReceipt />, labelKey: 'orders', fallback: 'Orders' },
    { kind: 'panel', panel: 'payouts', icon: <MdPayments />, labelKey: 'payouts', fallback: 'Payouts' },
    { kind: 'panel', panel: 'reports', icon: <MdBarChart />, labelKey: 'reports', fallback: 'Reports' },
    { kind: 'panel', panel: 'pricing', icon: <MdAttachMoney />, labelKey: 'pricingAndFees', fallback: 'Pricing & fees' },
    { kind: 'panel', panel: 'liveSupport', icon: <MdSupport />, labelKey: 'liveSupport', fallback: 'Support' },
    { kind: 'panel', panel: 'platformControl', icon: <MdSettings />, labelKey: 'platformControl', fallback: 'Settings' },
  ];

  function navigatePanel(panel: AdminPanelId) {
    onNavigate?.();
    router.push(adminPanelUrl(panel));
  }

  function scrollToLiveMap() {
    onNavigate?.();
    if (onDriversPage) {
      document.getElementById('live-driver-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    router.push('/admin/drivers#live-driver-map');
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/LoginScreenUser');
  };

  return (
    <aside
      className={`flex h-full w-full shrink-0 flex-col bg-gradient-to-b from-blue-600 to-blue-700 text-white transition-all duration-200 ${
        collapsed ? 'md:w-[72px]' : 'md:w-64'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-blue-500/40 p-4">
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src="https://www.kudya.shop/media/logo/azul.png"
                alt="Kudya"
                fill
                className="rounded-full bg-white object-cover"
                unoptimized
              />
            </div>
            <span className="truncate text-sm font-bold">{t('administrator', 'Kudya Admin')}</span>
          </div>
        )}
        {showCollapseToggle && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 hover:bg-blue-500/50 md:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const label = t(item.labelKey, item.fallback);
            const active =
              (item.kind === 'drivers' && onDriversPage) ||
              (item.kind === 'anchor' && onDriversPage);

            if (item.kind === 'panel') {
              return (
                <li key={`panel-${item.panel}-${item.labelKey}`}>
                  <button
                    type="button"
                    onClick={() => navigatePanel(item.panel)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/10 ${
                      active ? 'bg-white/20 font-semibold shadow-sm' : ''
                    }`}
                    title={collapsed ? label : undefined}
                  >
                    <span className="shrink-0 text-lg">{item.icon}</span>
                    {!collapsed && <span className="truncate">{label}</span>}
                  </button>
                </li>
              );
            }

            if (item.kind === 'anchor') {
              return (
                <li key={`anchor-${item.hash}`}>
                  <button
                    type="button"
                    onClick={scrollToLiveMap}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/10 ${
                      active ? 'bg-white/10' : ''
                    }`}
                    title={collapsed ? label : undefined}
                  >
                    <span className="shrink-0 text-lg">{item.icon}</span>
                    {!collapsed && <span className="truncate">{label}</span>}
                  </button>
                </li>
              );
            }

            return (
              <li key="drivers-home">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate?.();
                    router.push('/admin/drivers');
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? 'bg-white/20 font-semibold shadow-sm' : 'hover:bg-white/10'
                  }`}
                  title={collapsed ? label : undefined}
                >
                  <span className="shrink-0 text-lg">{item.icon}</span>
                  {!collapsed && <span className="truncate">{label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-blue-500/40 p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/10"
        >
          <MdLogout className="shrink-0 text-lg" />
          {!collapsed && <span>{t('logout', 'Logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
