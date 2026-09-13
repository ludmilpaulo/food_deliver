'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import CategoryCard from './CategoryCard';
import { CategorySkeleton } from './GrocerySkeletons';
import { GroceryEmptyState } from './GroceryStates';
import type { GroceryCategory } from '../types';

export default function CategorySection({
  categories,
  loading,
}: {
  categories: GroceryCategory[];
  loading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#111827]">{t('shopByCategory', 'Shop by Category')}</h2>
        <Link href="/groceries?section=categories" className="text-sm font-semibold text-[#0B8F45] hover:text-[#056B34]">
          {t('viewAll', 'View All')}
        </Link>
      </div>
      {loading ? <CategorySkeleton /> : null}
      {!loading && categories.length === 0 ? (
        <GroceryEmptyState
          title={t('noProducts', 'No products found')}
          description={t('tryAnotherSearch', 'Try another search or category.')}
        />
      ) : null}
      {!loading && categories.length > 0 ? (
        <div className="grocery-category-row grocery-hide-scrollbar">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
