'use client';

import Link from 'next/link';
import { ChevronLeft, ReceiptText, ShoppingCart } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/redux/store';
import { selectCartItems } from '@/redux/slices/basketSlice';
import { foodCartItems } from '../lib/cartLines';

export default function FoodHeader({ backHref = '/HomeScreen', title }: { backHref?: string; title?: string }) {
  const { t } = useTranslation();
  const items = useAppSelector(selectCartItems);
  const count = foodCartItems(items).reduce((sum, item) => sum + item.quantity, 0);
  return (
    <header className="relative z-20 border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{t('foodBack', 'Back')}</span>
        </Link>
        <Link href="/food" className="flex items-center gap-2">
          <span className="rounded-lg bg-kudya px-2 py-1 text-sm font-bold text-white">Kudya</span>
          <span className="rounded-lg bg-food px-2 py-1 text-sm font-semibold text-white">{t('foodBrand', 'Food')}</span>
        </Link>
        {title ? <h1 className="ml-2 hidden truncate text-base font-semibold text-slate-900 md:block">{title}</h1> : null}
        <nav className="ml-auto flex items-center gap-1">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <ReceiptText className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('foodMyOrders', 'My orders')}</span>
          </Link>
          <Link
            href="/food/cart"
            className="relative inline-flex items-center gap-1 rounded-full bg-kudya px-3 py-2 text-sm font-semibold text-white hover:bg-kudya-secondary"
            aria-label={t('foodCartWithCount', 'Cart ({count})', { count })}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t('foodCart', 'Cart')}</span>
            {count > 0 ? (
              <span className="ml-1 rounded-full bg-food px-1.5 text-xs font-bold">{count}</span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
