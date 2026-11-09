import type { CartItem } from '@/services/types';
import type { QuoteLineInput } from '../types';

type LineIdentity = Pick<CartItem, 'id'> &
  Partial<Pick<CartItem, 'size' | 'color' | 'addon_ids' | 'special_instructions'>>;

/** Stable identity of a cart line: same product with different extras or notes is a separate line. */
export function cartLineKey(item: LineIdentity): string {
  const addons = [...(item.addon_ids ?? [])].sort((a, b) => a - b).join('.');
  const notes = (item.special_instructions ?? '').trim();
  return [item.id, item.size ?? '', item.color ?? '', addons, notes].join('|');
}

export function foodCartItems(items: CartItem[]): CartItem[] {
  return items.filter((item) => item.vertical === 'food');
}

export function toQuoteLines(items: CartItem[]): QuoteLineInput[] {
  return items.map((item) => ({
    key: cartLineKey(item),
    product_id: item.id,
    quantity: item.quantity,
    ...(item.addon_ids?.length ? { addons: item.addon_ids } : {}),
    ...(item.special_instructions ? { special_instructions: item.special_instructions } : {}),
  }));
}

export function groupByStore(items: CartItem[]): Map<number, CartItem[]> {
  const groups = new Map<number, CartItem[]>();
  for (const item of items) {
    const list = groups.get(item.store) ?? [];
    list.push(item);
    groups.set(item.store, list);
  }
  return groups;
}
