"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import api from "@/services/api";
import { selectUser } from "@/redux/slices/authSlice";
import { isPlatformAdminUser } from "@/utils/postLoginRoute";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (isAdminUser(user)) {
        if (!cancelled) {
          setAllowed(true);
          setReady(true);
        }
        return;
      }

      try {
        const token = JSON.parse(localStorage.getItem("auth_token") || "null");
        if (!token) {
          throw new Error("no token");
        }
        const { data } = await api.get<{
          role?: string;
          is_platform_admin?: boolean;
        }>("/api/auth/me/");
        if (!cancelled) {
          const ok = isAdminUser(data);
          setAllowed(ok);
          setReady(true);
          if (!ok) router.replace("/LoginScreenUser?next=/AdminDashboard");
        }
      } catch {
        if (!cancelled) {
          setAllowed(false);
          setReady(true);
          router.replace("/LoginScreenUser?next=/AdminDashboard");
        }
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [user, router]);

  if (!ready) {
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
