"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { analytics } from '@/utils/mixpanel';
import { useAppDispatch } from '@/redux/store';
import { hydrateBasket, loadBasketState } from '@/redux/slices/basketSlice';
import { logoutUser } from '@/redux/slices/authSlice';
import { AUTH_EXPIRED_EVENT, type AuthExpiredDetail } from '@/services/api';
import {
  getLanguage,
  LANGUAGE_CHANGE_EVENT,
  syncLanguageFromClientStorage,
} from '@/configs/i18n';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Restore the cart saved in localStorage (after mount, to avoid SSR
  // hydration mismatches).
  useEffect(() => {
    // Always dispatch so pages can tell "cart restored and empty" apart from "not restored yet".
    dispatch(hydrateBasket(loadBasketState()));
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
    const onAuthExpired = (event: Event) => {
      dispatch(logoutUser());
      const detail = (event as CustomEvent<AuthExpiredDetail>).detail;
      if (detail?.requiresLogin) {
        router.replace('/LoginScreenUser');
      }
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    };
  }, [dispatch, router]);

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      analytics.trackPageView(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
