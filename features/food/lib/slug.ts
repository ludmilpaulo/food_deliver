export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function restaurantSlug(store: { id: number; name: string }): string {
  const name = slugify(store.name);
  return name ? `${store.id}-${name}` : String(store.id);
}

export function restaurantHref(store: { id: number; name: string }): string {
  return `/food/restaurants/${restaurantSlug(store)}`;
}

/** The numeric id is the source of truth; the name part is decorative and may be stale. */
export function parseRestaurantSlug(slug: string | undefined | null): number | null {
  const match = /^(\d+)(?:-|$)/.exec(String(slug ?? ''));
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
