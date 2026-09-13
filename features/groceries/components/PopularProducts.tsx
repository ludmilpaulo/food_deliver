'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import GroceryProductCard from './GroceryProductCard';
import { ProductGridSkeleton } from './GrocerySkeletons';
import { GroceryEmptyState } from './GroceryStates';
import type { GroceryCategory, GroceryProduct } from '../types';

const PREFERRED_FILTERS = [
  { slug: 'all', label: 'All' },
  { slug: 'fresh-produce', label: 'Fruits & Vegetables' },
  { slug: 'dairy-eggs', label: 'Dairy' },
  { slug: 'beverages', label: 'Beverages' },
] as const;

export default function PopularProducts({
  products,
  categories,
  loading,
}: {
  products: GroceryProduct[];
  categories: GroceryCategory[];
  loading: boolean;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const filters = useMemo(() => {
    const available = new Set(categories.map((category) => category.slug));
    const preferred = PREFERRED_FILTERS.filter((item) => item.slug === 'all' || available.has(item.slug));
    if (preferred.length > 1) return preferred;
    return [
      { slug: 'all', label: t('all', 'All') },
      ...categories.slice(0, 3).map((category) => ({ slug: category.slug, label: category.name })),
    ];
  }, [categories, t]);
  const visible = useMemo(() => {
    if (filter === 'all') return products;
    return products.filter((product) => product.category?.slug === filter);
  }, [filter, products]);

  return (
    <section id="popular">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#111827]">{t('popularProducts', 'Popular Products')}</h2>
        <Link href="/groceries?section=popular" className="text-sm font-semibold text-[#0B8F45] hover:text-[#056B34]">
          {t('viewAll', 'View All')}
        </Link>
      </div>
      <div className="mb-4 hidden gap-2 md:flex">
        {filters.map((item) => {
          const selected = filter === item.slug;
          const label = item.slug === 'all' ? 'All' : item.label;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => setFilter(item.slug)}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold ${
                selected ? 'bg-[#0B8F45] text-white' : 'bg-white text-[#111827] ring-1 ring-[#E5E7EB]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {loading ? <ProductGridSkeleton /> : null}
      {!loading && visible.length === 0 ? (
        <GroceryEmptyState
          title={t('noProducts', 'No products found')}
          description={t('tryAnotherSearch', 'Try another search or category.')}
        />
      ) : null}
      {!loading && visible.length > 0 ? (
        <div className="grocery-product-grid">
          {visible.map((product) => (
            <GroceryProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
