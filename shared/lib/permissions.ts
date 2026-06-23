/** Role helpers aligned with contas.User roles and business memberships. */

export type PlatformRole =
  | 'customer'
  | 'merchant'
  | 'restaurant'
  | 'doctor'
  | 'driver'
  | 'courier'
  | 'host'
  | 'landlord'
  | 'service_provider'
  | 'grocery_store_owner'
  | 'super_admin'
  | 'country_admin'
  | 'city_admin';

const ADMIN_ROLES: PlatformRole[] = [
  'super_admin',
  'country_admin',
  'city_admin',
];

export function isPlatformAdmin(role?: string | null): boolean {
  return !!role && ADMIN_ROLES.includes(role as PlatformRole);
}

export function hasRole(userRole: string | undefined, ...allowed: PlatformRole[]): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole as PlatformRole);
}

export function canAccessBusinessDashboard(
  userRole: string | undefined,
  businessStatus: string,
): boolean {
  if (businessStatus !== 'approved') return false;
  return hasRole(
    userRole,
    'merchant',
    'restaurant',
    'doctor',
    'host',
    'landlord',
    'service_provider',
    'grocery_store_owner',
  );
}
