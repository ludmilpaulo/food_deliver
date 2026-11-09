import type { FoodStoreFilters } from '../types';

const ORDERINGS = new Set(['rating', '-rating', 'delivery_time', 'price_level', 'name', '-created', 'distance']);
const NUMBER_KEYS = [
  'category',
  'min_rating',
  'max_delivery_min',
  'max_delivery_fee',
  'max_min_order',
  'lat',
  'lng',
  'radius_km',
] as const;
const BOOLEAN_KEYS = ['open_now', 'has_promotion', 'pickup'] as const;
const STRING_KEYS = ['search', 'cuisine', 'country', 'city'] as const;

type ParamReader = { get(name: string): string | null };

function parseNumber(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

/** Read filters from the page URL (unknown or malformed values are dropped). */
export function filtersFromParams(params: ParamReader): FoodStoreFilters {
  const filters: FoodStoreFilters = {};
  for (const key of STRING_KEYS) {
    const value = params.get(key)?.trim();
    if (value) filters[key] = value;
  }
  for (const key of NUMBER_KEYS) {
    const value = parseNumber(params.get(key));
    if (value !== undefined) filters[key] = value;
  }
  for (const key of BOOLEAN_KEYS) {
    const value = params.get(key);
    if (value === 'true') filters[key] = true;
    if (value === 'false') filters[key] = false;
  }
  const levels = (params.get('price_level') ?? '')
    .split(',')
    .map((part) => Number(part))
    .filter((level) => level === 1 || level === 2 || level === 3);
  if (levels.length) filters.price_level = Array.from(new Set(levels)).sort();
  const ordering = params.get('ordering');
  if (ordering && ORDERINGS.has(ordering)) filters.ordering = ordering as FoodStoreFilters['ordering'];
  if (filters.ordering === 'distance' && (filters.lat === undefined || filters.lng === undefined)) {
    delete filters.ordering;
  }
  if (filters.radius_km !== undefined && (filters.lat === undefined || filters.lng === undefined)) {
    delete filters.radius_km;
  }
  return filters;
}

/** Serialise filters for both the page URL and the Django storefront API. */
export function filtersToParams(filters: FoodStoreFilters): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) params[key] = value.join(',');
      continue;
    }
    params[key] = String(value);
  }
  return params;
}

export function activeFilterCount(filters: FoodStoreFilters): number {
  const ignored = new Set(['search', 'ordering', 'lat', 'lng']);
  return Object.entries(filters).filter(([key, value]) => {
    if (ignored.has(key) || value === undefined || value === '') return false;
    return !Array.isArray(value) || value.length > 0;
  }).length;
}
