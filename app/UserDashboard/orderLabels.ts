const ORDER_STATUS_KEYS: Record<string, string> = {
  Entregue: "orderStatusDelivered",
  PROCESSANDO: "orderStatusProcessing",
  Processando: "orderStatusProcessing",
  delivered: "orderStatusDelivered",
  processing: "orderStatusProcessing",
};

export function translateOrderStatus(
  status: string,
  t: (key: string, fallback?: string) => string,
): string {
  const key = ORDER_STATUS_KEYS[status];
  return key ? t(key) : status;
}

export function localeForLanguage(code: string): string {
  const map: Record<string, string> = {
    en: "en-US",
    pt: "pt-AO",
    fr: "fr-FR",
    es: "es-ES",
  };
  return map[code] ?? "en-US";
}
