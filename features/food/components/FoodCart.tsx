'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch } from '@/redux/store';
import { addItem, removeItem, removeLine } from '@/redux/slices/basketSlice';
import { resolveMediaUrl } from '@/lib/resolveMediaUrl';
import type { CartItem } from '@/services/types';
import { cartLineKey } from '../lib/cartLines';
import { formatMoney } from '../lib/money';
import type { QuoteLine, QuoteStore } from '../types';
import FoodImage from './FoodImage';

type Props = {
  storeName: string;
  items: CartItem[];
  linesByKey: Map<string, QuoteLine>;
  storeQuote?: QuoteStore;
  currency: string;
  editable?: boolean;
};

export default function FoodCart({ storeName, items, linesByKey, storeQuote, currency, editable = true }: Props) {
  const { t, languageCode } = useTranslation();
  const dispatch = useAppDispatch();
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{storeName}</h2>
      {storeQuote?.error ? (
        <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {storeQuote.error}
        </p>
      ) : null}
      {storeQuote?.coupon_error ? (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{storeQuote.coupon_error}</p>
      ) : null}
      <ul className="mt-4 divide-y divide-slate-100">
        {items.map((item) => {
          const key = cartLineKey(item);
          const priced = linesByKey.get(key);
          const lineTotal = priced ? priced.subtotal : item.price * item.quantity;
          return (
            <li key={key} className="flex gap-3 py-3">
              <FoodImage src={item.image ? resolveMediaUrl(item.image) : null} alt={item.name} className="h-16 w-16 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="shrink-0 font-semibold text-slate-900">{formatMoney(lineTotal, currency, languageCode)}</p>
                </div>
                {item.addon_names?.length ? (
                  <p className="text-xs text-slate-500">{item.addon_names.join(', ')}</p>
                ) : null}
                {item.special_instructions ? (
                  <p className="text-xs italic text-slate-500">“{item.special_instructions}”</p>
                ) : null}
                {priced ? (
                  <p className="text-xs text-slate-400">
                    {t('foodEach', '{price} each', { price: formatMoney(priced.unit_price, currency, languageCode) })}
                  </p>
                ) : null}
                {editable ? (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-slate-200">
                      <button
                        type="button"
                        aria-label={t('foodDecrease', 'Decrease quantity')}
                        onClick={() => dispatch(removeItem(item))}
                        className="p-1.5"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={t('foodIncrease', 'Increase quantity')}
                        onClick={() => dispatch(addItem({ ...item, quantity: 1 }))}
                        className="p-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(removeLine(item))}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      {t('foodRemove', 'Remove')}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">× {item.quantity}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
