'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { fetchStoreTypes } from '@/redux/slices/storeTypeSlice';
import { useTranslation } from '@/hooks/useTranslation';
import LocationFilterBar from '@/components/location/LocationFilterBar';

type ModuleKind = 'food' | 'groceries';

const MATCHERS: Record<ModuleKind, string[]> = {
  food: ['restaurant', 'food', 'meal'],
  groceries: ['grocery', 'groceries', 'supermarket', 'market'],
};

export default function ModuleStoreLanding({ module }: { module: ModuleKind }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const storeTypes = useAppSelector((state) => state.storeTypes.data);
  const loading = useAppSelector((state) => state.storeTypes.loading);

  useEffect(() => {
    dispatch(fetchStoreTypes());
  }, [dispatch]);

  useEffect(() => {
    if (!storeTypes.length) return;
    const matchers = MATCHERS[module];
    const match = storeTypes.find((type) =>
      matchers.some((needle) => (type.name ?? '').toLowerCase().includes(needle)),
    );
    if (match?.id) {
      router.replace(`/stores?storeTypeId=${match.id}`);
      return;
    }
    router.replace('/StoreTypes');
  }, [module, router, storeTypes]);

  const title = module === 'food' ? t('food', 'Food') : t('groceries', 'Groceries');

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <LocationFilterBar className="mb-6" />
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">
        {loading
          ? t('loading', 'Loading...')
          : t('findingStoresNearYou', 'Finding stores near you...')}
      </p>
    </div>
  );
}
