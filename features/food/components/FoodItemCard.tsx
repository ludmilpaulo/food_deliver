'use client';

import { Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { resolveProductImageUrl } from '@/lib/resolveMediaUrl';
import { displayUnitPrice, formatMoney, plainText } from '../lib/money';
import type { FoodProduct } from '../types';
import FoodImage from './FoodImage';

type Props = {
  product: FoodProduct;
  currency: string;
  disabled?: boolean;
  onSelect: (product: FoodProduct) => void;
};

export default function FoodItemCard({ product, currency, disabled = false, onSelect }: Props) {
  const { t, languageCode } = useTranslation();
  const unavailable = !product.is_purchasable;
  const price = displayUnitPrice(product);
  const hasDiscount = product.on_sale && product.discount_percentage > 0;
  const image = product.image_url?.length ? resolveProductImageUrl(product.image_url) : null;
  const description = plainText(product.description);
  return (
    <button
      type="button"
      disabled={disabled || unavailable}
      onClick={() => onSelect(product)}
      className="flex w-full gap-4 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:border-food/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-slate-900">{product.name}</h4>
        {description ? <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p> : null}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-slate-900">{formatMoney(price, currency, languageCode)}</span>
          {hasDiscount ? (
            <span className="text-xs text-slate-400 line-through">{formatMoney(product.price, currency, languageCode)}</span>
          ) : null}
          {unavailable ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {t('foodSoldOut', 'Sold out')}
            </span>
          ) : null}
          {product.addon_groups.length ? (
            <span className="text-xs text-slate-400">{t('foodCustomisable', 'Customisable')}</span>
          ) : null}
        </div>
      </div>
      <div className="relative h-24 w-24 shrink-0">
        <FoodImage src={image} alt={product.name} className="h-full w-full rounded-xl" />
        {!unavailable && !disabled ? (
          <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-food text-white shadow">
            <Plus className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>
    </button>
  );
}
