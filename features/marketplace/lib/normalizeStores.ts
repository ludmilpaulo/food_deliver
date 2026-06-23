import { Store } from '@/services/types';

type RawStore = Record<string, unknown>;

/** Normalize v1 food/groceries store payloads into the web Store shape. */
export function normalizeV1Stores(data: unknown): Store[] {
  const rows = Array.isArray(data)
    ? data
    : (data as { results?: RawStore[] })?.results ?? [];

  return rows.map((raw) => ({
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    phone: String(raw.phone ?? ''),
    address: String(raw.address ?? ''),
    logo: typeof raw.logo === 'string' ? raw.logo : null,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : null,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : null,
    banner: Boolean(raw.banner ?? raw.barnner),
    barnner: Boolean(raw.barnner ?? raw.banner),
    is_approved: Boolean(raw.is_approved ?? true),
    store_type: typeof raw.store_type === 'number' ? raw.store_type : null,
    category:
      raw.category && typeof raw.category === 'object'
        ? (raw.category as Store['category'])
        : null,
    opening_hours: Array.isArray(raw.opening_hours)
      ? (raw.opening_hours as Store['opening_hours'])
      : [],
  }));
}

export type MarketplaceVertical = 'food' | 'groceries';

export function verticalApiPath(vertical: MarketplaceVertical): string {
  return vertical === 'food' ? '/api/v1/food/stores/' : '/api/v1/groceries/stores/';
}
