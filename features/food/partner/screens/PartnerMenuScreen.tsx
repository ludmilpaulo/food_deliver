'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { resolveProductImageUrl } from '@/lib/resolveMediaUrl';
import { foodErrorMessage } from '../../api/foodApi';
import FoodImage from '../../components/FoodImage';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel } from '../../components/WorkspaceShell';
import { plainText } from '../../lib/money';
import {
  useArchivePartnerProductMutation,
  useCreateAddonGroupMutation,
  useCreateAddonMutation,
  useCreatePartnerProductMutation,
  useDeleteAddonGroupMutation,
  useDeleteAddonMutation,
  useGetPartnerProductsQuery,
  useGetProductCategoriesQuery,
  useUpdateAddonMutation,
  useUpdatePartnerProductMutation,
} from '../partnerApi';
import type { PartnerProduct } from '../types';

function NewProductForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const categories = useGetProductCategoriesQuery();
  const [create, { isLoading }] = useCreatePartnerProductMutation();
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    if (!String(form.get('name') || '').trim() || !form.get('price') || !form.get('category_id')) {
      setError(t('fpProductRequired', 'Name, price and category are required.'));
      return;
    }
    const image = form.get('image');
    if (image instanceof File && image.size === 0) form.delete('image');
    try {
      await create(form).unwrap();
      onDone();
    } catch (err) {
      setError(foodErrorMessage(err, t('fpProductSaveFailed', 'The product could not be saved.')));
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:grid-cols-2">
      <label className="space-y-1 text-sm">
        <span className="font-medium">{t('fpProductName', 'Name')}</span>
        <input name="name" maxLength={255} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-medium">{t('fpPrice', 'Price')}</span>
        <input name="price" type="number" min="0" step="0.01" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-medium">{t('fpCategory', 'Category')}</span>
        <select name="category_id" className="w-full rounded-xl border border-slate-200 px-3 py-2" defaultValue="">
          <option value="" disabled>
            {categories.isLoading ? t('foodLoading', 'Loading…') : t('fpChooseCategory', 'Choose a category')}
          </option>
          {(categories.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-medium">{t('fpStock', 'Portions in stock')}</span>
        <input name="stock" type="number" min="0" defaultValue={50} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm md:col-span-2">
        <span className="font-medium">{t('fpDescription', 'Description')}</span>
        <textarea name="description" rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-medium">{t('fpPhoto', 'Photo')}</span>
        <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="block w-full text-sm" />
      </label>
      <div className="flex items-end gap-2">
        <button type="submit" disabled={isLoading} className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {t('fpSaveProduct', 'Save product')}
        </button>
        <button type="button" onClick={onDone} className="rounded-full px-4 py-2 text-sm text-slate-600">
          {t('fpCancel', 'Cancel')}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
    </form>
  );
}

function AddonEditor({ product }: { product: PartnerProduct }) {
  const { t } = useTranslation();
  const [createGroup] = useCreateAddonGroupMutation();
  const [deleteGroup] = useDeleteAddonGroupMutation();
  const [createAddon] = useCreateAddonMutation();
  const [updateAddon] = useUpdateAddonMutation();
  const [deleteAddon] = useDeleteAddonMutation();
  const [error, setError] = useState<string | null>(null);

  const run = async (work: () => Promise<unknown>) => {
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(foodErrorMessage(err, t('fpAddonSaveFailed', 'The option could not be saved.')));
    }
  };

  const addGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    if (!name) return;
    const required = form.get('required') === 'on';
    const max = Number(form.get('max_select') || 1);
    event.currentTarget.reset();
    void run(() =>
      createGroup({ product: product.id, name, required, min_select: required ? 1 : 0, max_select: max }).unwrap(),
    );
  };

  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-3">
      {product.addon_groups.map((group) => (
        <div key={group.id} className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {group.name}{' '}
              <span className="font-normal text-slate-500">
                {group.required ? t('foodRequired', 'Required') : t('foodOptional', 'Optional')} · {t('foodUpTo', 'up to {count}', { count: group.max_select })}
              </span>
            </p>
            <button type="button" onClick={() => void run(() => deleteGroup(group.id).unwrap())} aria-label={t('fpDelete', 'Delete')} className="text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {group.addons.map((addon) => (
              <li key={addon.id} className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addon.is_active}
                    onChange={() => void run(() => updateAddon({ id: addon.id, is_active: !addon.is_active }).unwrap())}
                  />
                  <span className={addon.is_active ? '' : 'text-slate-400 line-through'}>{addon.name}</span>
                </label>
                <span className="flex items-center gap-2 text-slate-600">
                  +{addon.price}
                  <button type="button" onClick={() => void run(() => deleteAddon(addon.id).unwrap())} aria-label={t('fpDelete', 'Delete')} className="text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const name = String(form.get('name') || '').trim();
              if (!name) return;
              const price = String(form.get('price') || '0');
              event.currentTarget.reset();
              void run(() => createAddon({ group: group.id, name, price }).unwrap());
            }}
            className="mt-2 flex gap-2"
          >
            <input name="name" placeholder={t('fpOptionName', 'Option name')} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm" />
            <input name="price" type="number" min="0" step="0.01" placeholder="0.00" className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm" />
            <button type="submit" className="rounded-lg bg-slate-900 px-3 text-sm text-white" aria-label={t('fpAddOption', 'Add option')}>
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>
      ))}
      <form onSubmit={addGroup} className="flex flex-wrap items-center gap-2 text-sm">
        <input name="name" placeholder={t('fpGroupName', 'New option group (e.g. Size, Extras)')} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1" />
        <label className="flex items-center gap-1">
          <input type="checkbox" name="required" /> {t('foodRequired', 'Required')}
        </label>
        <label className="flex items-center gap-1">
          {t('fpMaxChoices', 'Max')}
          <input name="max_select" type="number" min="1" max="20" defaultValue={1} className="w-14 rounded-lg border border-slate-200 px-2 py-1" />
        </label>
        <button type="submit" className="rounded-full bg-kudya px-3 py-1 font-semibold text-white">
          {t('fpAddGroup', 'Add group')}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function ProductRow({ product }: { product: PartnerProduct }) {
  const { t } = useTranslation();
  const [update, { isLoading }] = useUpdatePartnerProductMutation();
  const [archive] = useArchivePartnerProductMutation();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(product.base_price));
  const [stock, setStock] = useState(String(Number(product.available_quantity ?? product.stock)));
  const [error, setError] = useState<string | null>(null);

  const save = async (data: Record<string, string | boolean>) => {
    setError(null);
    try {
      await update({ id: product.id, data }).unwrap();
    } catch (err) {
      setError(foodErrorMessage(err, t('fpProductSaveFailed', 'The product could not be saved.')));
    }
  };

  return (
    <li className="space-y-3 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <FoodImage src={product.image_url?.length ? resolveProductImageUrl(product.image_url) : null} alt={product.name} className="h-14 w-14 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${product.is_active ? 'text-slate-900' : 'text-slate-400'}`}>{product.name}</p>
          <p className="truncate text-xs text-slate-500">{plainText(product.description)}</p>
        </div>
        <label className="text-xs text-slate-500">
          {t('fpPrice', 'Price')}
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            onBlur={() => price !== String(product.base_price) && void save({ price })}
            type="number"
            min="0"
            step="0.01"
            className="ml-1 w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-900"
          />
        </label>
        <label className="text-xs text-slate-500">
          {t('fpStockShort', 'Stock')}
          <input
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            onBlur={() => void save({ stock })}
            type="number"
            min="0"
            className="ml-1 w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-900"
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-slate-600">
          <input type="checkbox" checked={product.is_active} disabled={isLoading} onChange={() => void save({ is_active: !product.is_active })} />
          {t('fpAvailable', 'Available')}
        </label>
        <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-1 text-xs font-semibold text-kudya">
          {t('fpOptions', 'Options')} ({product.addon_groups.length}) {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t('fpArchiveConfirm', 'Remove this product from the menu? Past orders keep their details.'))) {
              void archive(product.id);
            }
          }}
          aria-label={t('fpArchive', 'Archive')}
          className="text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {open ? <AddonEditor product={product} /> : null}
    </li>
  );
}

export default function PartnerMenuScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'active' | 'archived' | undefined>(undefined);
  const products = useGetPartnerProductsQuery(filter ? { status: filter } : undefined);
  const [adding, setAdding] = useState(false);

  const sections = useMemo(() => {
    const map = new Map<string, PartnerProduct[]>();
    for (const product of products.data ?? []) {
      const key = product.category || t('foodMenuOther', 'More dishes');
      map.set(key, [...(map.get(key) ?? []), product]);
    }
    return Array.from(map.entries());
  }, [products.data, t]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t('fpMenu', 'Menu')}</h1>
        <div className="flex gap-2">
          <select
            value={filter ?? ''}
            onChange={(event) => setFilter((event.target.value || undefined) as 'active' | 'archived' | undefined)}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm"
            aria-label={t('fpFilter', 'Filter')}
          >
            <option value="">{t('fpAllProducts', 'All products')}</option>
            <option value="active">{t('fpActiveProducts', 'Available')}</option>
            <option value="archived">{t('fpArchivedProducts', 'Unavailable / archived')}</option>
          </select>
          <button type="button" onClick={() => setAdding(true)} className="rounded-full bg-kudya px-4 py-2 text-sm font-semibold text-white">
            {t('fpAddProduct', 'Add product')}
          </button>
        </div>
      </div>
      {adding ? <NewProductForm onDone={() => setAdding(false)} /> : null}
      {products.isLoading ? (
        <FoodSkeletonGrid count={4} variant="row" />
      ) : products.isError ? (
        <FoodError onRetry={products.refetch} />
      ) : sections.length === 0 ? (
        <FoodEmpty title={t('fpMenuEmpty', 'Your menu is empty')} message={t('fpMenuEmptyHint', 'Add your first dish to start selling.')} />
      ) : (
        sections.map(([category, items]) => (
          <Panel key={category} title={category}>
            <ul className="divide-y divide-slate-100">
              {items.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </ul>
          </Panel>
        ))
      )}
    </div>
  );
}
