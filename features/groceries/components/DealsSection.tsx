'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import GroceryProductCard from './GroceryProductCard';
import { GroceryEmptyState } from './GroceryStates';
import { ProductGridSkeleton } from './GrocerySkeletons';
import type { GroceryProduct } from '../types';

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, '0');
}

export default function DealsSection({
  products,
  endsAt,
  title,
  loading = false,
}: {
  products: GroceryProduct[];
  endsAt: string | null;
  title: string;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const endTime = endsAt ? new Date(endsAt).getTime() : 0;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endTime) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [endTime]);

  const countdown = useMemo(() => {
    if (!endTime) return null;
    const diff = Math.max(0, endTime - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d : ${pad(hours)}h : ${pad(minutes)}m`;
  }, [endTime, now]);

  return (
    <section id="deals">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">{title || t('dealsOfTheWeek', 'Deals of the Week')}</h2>
          {countdown ? (
            <p className="mt-1 text-sm font-medium text-[#0B8F45]">
              {t('endsIn', 'Ends in')} {countdown}
            </p>
          ) : null}
        </div>
        <Link href="/groceries?section=deals" className="text-sm font-semibold text-[#0B8F45] hover:text-[#056B34]">
          {t('viewAll', 'View All')}
        </Link>
      </div>
      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <GroceryEmptyState
          title={t('noDeals', 'No deals available right now.')}
          description={t('checkBackSoon', 'Check back soon for weekly offers.')}
        />
      ) : (
        <div className="grocery-deals-row grocery-hide-scrollbar">
          {products.map((product) => (
            <div key={product.id} className="w-44 shrink-0 md:w-52">
              <GroceryProductCard product={product} compact />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
