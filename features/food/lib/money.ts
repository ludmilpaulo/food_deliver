const LOCALE_TAGS: Record<string, string> = { en: 'en-ZA', pt: 'pt-PT', fr: 'fr-FR', es: 'es-ES' };

export function formatMoney(amount: number | string | null | undefined, currency = 'ZAR', locale = 'en'): string {
  const value = Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(LOCALE_TAGS[locale] ?? locale, {
      style: 'currency',
      currency: currency || 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `${currency} ${safe.toFixed(2)}`;
  }
}

/** Partner descriptions may be saved from a rich-text editor; render them as plain text. */
export function plainText(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Customer-facing price for a product card (sale discount applied, like the server's unit_price). */
export function displayUnitPrice(product: { price: number | string; on_sale?: boolean; discount_percentage?: number }): number {
  const base = Number(product.price) || 0;
  const discount = product.on_sale ? Number(product.discount_percentage) || 0 : 0;
  return Math.round(base * (1 - discount / 100) * 100) / 100;
}
