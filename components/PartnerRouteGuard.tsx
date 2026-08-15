"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/components/ProtectedPage";
import { selectAuthHydrated, selectUser } from "@/redux/slices/authSlice";
import { useAppSelector } from "@/redux/store";
import { isPlatformAdminUser } from "@/utils/postLoginRoute";

function canAccessPartnerPortal(user: {
  is_customer: boolean;
  is_driver: boolean;
  role?: string;
  is_platform_admin?: boolean;
  business_profile?: unknown;
}): boolean {
  if (user.business_profile) return true;
  if (user.is_driver) return true;
  if (isPlatformAdminUser({ role: user.role, is_platform_admin: user.is_platform_admin })) {
    return true;
  }
  if (!user.is_customer && user.role) return true;
  return false;
}

function PartnerGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const authHydrated = useAppSelector(selectAuthHydrated);
  const allowed = Boolean(user && canAccessPartnerPortal(user));

  useEffect(() => {
    if (!authHydrated || !user) return;
    if (!allowed) {
      router.replace("/HomeScreen");
    }
  }, [allowed, authHydrated, router, user]);

  if (!authHydrated || !user || !allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Checking partner access…
      </div>
    );
  }

  return <>{children}</>;
}

export default function withPartnerAuth<P extends object>(
  Component: React.ComponentType<P>,
) {
  const Gated: React.FC<P> = (props) => (
    <PartnerGate>
      <Component {...props} />
    </PartnerGate>
  );
  Gated.displayName = `withPartnerAuth(${Component.displayName || Component.name || "Component"})`;
  return withAuth(Gated);
}
