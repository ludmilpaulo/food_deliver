"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/utils/mixpanel';
import { useAppDispatch } from '@/redux/store';
import { hydrateBasket, loadBasketState } from '@/redux/slices/basketSlice';
import {
  getLanguage,
  LANGUAGE_CHANGE_EVENT,
  syncLanguageFromClientStorage,
} from '@/configs/i18n';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // Restore the cart saved in localStorage (after mount, to avoid SSR
  // hydration mismatches).
  useEffect(() => {
    const saved = loadBasketState();
    if (saved.items.length > 0) {
      dispatch(hydrateBasket(saved));
    }
  }, [dispatch]);

  useEffect(() => {
    const locale = syncLanguageFromClientStorage();
    document.documentElement.lang = locale;

    const onLanguageChanged = () => {
      document.documentElement.lang = getLanguage();
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChanged);
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, onLanguageChanged);
    };
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      analytics.trackPageView(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
