import type { LoginResult } from "@/redux/slices/authSlice";
import { resolveProviderPortalTarget } from "@/lib/providerRoutes";

const PLATFORM_ADMIN_ROLES = new Set([
  "super_admin",
  "country_admin",
  "city_admin",
  "support",
  "finance_admin",
  "compliance_admin",
  "safety_admin",
]);

export function isPlatformAdminUser(result: Pick<LoginResult, "role" | "is_platform_admin">): boolean {
  if (result.is_platform_admin) {
    return true;
  }
  return Boolean(result.role && PLATFORM_ADMIN_ROLES.has(result.role));
}

export function getPostLoginRoute(result: LoginResult): string {
  if (isPlatformAdminUser(result)) {
    return "/AdminDashboard";
  }
  if (result.is_driver) {
    return "/provider/courier";
  }
  if (result.is_customer) {
    return "/HomeScreen";
  }
  if (result.business_profile) {
    return resolveProviderPortalTarget(result.business_profile.category);
  }
  return "/provider/onboarding";
}

/** Honor ?next= after login when safe (same-origin path only). */
export function resolvePostLoginRoute(
  result: LoginResult,
  next?: string | null,
): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    if (next.toLowerCase() === "/checkout") {
      return "/Checkout";
    }
    return next;
  }
  return getPostLoginRoute(result);
}
