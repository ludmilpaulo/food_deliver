import type { LoginResult } from '@/redux/slices/authSlice';
import { isPlatformAdminUser } from '@/utils/postLoginRoute';

export type DriverOpsAdminRole = NonNullable<LoginResult['role']>;

const READ_ROLES = new Set([
  'super_admin',
  'country_admin',
  'city_admin',
  'support',
  'compliance_admin',
  'safety_admin',
]);

const VERIFICATION_ROLES = new Set([
  'super_admin',
  'country_admin',
  'city_admin',
  'compliance_admin',
]);

const INCIDENT_ROLES = new Set([
  'super_admin',
  'country_admin',
  'city_admin',
  'safety_admin',
]);

const FINANCE_ROLES = new Set(['super_admin', 'country_admin', 'finance_admin']);

const SUSPEND_ROLES = new Set(['super_admin', 'country_admin', 'safety_admin']);

const APPROVE_ROLES = new Set([
  'super_admin',
  'country_admin',
  'city_admin',
  'compliance_admin',
]);

function hasRole(role: string | undefined | null, allowed: Set<string>): boolean {
  if (!role) return false;
  return allowed.has(role);
}

export function canAccessDriverOpsPage(user: Pick<LoginResult, 'role' | 'is_platform_admin'>): boolean {
  return isPlatformAdminUser(user);
}

export function isFinanceOnlyAdmin(role: string | undefined | null): boolean {
  return role === 'finance_admin';
}

export function canViewDriverOpsTracking(
  role: string | undefined | null,
  isPlatformAdmin?: boolean,
): boolean {
  if (isPlatformAdmin) return true;
  return hasRole(role, READ_ROLES);
}

export function canViewDriverVerificationPanels(role: string | undefined | null): boolean {
  return hasRole(role, VERIFICATION_ROLES);
}

export function canViewDriverIncidents(role: string | undefined | null): boolean {
  return hasRole(role, INCIDENT_ROLES);
}

export function canViewDriverPayouts(role: string | undefined | null): boolean {
  return hasRole(role, FINANCE_ROLES);
}

export function canApproveDrivers(role: string | undefined | null): boolean {
  return hasRole(role, APPROVE_ROLES);
}

export function canSuspendDrivers(role: string | undefined | null): boolean {
  return hasRole(role, SUSPEND_ROLES);
}

export function canContactDrivers(role: string | undefined | null): boolean {
  return hasRole(role, READ_ROLES) || hasRole(role, new Set(['support']));
}

export function isScopedAdmin(role: string | undefined | null): boolean {
  return role === 'country_admin' || role === 'city_admin';
}
