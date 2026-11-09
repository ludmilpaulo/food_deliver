'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CartItem } from '@/services/types';
import { foodErrorMessage, useQuoteFoodCartMutation } from '../api/foodApi';
import { toQuoteLines } from '../lib/cartLines';
import type { CartQuote, FulfilmentType, QuoteLine } from '../types';

const DEBOUNCE_MS = 350;

/** Server-priced totals for the food cart; re-quotes whenever lines, coupon or fulfilment change. */
export function useFoodCartQuote(items: CartItem[], options: { couponCode?: string; fulfilment?: FulfilmentType } = {}) {
  const [quoteCart] = useQuoteFoodCartMutation();
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const requestId = useRef(0);

  const lines = useMemo(() => toQuoteLines(items), [items]);
  const signature = JSON.stringify([lines, options.couponCode ?? '', options.fulfilment ?? 'delivery']);

  useEffect(() => {
    if (!lines.length) {
      setQuote(null);
      setError(null);
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    const timer = window.setTimeout(() => {
      quoteCart({
        lines,
        ...(options.couponCode ? { coupon_code: options.couponCode } : {}),
        fulfilment_type: options.fulfilment ?? 'delivery',
      })
        .unwrap()
        .then((data) => {
          if (id !== requestId.current) return;
          setQuote(data);
          setError(null);
        })
        .catch((err: unknown) => {
          if (id !== requestId.current) return;
          setError(foodErrorMessage(err, 'quote_failed'));
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // signature captures lines/coupon/fulfilment by value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, version, quoteCart]);

  const linesByKey = useMemo(() => {
    const map = new Map<string, QuoteLine>();
    for (const line of quote?.lines ?? []) map.set(line.key, line);
    return map;
  }, [quote]);

  const refresh = useCallback(() => setVersion((value) => value + 1), []);

  return { quote, linesByKey, loading, error, refresh };
}
