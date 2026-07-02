'use client';

import React from 'react';

import type { DriverServiceType } from '@/features/admin/drivers/types';

const TABS: { key: DriverServiceType; label: string; shortLabel: string }[] = [
  { key: 'all', label: 'All Services', shortLabel: 'All' },
  { key: 'taxi', label: 'Taxi', shortLabel: 'Taxi' },
  { key: 'parcel', label: 'Parcel', shortLabel: 'Parcel' },
  { key: 'food', label: 'Food', shortLabel: 'Food' },
  { key: 'grocery', label: 'Grocery', shortLabel: 'Grocery' },
  { key: 'store_delivery', label: 'Store Delivery', shortLabel: 'Store' },
  { key: 'medical', label: 'Medical', shortLabel: 'Medical' },
  { key: 'other', label: 'Other', shortLabel: 'Other' },
];

type ServiceTabsProps = {
  value: DriverServiceType;
  onChange: (value: DriverServiceType) => void;
};

export default function ServiceTabs({ value, onChange }: ServiceTabsProps) {
  return (
    <div className="-mx-1 overflow-x-auto pb-1 scrollbar-thin">
      <div className="flex w-max min-w-full gap-2 px-1 sm:flex-wrap sm:w-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`shrink-0 snap-start rounded-full px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              value === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50'
            }`}
          >
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
