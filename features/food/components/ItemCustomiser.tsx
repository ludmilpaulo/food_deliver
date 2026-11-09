'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { resolveProductImageUrl } from '@/lib/resolveMediaUrl';
import { addonExtra, groupMinimum, toggleAddon, validateAddonSelection } from '../lib/addonSelection';
import { displayUnitPrice, formatMoney, plainText } from '../lib/money';
import type { FoodProduct } from '../types';
import FoodImage from './FoodImage';

export type CustomisedItem = {
  quantity: number;
  addon_ids: number[];
  addon_names: string[];
  special_instructions: string;
  unit_price: number;
};

type Props = {
  product: FoodProduct;
  currency: string;
  onClose: () => void;
  onAdd: (item: CustomisedItem) => void;
};

const MAX_INSTRUCTIONS = 300;
const MAX_QUANTITY = 50;

export default function ItemCustomiser({ product, currency, onClose, onAdd }: Props) {
  const { t, languageCode } = useTranslation();
  const [selected, setSelected] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [attempted, setAttempted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const groups = product.addon_groups;
  const validation = useMemo(() => validateAddonSelection(groups, selected), [groups, selected]);
  const unitPrice = displayUnitPrice(product) + addonExtra(groups, selected);
  const image = product.image_url?.length ? resolveProductImageUrl(product.image_url) : null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const submit = () => {
    setAttempted(true);
    if (!validation.valid) return;
    const names = groups.flatMap((group) => group.addons).filter((addon) => selected.includes(addon.id));
    onAdd({
      quantity,
      addon_ids: [...selected].sort((a, b) => a - b),
      addon_names: names.map((addon) => addon.name),
      special_instructions: instructions.trim(),
      unit_price: Math.round(unitPrice * 100) / 100,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-item-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
      >
        <div className="relative h-48 shrink-0">
          <FoodImage src={image} alt={product.name} className="h-full w-full" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('foodClose', 'Close')}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-700 shadow hover:bg-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div>
            <h2 id="food-item-title" className="text-xl font-bold text-slate-900">
              {product.name}
            </h2>
            {plainText(product.description) ? (
              <p className="mt-1 text-sm text-slate-600">{plainText(product.description)}</p>
            ) : null}
            <p className="mt-2 font-semibold text-slate-900">{formatMoney(displayUnitPrice(product), currency, languageCode)}</p>
          </div>

          {groups.map((group) => {
            const error = attempted ? validation.errors[group.id] : undefined;
            const minimum = groupMinimum(group);
            return (
              <fieldset key={group.id} className="space-y-2">
                <legend className="flex w-full items-center justify-between">
                  <span className="font-semibold text-slate-900">{group.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      minimum > 0 ? 'bg-food-soft text-orange-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {minimum > 0 ? t('foodRequired', 'Required') : t('foodOptional', 'Optional')}
                    {group.max_select ? ` · ${t('foodUpTo', 'up to {count}', { count: group.max_select })}` : ''}
                  </span>
                </legend>
                {group.addons.map((addon) => {
                  const checked = selected.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                        checked ? 'border-kudya bg-violet-50' : 'border-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type={group.max_select === 1 ? 'radio' : 'checkbox'}
                          name={`group-${group.id}`}
                          checked={checked}
                          onChange={() => setSelected((current) => toggleAddon(group, current, addon.id))}
                          className="accent-[rgb(var(--brand-primary))]"
                        />
                        {addon.name}
                      </span>
                      {Number(addon.price) > 0 ? (
                        <span className="text-slate-600">+{formatMoney(addon.price, currency, languageCode)}</span>
                      ) : null}
                    </label>
                  );
                })}
                {error ? (
                  <p className="text-sm text-red-600" role="alert">
                    {error.key === 'foodChooseAtLeast'
                      ? t('foodChooseAtLeast', 'Choose at least {count} option(s).', { count: error.count })
                      : t('foodChooseUpTo', 'Choose up to {count} option(s).', { count: error.count })}
                  </p>
                ) : null}
              </fieldset>
            );
          })}

          <label className="block space-y-1">
            <span className="font-semibold text-slate-900">{t('foodSpecialInstructions', 'Special instructions')}</span>
            <textarea
              value={instructions}
              maxLength={MAX_INSTRUCTIONS}
              onChange={(event) => setInstructions(event.target.value)}
              rows={2}
              placeholder={t('foodInstructionsPlaceholder', 'E.g. no onions, extra sauce')}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <span className="block text-right text-xs text-slate-400">
              {instructions.length}/{MAX_INSTRUCTIONS}
            </span>
          </label>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
          <div className="flex items-center rounded-full border border-slate-200">
            <button
              type="button"
              aria-label={t('foodDecrease', 'Decrease quantity')}
              disabled={quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="p-2 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <span className="w-8 text-center font-semibold" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label={t('foodIncrease', 'Increase quantity')}
              disabled={quantity >= MAX_QUANTITY}
              onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
              className="p-2 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={submit}
            className="flex flex-1 items-center justify-between rounded-full bg-kudya px-5 py-3 font-semibold text-white shadow hover:bg-kudya-secondary"
          >
            <span>{t('foodAddToCart', 'Add to cart')}</span>
            <span>{formatMoney(unitPrice * quantity, currency, languageCode)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
