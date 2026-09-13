'use client';

import { FiSearch, FiSliders } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';

export default function GrocerySearch({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <label className="relative block">
      <span className="sr-only">{t('search', 'Search')}</span>
      <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('searchGroceryPlaceholder', 'Search for products, brands...')}
        className={`w-full rounded-full border border-[#E5E7EB] bg-[#F8FAF9] pl-11 pr-12 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#0B8F45] focus:bg-white ${
          compact ? 'h-11' : 'h-12'
        }`}
      />
      <span className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#0B8F45]" aria-hidden>
        <FiSliders />
      </span>
    </label>
  );
}
