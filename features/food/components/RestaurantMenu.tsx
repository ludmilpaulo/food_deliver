'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { plainText } from '../lib/money';
import type { FoodProduct } from '../types';
import FoodItemCard from './FoodItemCard';
import { FoodEmpty } from './FoodStates';

type Props = {
  products: FoodProduct[];
  currency: string;
  ordering: boolean;
  onSelect: (product: FoodProduct) => void;
};

export default function RestaurantMenu({ products, currency, ordering, onSelect }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const other = t('foodMenuOther', 'More dishes');

  const sections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const visible = needle
      ? products.filter(
          (product) =>
            product.name.toLowerCase().includes(needle) || plainText(product.description).toLowerCase().includes(needle),
        )
      : products;
    const map = new Map<string, FoodProduct[]>();
    for (const product of visible) {
      const name = product.category || other;
      map.set(name, [...(map.get(name) ?? []), product]);
    }
    return Array.from(map.entries());
  }, [products, query, other]);

  const shown = active ? sections.filter(([name]) => name === active) : sections;

  return (
    <div className="space-y-5">
      <div className="sticky top-16 z-10 -mx-4 space-y-3 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
          <Search className="h-4 w-4 text-slate-400" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('foodSearchMenu', 'Search the menu')}
            className="w-full bg-transparent text-sm outline-none"
            aria-label={t('foodSearchMenu', 'Search the menu')}
          />
        </label>
        {sections.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={active === null}
              onClick={() => setActive(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                active === null ? 'bg-kudya text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
              }`}
            >
              {t('foodMenuAll', 'All')}
            </button>
            {sections.map(([name, items]) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={active === name}
                onClick={() => setActive(name)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                  active === name ? 'bg-kudya text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'
                }`}
              >
                {name} <span className="opacity-70">({items.length})</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <FoodEmpty
          title={query ? t('foodNoDishesMatch', 'No dishes match your search') : t('foodMenuEmpty', 'This menu is empty')}
        />
      ) : (
        shown.map(([name, items]) => (
          <section key={name} aria-labelledby={`menu-${name}`}>
            <h3 id={`menu-${name}`} className="mb-3 text-lg font-bold text-slate-900">
              {name}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((product) => (
                <FoodItemCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  disabled={!ordering}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
