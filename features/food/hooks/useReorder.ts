'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { addItem, clearCart, selectCartItems } from '@/redux/slices/basketSlice';
import { foodErrorMessage, useReorderMutation } from '../api/foodApi';
import { foodCartItems } from '../lib/cartLines';
import type { ReorderResponse } from '../types';

/** Re-adds still-available lines (current prices) to the food cart and opens it. */
export function useReorder() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = foodCartItems(useAppSelector(selectCartItems));
  const [reorder, { isLoading }] = useReorderMutation();
  const [result, setResult] = useState<ReorderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (orderId: number, fallbackError: string) => {
    setError(null);
    try {
      const data = await reorder(orderId).unwrap();
      setResult(data);
      if (!data.lines.length) return data;
      const storeIds = new Set(data.lines.map((line) => line.store));
      for (const id of new Set(cart.map((item) => item.store))) {
        if (!storeIds.has(id)) dispatch(clearCart(id));
      }
      for (const line of data.lines) {
        const addonTotal = line.addons.reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);
        dispatch(
          addItem({
            id: line.product_id,
            name: line.name,
            price: Math.round((Number(line.price) + addonTotal) * 100) / 100,
            image: line.image ?? undefined,
            size: '',
            color: '',
            store: line.store,
            store_name: line.store_name,
            selling_unit: line.selling_unit,
            vertical: 'food',
            addon_ids: line.addons.map((addon) => addon.id),
            addon_names: line.addons.map((addon) => addon.name),
            special_instructions: line.special_instructions,
            quantity: line.quantity,
          }),
        );
      }
      if (!data.unavailable.length) router.push('/food/cart');
      return data;
    } catch (err) {
      setError(foodErrorMessage(err, fallbackError));
      return null;
    }
  };

  return { run, isLoading, result, error };
}
