'use client';

import React, { useState } from 'react';
import { MdMenu } from 'react-icons/md';

import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import DriversOpsSidebar from '@/features/admin/drivers/components/DriversOpsSidebar';
import { useTranslation } from '@/hooks/useTranslation';

export default function AdminDriversLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminRouteGuard>
      <div className="flex h-[100dvh] overflow-hidden bg-slate-100">
        {/* Mobile drawer */}
        <div
          className={`${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-[min(100vw,280px)] transition-transform duration-200 md:relative md:translate-x-0 md:flex md:w-auto`}
        >
          <DriversOpsSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            onNavigate={() => setMobileOpen(false)}
            showCollapseToggle={!mobileOpen}
          />
        </div>

        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center border-b border-slate-200 bg-white px-3 py-2.5 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-blue-600 active:bg-blue-50"
              aria-label="Open menu"
            >
              <MdMenu className="text-2xl" />
            </button>
            <span className="ml-2 truncate text-sm font-semibold text-slate-800">
              {t('driverOpsTitle', 'Global Driver Operations')}
            </span>
          </div>
          <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
            {children}
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
