/** Optional module keys hidden from homepage (none by default). */
export const EXCLUDED_SUPERAPP_MODULE_KEYS = new Set<string>();

export function isSuperAppModuleEnabled(key: string | undefined): boolean {
  if (!key) return true;
  return !EXCLUDED_SUPERAPP_MODULE_KEYS.has(key.toLowerCase());
}
