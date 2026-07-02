import type { AdminPanelId } from '@/app/AdminDashboard/adminPanels';

export const ADMIN_PANEL_IDS: AdminPanelId[] = [
  'superApp',
  'stores',
  'menus',
  'orders',
  'reports',
  'customers',
  'drivers',
  'partners',
  'kyc',
  'doctorVerification',
  'driverVerification',
  'liveSupport',
  'payouts',
  'platformControl',
  'pricing',
  'translations',
  'backupExport',
];

export function isAdminPanelId(value: string | null | undefined): value is AdminPanelId {
  return Boolean(value && ADMIN_PANEL_IDS.includes(value as AdminPanelId));
}

/** Canonical URL for an admin dashboard panel. */
export function adminPanelUrl(panel: AdminPanelId): string {
  if (panel === 'drivers') return '/admin/drivers';
  return `/AdminDashboard?panel=${panel}`;
}
