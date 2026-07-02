"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import api from "@/services/api";
import { readAuthToken } from "@/lib/authToken";
import {
  logoutUser,
  selectAuthHydrated,
  syncAuthProfile,
} from "@/redux/slices/authSlice";
import { isPlatformAdminUser } from "@/utils/postLoginRoute";
import { useTranslation } from "@/hooks/useTranslation";
import type { AppDispatch } from "@/redux/store";
import { adminDriversOperationsApi } from "@/redux/slices/adminDriversOperationsApi";
import { adminVehicleApi } from "@/redux/slices/adminVehicleApi";
import { AdminSessionProvider } from "@/contexts/AdminSessionContext";

function isAdminUser(user: {
  role?: string;
  is_platform_admin?: boolean;
} | null): boolean {
  if (!user) return false;
  return isPlatformAdminUser({
    role: user.role,
    is_platform_admin: user.is_platform_admin,
  });
}

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const authHydrated = useSelector(selectAuthHydrated);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;

    let cancelled = false;
    const loginNext = encodeURIComponent(pathname || "/AdminDashboard");

    async function verify() {
      const token = readAuthToken();
      if (!token) {
        if (!cancelled) {
          setAllowed(false);
          setReady(true);
          router.replace(`/LoginScreenUser?next=${loginNext}`);
        }
        return;
      }

      try {
        const { data } = await api.get<{
          id?: number;
          user_id?: number;
          username?: string;
          role?: string;
          is_platform_admin?: boolean;
        }>("/api/auth/me/");

        if (cancelled) return;

        const ok = isAdminUser(data);
        if (ok && (data.user_id || data.id) && data.username) {
          dispatch(
            syncAuthProfile({
              user_id: data.user_id ?? data.id ?? 0,
              username: data.username,
              role: data.role,
              is_platform_admin: data.is_platform_admin,
            }),
          );
        }

        setAllowed(ok);
        setReady(true);
        if (!ok) {
          router.replace(`/LoginScreenUser?next=${loginNext}`);
        }
      } catch {
        if (cancelled) return;
        dispatch(logoutUser());
        dispatch(adminDriversOperationsApi.util.resetApiState());
        dispatch(adminVehicleApi.util.resetApiState());
        setAllowed(false);
        setReady(true);
        router.replace(`/LoginScreenUser?next=${loginNext}`);
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [authHydrated, pathname, router, dispatch]);

  if (!authHydrated || !ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="p-8 text-center text-slate-600">
        {t("adminAccessDenied", "Platform admin access required.")}
      </div>
    );
  }

  return <>{children}</>;
}
